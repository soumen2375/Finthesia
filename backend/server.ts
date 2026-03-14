import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import { readFileSync } from 'fs';
import { createHash } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, 'finthesia.db'));

// Initialize Firebase Admin
try {
  const serviceAccount = JSON.parse(readFileSync(path.join(__dirname, 'serviceAccountKey.json'), 'utf-8'));
  initializeApp({
    credential: cert(serviceAccount)
  });
} catch (error) {
  console.error("Failed to initialize Firebase Admin:", error);
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: DecodedIdToken;
    }
  }
}

// Auth Middleware
const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying auth token', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// ---- Input Validation Helpers ----
function validateString(val: unknown, fieldName: string, maxLen = 255): string | null {
  if (typeof val !== 'string' || val.trim().length === 0) return `${fieldName} is required and must be a non-empty string`;
  if (val.length > maxLen) return `${fieldName} must be ${maxLen} characters or fewer`;
  return null;
}

function validateNumber(val: unknown, fieldName: string, { min, max }: { min?: number; max?: number } = {}): string | null {
  if (val === undefined || val === null) return `${fieldName} is required`;
  const num = Number(val);
  if (isNaN(num)) return `${fieldName} must be a valid number`;
  if (min !== undefined && num < min) return `${fieldName} must be at least ${min}`;
  if (max !== undefined && num > max) return `${fieldName} must be at most ${max}`;
  return null;
}

function validateOptionalNumber(val: unknown, fieldName: string, { min, max }: { min?: number; max?: number } = {}): string | null {
  if (val === undefined || val === null || val === '') return null;
  return validateNumber(val, fieldName, { min, max });
}

function firstError(...errors: (string | null)[]): string | null {
  return errors.find(e => e !== null) || null;
}

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    current_value DECIMAL(15, 2) NOT NULL,
    notes TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS liabilities (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    balance DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2),
    minimum_payment DECIMAL(15, 2),
    due_date TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    bank_name TEXT,
    card_variant TEXT,
    name TEXT NOT NULL,
    card_type TEXT NOT NULL,
    credit_limit DECIMAL(15, 2) NOT NULL,
    available_credit DECIMAL(15, 2) NOT NULL,
    billing_cycle TEXT,
    payment_due_date TEXT,
    total_amount_due DECIMAL(15, 2),
    apr DECIMAL(5, 2),
    last4 TEXT,
    color TEXT,
    annual_fee DECIMAL(15, 2) DEFAULT 0,
    joining_fee DECIMAL(15, 2) DEFAULT 0,
    reward_points INTEGER DEFAULT 0,
    cashback_percent DECIMAL(5, 2) DEFAULT 0,
    monthly_budget DECIMAL(15, 2) DEFAULT 0,
    statement_generation_day INTEGER,
    payment_due_day INTEGER,
    minimum_amount_due DECIMAL(15, 2) DEFAULT 0,
    utilization_alert_threshold DECIMAL(5, 2) DEFAULT 70,
    remind_before_days INTEGER DEFAULT 3,
    remind_on_due_date INTEGER DEFAULT 1,
    allow_manual_override INTEGER DEFAULT 0,
    isActive INTEGER DEFAULT 1,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    amount DECIMAL(15, 2) NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    transaction_date TEXT NOT NULL,
    type TEXT NOT NULL,
    card_id TEXT,
    liability_id TEXT,
    isActive INTEGER DEFAULT 1,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS emis (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    card_id TEXT NOT NULL,
    description TEXT NOT NULL,
    original_amount DECIMAL(15, 2) NOT NULL,
    remaining_amount DECIMAL(15, 2) NOT NULL,
    monthly_payment DECIMAL(15, 2) NOT NULL,
    remaining_months INTEGER NOT NULL,
    next_due_date TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(card_id) REFERENCES cards(id)
  );

  CREATE TABLE IF NOT EXISTS banks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    account_type TEXT NOT NULL,
    nickname TEXT,
    balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    notes TEXT,
    bank_provider TEXT,
    provider_account_id TEXT,
    last_synced_at DATETIME,
    sync_status TEXT DEFAULT 'manual',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bank_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    bank_id TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    merchant TEXT,
    category TEXT,
    transaction_date TEXT NOT NULL,
    transaction_type TEXT NOT NULL,
    description TEXT,
    notes TEXT,
    source TEXT DEFAULT 'manual',
    csv_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(bank_id) REFERENCES banks(id)
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    billing_cycle TEXT DEFAULT 'monthly',
    next_payment_date TEXT,
    bank_id TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(bank_id) REFERENCES banks(id)
  );

  CREATE TABLE IF NOT EXISTS financial_health (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    savings_rate DECIMAL(5,2),
    debt_ratio DECIMAL(5,2),
    emergency_fund_ratio DECIMAL(5,2),
    spending_discipline DECIMAL(5,2),
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS spending_predictions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    predicted_month TEXT NOT NULL,
    predicted_total DECIMAL(15,2),
    predicted_savings DECIMAL(15,2),
    category_predictions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS net_worth_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
    total_assets DECIMAL(15, 2) NOT NULL,
    total_liabilities DECIMAL(15, 2) NOT NULL,
    net_worth DECIMAL(15, 2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Add user_id to all tables if it doesn't exist
const tables = ['assets', 'liabilities', 'cards', 'transactions', 'emis'];
tables.forEach(table => {
  const info = db.pragma(`table_info(${table})`) as any[];
  if (!info.some(col => col.name === 'user_id')) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN user_id TEXT`);
    // Default existing records to a generic user_id if needed, but here we just add the column
  }
});

// Migration: Add missing columns to cards table if they don't exist
const tableInfo = db.pragma('table_info(cards)') as any[];
const columns = tableInfo.map(col => col.name);

if (!columns.includes('bank_name')) {
  db.exec('ALTER TABLE cards ADD COLUMN bank_name TEXT');
}
if (!columns.includes('card_variant')) {
  db.exec('ALTER TABLE cards ADD COLUMN card_variant TEXT');
}
if (!columns.includes('available_credit')) {
  // If available_credit is missing, check if current_balance exists and rename it
  if (columns.includes('current_balance')) {
    db.exec('ALTER TABLE cards RENAME COLUMN current_balance TO available_credit');
  } else {
    db.exec('ALTER TABLE cards ADD COLUMN available_credit DECIMAL(15, 2) DEFAULT 0 NOT NULL');
  }
}
if (!columns.includes('billing_cycle')) {
  db.exec('ALTER TABLE cards ADD COLUMN billing_cycle TEXT');
}
if (!columns.includes('total_amount_due')) {
  db.exec('ALTER TABLE cards ADD COLUMN total_amount_due DECIMAL(15, 2)');
}
if (!columns.includes('annual_fee')) {
  db.exec('ALTER TABLE cards ADD COLUMN annual_fee DECIMAL(15, 2) DEFAULT 0');
}
if (!columns.includes('joining_fee')) {
  db.exec('ALTER TABLE cards ADD COLUMN joining_fee DECIMAL(15, 2) DEFAULT 0');
}
if (!columns.includes('reward_points')) {
  db.exec('ALTER TABLE cards ADD COLUMN reward_points INTEGER DEFAULT 0');
}
if (!columns.includes('cashback_percent')) {
  db.exec('ALTER TABLE cards ADD COLUMN cashback_percent DECIMAL(5, 2) DEFAULT 0');
}
if (!columns.includes('monthly_budget')) {
  db.exec('ALTER TABLE cards ADD COLUMN monthly_budget DECIMAL(15, 2) DEFAULT 0');
}
if (!columns.includes('isActive')) {
  db.exec('ALTER TABLE cards ADD COLUMN isActive INTEGER DEFAULT 1');
}
if (!columns.includes('statement_generation_day')) {
  db.exec('ALTER TABLE cards ADD COLUMN statement_generation_day INTEGER');
}
if (!columns.includes('payment_due_day')) {
  db.exec('ALTER TABLE cards ADD COLUMN payment_due_day INTEGER');
}
if (!columns.includes('minimum_amount_due')) {
  db.exec('ALTER TABLE cards ADD COLUMN minimum_amount_due DECIMAL(15, 2) DEFAULT 0');
}
if (!columns.includes('utilization_alert_threshold')) {
  db.exec('ALTER TABLE cards ADD COLUMN utilization_alert_threshold DECIMAL(5, 2) DEFAULT 70');
}
if (!columns.includes('remind_before_days')) {
  db.exec('ALTER TABLE cards ADD COLUMN remind_before_days INTEGER DEFAULT 3');
}
if (!columns.includes('remind_on_due_date')) {
  db.exec('ALTER TABLE cards ADD COLUMN remind_on_due_date INTEGER DEFAULT 1');
}
if (!columns.includes('allow_manual_override')) {
  db.exec('ALTER TABLE cards ADD COLUMN allow_manual_override INTEGER DEFAULT 0');
}

// Migration: Add missing columns to liabilities table
const liabInfo = db.pragma('table_info(liabilities)') as any[];
const liabCols = liabInfo.map((col: any) => col.name);
const liabMigrations: [string, string][] = [
  ['provider', 'TEXT'],
  ['liability_type', 'TEXT'],
  ['credit_limit', 'DECIMAL(15,2)'],
  ['tenure_months', 'INTEGER'],
  ['remaining_months', 'INTEGER'],
  ['property_value', 'DECIMAL(15,2)'],
  ['moratorium_status', 'TEXT'],
];
liabMigrations.forEach(([col, dtype]) => {
  if (!liabCols.includes(col)) {
    db.exec(`ALTER TABLE liabilities ADD COLUMN ${col} ${dtype}`);
  }
});

// Migration: Add subcategory to assets table
const assetInfo = db.pragma('table_info(assets)') as any[];
const assetCols = assetInfo.map((col: any) => col.name);
if (!assetCols.includes('subcategory')) {
  db.exec('ALTER TABLE assets ADD COLUMN subcategory TEXT');
}

// Migration: Add linked_card_id to liabilities table
if (!liabCols.includes('linked_card_id')) {
  db.exec('ALTER TABLE liabilities ADD COLUMN linked_card_id TEXT');
}

// Migration: Add liability_id to transactions table
const txInfo = db.pragma('table_info(transactions)') as any[];
if (!txInfo.some(col => col.name === 'liability_id')) {
  db.exec('ALTER TABLE transactions ADD COLUMN liability_id TEXT');
}

// Universal Soft Deletes Migration
const TablesToMigrate = ['assets', 'liabilities', 'transactions', 'emis', 'banks', 'bank_transactions', 'subscriptions'];
TablesToMigrate.forEach(table => {
  const info = db.pragma(`table_info(${table})`) as any[];
  if (!info.some(col => col.name === 'isActive')) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN isActive INTEGER DEFAULT 1`);
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors({
    origin: [
      'https://finthesia-iota.vercel.app',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }));
  app.use(express.json());

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.get('/api/assets', authenticateUser, (req, res) => {
    try {
      const uid = req.user?.uid;
      // 1. Get manual assets
      const manualAssets = db.prepare('SELECT * FROM assets WHERE user_id = ? AND isActive = 1 ORDER BY updated_at DESC').all(uid) as any[];

      // 2. Get bank balances and inject as assets
      const banks = db.prepare('SELECT * FROM banks WHERE user_id = ? AND isActive = 1').all(uid) as any[];
      const bankAssets = banks.map(bank => ({
        id: `bank-asset-${bank.id}`,
        user_id: uid,
        name: `${bank.bank_name} - ${bank.nickname || bank.account_type}`,
        category: 'bank_accounts',
        subcategory: bank.account_type,
        current_value: bank.balance,
        notes: bank.notes,
        updated_at: bank.updated_at
      }));

      res.json([...manualAssets, ...bankAssets]);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/assets', authenticateUser, (req, res) => {
    try {
      const { id, name, category, current_value, notes, subcategory } = req.body;
      const err = firstError(
        validateString(id, 'id'),
        validateString(name, 'name'),
        validateString(category, 'category', 50),
        validateNumber(current_value, 'current_value', { min: 0 })
      );
      if (err) return res.status(400).json({ error: err });
      const stmt = db.prepare('INSERT INTO assets (id, user_id, name, category, current_value, notes, subcategory, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, 1)');
      stmt.run(id, req.user?.uid, name.trim(), category.trim(), Number(current_value), notes || null, subcategory?.trim() || null);
      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Failed to add asset:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.put('/api/assets/:id', authenticateUser, (req, res) => {
    try {
      const { name, category, current_value, notes, subcategory } = req.body;
      const err = firstError(
        validateString(name, 'name'),
        validateString(category, 'category', 50),
        validateNumber(current_value, 'current_value', { min: 0 })
      );
      if (err) return res.status(400).json({ error: err });
      const result = db.prepare(
        'UPDATE assets SET name = ?, category = ?, current_value = ?, notes = ?, subcategory = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'
      ).run(name.trim(), category.trim(), Number(current_value), notes || null, subcategory?.trim() || null, req.params.id, req.user?.uid);
      if (result.changes === 0) return res.status(404).json({ error: 'Asset not found or unauthorized' });
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to update asset:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.delete('/api/assets/:id', authenticateUser, (req, res) => {
    try {
      const result = db.prepare('UPDATE assets SET isActive = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?').run(req.params.id, req.user?.uid);
      if (result.changes === 0) return res.status(404).json({ error: 'Asset not found or unauthorized' });
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete asset:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/cards', authenticateUser, (req, res) => {
    try {
      const cards = db.prepare('SELECT * FROM cards WHERE isActive = 1 AND user_id = ? ORDER BY updated_at DESC').all(req.user?.uid);
      res.json(cards);
    } catch (error) {
      console.error('Failed to fetch cards:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/cards', authenticateUser, (req, res) => {
    try {
      const {
        id, bank_name, card_variant, name, card_type,
        credit_limit, available_credit, billing_cycle,
        payment_due_date, total_amount_due, apr, last4, color,
        annual_fee, joining_fee, reward_points, cashback_percent,
        monthly_budget, statement_generation_day, payment_due_day,
        minimum_amount_due, utilization_alert_threshold,
        remind_before_days, remind_on_due_date, allow_manual_override
      } = req.body;
      if (!id || !name || !card_type || credit_limit === undefined || available_credit === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const stmt = db.prepare(`
        INSERT INTO cards (
          id, user_id, bank_name, card_variant, name, card_type, 
          credit_limit, available_credit, billing_cycle, 
          payment_due_date, total_amount_due, apr, last4, color,
          annual_fee, joining_fee, reward_points, cashback_percent,
          monthly_budget, statement_generation_day, payment_due_day,
          minimum_amount_due, utilization_alert_threshold,
          remind_before_days, remind_on_due_date, allow_manual_override,
          isActive
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `);
      stmt.run(
        id, req.user?.uid, bank_name, card_variant, name, card_type,
        credit_limit, available_credit, billing_cycle,
        payment_due_date, total_amount_due, apr, last4, color,
        annual_fee || 0, joining_fee || 0, reward_points || 0, cashback_percent || 0,
        monthly_budget || 0, statement_generation_day, payment_due_day,
        minimum_amount_due || 0, utilization_alert_threshold || 70,
        remind_before_days || 3, remind_on_due_date === false ? 0 : 1,
        allow_manual_override ? 1 : 0
      );
      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Failed to add card:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.put('/api/cards/:id', authenticateUser, (req, res) => {
    try {
      const {
        bank_name, card_variant, name, card_type,
        credit_limit, available_credit, billing_cycle,
        payment_due_date, total_amount_due, apr, last4, color,
        annual_fee, joining_fee, reward_points, cashback_percent,
        monthly_budget, statement_generation_day, payment_due_day,
        minimum_amount_due, utilization_alert_threshold,
        remind_before_days, remind_on_due_date, allow_manual_override,
        isActive
      } = req.body;
      const stmt = db.prepare(`
        UPDATE cards SET 
          bank_name = ?, card_variant = ?, name = ?, card_type = ?, credit_limit = ?, 
          available_credit = ?, billing_cycle = ?, payment_due_date = ?, 
          total_amount_due = ?, apr = ?, last4 = ?, color = ?,
          annual_fee = ?, joining_fee = ?, reward_points = ?, cashback_percent = ?,
          monthly_budget = ?, statement_generation_day = ?, payment_due_day = ?,
          minimum_amount_due = ?, utilization_alert_threshold = ?,
          remind_before_days = ?, remind_on_due_date = ?, allow_manual_override = ?,
          isActive = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `);
      const result = stmt.run(
        bank_name, card_variant, name, card_type,
        credit_limit, available_credit, billing_cycle,
        payment_due_date, total_amount_due, apr, last4, color,
        annual_fee || 0, joining_fee || 0, reward_points || 0, cashback_percent || 0,
        monthly_budget || 0, statement_generation_day, payment_due_day,
        minimum_amount_due || 0, utilization_alert_threshold || 70,
        remind_before_days || 3, remind_on_due_date === false ? 0 : 1,
        allow_manual_override ? 1 : 0,
        isActive === undefined ? 1 : (isActive ? 1 : 0),
        req.params.id,
        req.user?.uid
      );
      if (result.changes === 0) return res.status(404).json({ error: 'Card not found or unauthorized' });
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to update card:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.delete('/api/cards/:id', authenticateUser, (req, res) => {
    try {
      const result = db.prepare('UPDATE cards SET isActive = 0 WHERE id = ? AND user_id = ?').run(req.params.id, req.user?.uid);
      if (result.changes === 0) return res.status(404).json({ error: 'Card not found or unauthorized' });
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to soft delete card:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/cards/:id/emis', authenticateUser, (req, res) => {
    try {
      const emis = db.prepare('SELECT * FROM emis WHERE card_id = ? AND user_id = ? ORDER BY next_due_date ASC').all(req.params.id, req.user?.uid);
      res.json(emis);
    } catch (error) {
      console.error('Failed to fetch EMIs:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/emis', authenticateUser, (req, res) => {
    try {
      const {
        id, card_id, description, original_amount,
        remaining_amount, monthly_payment, remaining_months, next_due_date
      } = req.body;
      const uid = req.user?.uid;
      const val = Number(original_amount);

      db.transaction(() => {
        const stmt = db.prepare(`
          INSERT INTO emis (
            id, user_id, card_id, description, original_amount, 
            remaining_amount, monthly_payment, remaining_months, next_due_date, isActive
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `);
        stmt.run(
          id, uid, card_id, description, val,
          remaining_amount, monthly_payment, remaining_months, next_due_date
        );

        // Block principal from card limit
        db.prepare('UPDATE cards SET available_credit = available_credit - ? WHERE id = ? AND user_id = ?').run(val, card_id, uid);
      })();

      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Failed to add EMI:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/emis/:id/foreclose', authenticateUser, (req, res) => {
    try {
      const uid = req.user?.uid;
      const emi = db.prepare('SELECT * FROM emis WHERE id = ? AND user_id = ?').get(req.params.id, uid) as any;
      if (!emi) return res.status(404).json({ error: 'EMI not found or unauthorized' });

      db.transaction(() => {
        // 1. Mark as inactive
        db.prepare('UPDATE emis SET isActive = 0 WHERE id = ?').run(req.params.id);

        // 2. Release blocked card limit
        db.prepare('UPDATE cards SET available_credit = available_credit + ? WHERE id = ? AND user_id = ?').run(emi.remaining_amount, emi.card_id, uid);

        // 3. Create expense transaction
        const txId = generateId();
        db.prepare('INSERT INTO transactions (id, user_id, amount, category, description, transaction_date, type, card_id, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)')
          .run(txId, uid, emi.remaining_amount, 'EMI Foreclosure', `Foreclosure: ${emi.description}`, new Date().toISOString().split('T')[0], 'expense', emi.card_id);
      })();

      res.json({ success: true });
    } catch (error) {
      console.error('Failed to foreclose EMI:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.delete('/api/emis/:id', authenticateUser, (req, res) => {
    try {
      const uid = req.user?.uid;
      const result = db.prepare('UPDATE emis SET isActive = 0 WHERE id = ? AND user_id = ?').run(req.params.id, uid);
      if (result.changes === 0) return res.status(404).json({ error: 'EMI not found or unauthorized' });
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete EMI:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/liabilities', authenticateUser, (req, res) => {
    try {
      const uid = req.user?.uid;
      // 1. Get manual liabilities
      const manualLiabilities = db.prepare('SELECT * FROM liabilities WHERE user_id = ? AND isActive = 1 ORDER BY updated_at DESC').all(uid) as any[];

      // 2. Get card utilization and inject as liabilities
      const cards = db.prepare('SELECT * FROM cards WHERE user_id = ? AND isActive = 1').all(uid) as any[];

      // Interest Compounding Simulation
      const now = new Date();
      manualLiabilities.forEach(l => {
        if (l.apr > 0 && l.balance > 0) {
          const lastUpdate = new Date(l.updated_at);
          const diffMonths = (now.getFullYear() - lastUpdate.getFullYear()) * 12 + (now.getMonth() - lastUpdate.getMonth());
          if (diffMonths >= 1) {
            const interest = l.balance * (l.apr / 100 / 12) * diffMonths;
            db.prepare('UPDATE liabilities SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(interest, l.id);
            l.balance += interest;
          }
        }
      });

      const cardLiabilities = cards.map(card => {
        const debt = Number(card.credit_limit) - Number(card.available_credit);
        return {
          id: `card-debt-${card.id}`,
          user_id: uid,
          name: `${card.bank_name} ${card.name}`,
          type: 'credit_card',
          liability_type: 'credit_card',
          balance: debt,
          provider: card.bank_name,
          due_date: card.payment_due_date,
          credit_limit: card.credit_limit,
          linked_card_id: card.id,
          updated_at: card.updated_at
        };
      }).filter(lib => lib.balance > 0);

      res.json([...manualLiabilities, ...cardLiabilities]);
    } catch (error) {
      console.error('Failed to fetch liabilities:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/liabilities', authenticateUser, (req, res) => {
    try {
      const { id, name, type, balance, interest_rate, minimum_payment, due_date, provider, liability_type, credit_limit, tenure_months, remaining_months, property_value, moratorium_status, linked_card_id } = req.body;
      const err = firstError(
        validateString(id, 'id'),
        validateString(name, 'name'),
        validateString(type, 'type', 50),
        validateNumber(balance, 'balance', { min: 0 }),
        validateOptionalNumber(interest_rate, 'interest_rate', { min: 0, max: 100 }),
        validateOptionalNumber(minimum_payment, 'minimum_payment', { min: 0 })
      );
      if (err) return res.status(400).json({ error: err });
      const stmt = db.prepare(
        `INSERT INTO liabilities (id, user_id, name, type, balance, interest_rate, minimum_payment, due_date, provider, liability_type, credit_limit, tenure_months, remaining_months, property_value, moratorium_status, linked_card_id, isActive)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`
      );
      stmt.run(id, req.user?.uid, name.trim(), type.trim(), Number(balance), interest_rate || null, minimum_payment || null, due_date || null, provider?.trim() || null, liability_type || type.trim(), credit_limit || null, tenure_months || null, remaining_months || null, property_value || null, moratorium_status || null, linked_card_id || null);
      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Failed to add liability:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.put('/api/liabilities/:id', authenticateUser, (req, res) => {
    try {
      const { name, type, balance, interest_rate, minimum_payment, due_date, provider, liability_type, credit_limit, tenure_months, remaining_months, property_value, moratorium_status, linked_card_id } = req.body;
      const err = firstError(
        validateString(name, 'name'),
        validateString(type, 'type', 50),
        validateNumber(balance, 'balance', { min: 0 }),
        validateOptionalNumber(interest_rate, 'interest_rate', { min: 0, max: 100 }),
        validateOptionalNumber(minimum_payment, 'minimum_payment', { min: 0 })
      );
      if (err) return res.status(400).json({ error: err });
      const result = db.prepare(
        `UPDATE liabilities SET name = ?, type = ?, balance = ?, interest_rate = ?, minimum_payment = ?, due_date = ?, provider = ?, liability_type = ?, credit_limit = ?, tenure_months = ?, remaining_months = ?, property_value = ?, moratorium_status = ?, linked_card_id = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND user_id = ?`
      ).run(name.trim(), type.trim(), Number(balance), interest_rate || null, minimum_payment || null, due_date || null, provider?.trim() || null, liability_type || type.trim(), credit_limit || null, tenure_months || null, remaining_months || null, property_value || null, moratorium_status || null, linked_card_id || null, req.params.id, req.user?.uid);
      if (result.changes === 0) return res.status(404).json({ error: 'Liability not found or unauthorized' });
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to update liability:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.delete('/api/liabilities/:id', authenticateUser, (req, res) => {
    try {
      const result = db.prepare('UPDATE liabilities SET isActive = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?').run(req.params.id, req.user?.uid);
      if (result.changes === 0) return res.status(404).json({ error: 'Liability not found or unauthorized' });
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete liability:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // --- Debt Summary ---
  app.get('/api/debt-summary', authenticateUser, (req, res) => {
    try {
      const uid = req.user?.uid;
      const allLiabilities = db.prepare('SELECT * FROM liabilities WHERE user_id = ? AND isActive = 1 ORDER BY balance DESC').all(uid) as any[];

      const totalLiabilities = allLiabilities.reduce((s: number, l: any) => s + (Number(l.balance) || 0), 0);
      const totalMonthlyPayments = allLiabilities.reduce((s: number, l: any) => s + (Number(l.minimum_payment) || 0), 0);

      // Credit utilization
      const creditCards = allLiabilities.filter((l: any) => l.type === 'credit_card' || l.liability_type === 'credit_card');
      const totalCreditUsed = creditCards.reduce((s: number, l: any) => s + (Number(l.balance) || 0), 0);
      const totalCreditLimit = creditCards.reduce((s: number, l: any) => s + (Number(l.credit_limit) || 0), 0);
      const creditUtilization = totalCreditLimit > 0 ? Math.round((totalCreditUsed / totalCreditLimit) * 100) : 0;

      // Category breakdown
      const categories: Record<string, { total: number; count: number; monthly: number }> = {};
      allLiabilities.forEach((l: any) => {
        const cat = l.liability_type || l.type || 'other';
        if (!categories[cat]) categories[cat] = { total: 0, count: 0, monthly: 0 };
        categories[cat].total += Number(l.balance) || 0;
        categories[cat].count++;
        categories[cat].monthly += Number(l.minimum_payment) || 0;
      });

      // Get income for debt ratio
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const cutoff = threeMonthsAgo.toISOString().split('T')[0];
      const income = db.prepare(
        'SELECT COALESCE(SUM(amount), 0) as total FROM bank_transactions WHERE user_id = ? AND transaction_type = ? AND transaction_date >= ?'
      ).get(uid, 'credit', cutoff) as any;
      const monthlyIncome = (income?.total || 0) / 3;
      const debtRatio = monthlyIncome > 0 ? Math.round((totalMonthlyPayments / monthlyIncome) * 100) : 0;

      res.json({
        total_liabilities: totalLiabilities,
        total_monthly_payments: totalMonthlyPayments,
        credit_utilization: creditUtilization,
        total_credit_used: totalCreditUsed,
        total_credit_limit: totalCreditLimit,
        debt_ratio: debtRatio,
        monthly_income: Math.round(monthlyIncome),
        category_breakdown: categories,
        liability_count: allLiabilities.length
      });
    } catch (error) {
      console.error('Failed to fetch debt summary:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/transactions', authenticateUser, (req, res) => {
    try {
      const transactions = db.prepare('SELECT * FROM transactions WHERE user_id = ? AND isActive = 1 ORDER BY transaction_date DESC').all(req.user?.uid);
      res.json(transactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/transactions', authenticateUser, (req, res) => {
    try {
      const { id, amount, category, description, transaction_date, type, card_id, liability_id } = req.body;
      const validTypes = ['income', 'expense', 'payment', 'spend'];
      const err = firstError(
        validateString(id, 'id'),
        validateNumber(amount, 'amount', { min: 0 }),
        validateString(category, 'category', 100),
        validateString(transaction_date, 'transaction_date'),
        validateString(type, 'type', 20)
      );
      if (err) return res.status(400).json({ error: err });
      if (!validTypes.includes(type)) return res.status(400).json({ error: `type must be one of: ${validTypes.join(', ')}` });

      const uid = req.user?.uid;
      const val = Number(amount);

      db.transaction(() => {
        const stmt = db.prepare('INSERT INTO transactions (id, user_id, amount, category, description, transaction_date, type, card_id, liability_id, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)');
        stmt.run(id, uid, val, category.trim(), description || null, transaction_date.trim(), type.trim(), card_id || null, liability_id || null);

        // Synchronous Sync Logic
        if (card_id && type === 'spend') {
          db.prepare('UPDATE cards SET available_credit = available_credit - ? WHERE id = ? AND user_id = ?').run(val, card_id, uid);

          // Reward Accrual
          const card = db.prepare('SELECT cashback_percent FROM cards WHERE id = ?').get(card_id) as any;
          if (card && card.cashback_percent > 0) {
            const rewards = Math.round(val * (card.cashback_percent / 100));
            if (rewards > 0) {
              db.prepare('UPDATE cards SET reward_points = reward_points + ? WHERE id = ?').run(rewards, card_id);
            }
          }
        } else if (liability_id && type === 'payment') {
          db.prepare('UPDATE liabilities SET balance = balance - ? WHERE id = ?').run(val, liability_id);
        } else if (!card_id && !liability_id) {
          // Cash Sync
          let cashAsset = db.prepare("SELECT id FROM assets WHERE user_id = ? AND category = 'bank_accounts' AND subcategory = 'Cash Wallet' AND isActive = 1").get(uid) as any;
          if (!cashAsset) {
            const assetId = generateId();
            db.prepare("INSERT INTO assets (id, user_id, name, category, subcategory, current_value, isActive) VALUES (?, ?, ?, ?, ?, ?, 1)")
              .run(assetId, uid, 'Cash Wallet', 'bank_accounts', 'Cash Wallet', 0);
            cashAsset = { id: assetId };
          }
          const adjustment = type === 'income' ? val : -val;
          db.prepare('UPDATE assets SET current_value = current_value + ? WHERE id = ?').run(adjustment, cashAsset.id);
        }
      })();

      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Failed to add transaction:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.put('/api/transactions/:id', authenticateUser, (req, res) => {
    try {
      const { amount, category, description, transaction_date, type, card_id, liability_id } = req.body;
      const uid = req.user?.uid;
      const oldTx = db.prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?').get(req.params.id, uid) as any;
      if (!oldTx) return res.status(404).json({ error: 'Transaction not found or unauthorized' });

      db.transaction(() => {
        // 1. Reverse old sync
        const oldVal = Number(oldTx.amount);
        if (oldTx.card_id && oldTx.type === 'spend') {
          db.prepare('UPDATE cards SET available_credit = available_credit + ? WHERE id = ? AND user_id = ?').run(oldVal, oldTx.card_id, uid);
        } else if (oldTx.liability_id && oldTx.type === 'payment') {
          db.prepare('UPDATE liabilities SET balance = balance + ? WHERE id = ?').run(oldVal, oldTx.liability_id);
        } else if (!oldTx.card_id && !oldTx.liability_id) {
          const cashAsset = db.prepare("SELECT id FROM assets WHERE user_id = ? AND category = 'bank_accounts' AND subcategory = 'Cash Wallet' AND isActive = 1").get(uid) as any;
          if (cashAsset) {
            const adj = oldTx.type === 'income' ? -oldVal : oldVal;
            db.prepare('UPDATE assets SET current_value = current_value + ? WHERE id = ?').run(adj, cashAsset.id);
          }
        }

        // 2. Apply new sync
        const newVal = Number(amount);
        if (card_id && type === 'spend') {
          db.prepare('UPDATE cards SET available_credit = available_credit - ? WHERE id = ? AND user_id = ?').run(newVal, card_id, uid);
        } else if (liability_id && type === 'payment') {
          db.prepare('UPDATE liabilities SET balance = balance - ? WHERE id = ?').run(newVal, liability_id);
        } else if (!card_id && !liability_id) {
          let cashAsset = db.prepare("SELECT id FROM assets WHERE user_id = ? AND category = 'bank_accounts' AND subcategory = 'Cash Wallet' AND isActive = 1").get(uid) as any;
          if (!cashAsset && newVal !== 0) {
            const assetId = generateId();
            db.prepare("INSERT INTO assets (id, user_id, name, category, subcategory, current_value, isActive) VALUES (?, ?, ?, ?, ?, ?, 1)")
              .run(assetId, uid, 'Cash Wallet', 'bank_accounts', 'Cash Wallet', 0);
            cashAsset = { id: assetId };
          }
          if (cashAsset) {
            const adj = type === 'income' ? newVal : -newVal;
            db.prepare('UPDATE assets SET current_value = current_value + ? WHERE id = ?').run(adj, cashAsset.id);
          }
        }

        // 3. Update record
        db.prepare(
          'UPDATE transactions SET amount = ?, category = ?, description = ?, transaction_date = ?, type = ?, card_id = ?, liability_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'
        ).run(newVal, category?.trim(), description || null, transaction_date?.trim(), type, card_id || null, liability_id || null, req.params.id, uid);
      })();

      res.json({ success: true });
    } catch (error) {
      console.error('Failed to update transaction:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.delete('/api/transactions/:id', authenticateUser, (req, res) => {
    try {
      const uid = req.user?.uid;
      const tx = db.prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?').get(req.params.id, uid) as any;
      if (!tx) return res.status(404).json({ error: 'Transaction not found or unauthorized' });

      db.transaction(() => {
        db.prepare('UPDATE transactions SET isActive = 0 WHERE id = ?').run(req.params.id);

        // Reverse Sync Logic
        const val = Number(tx.amount);
        if (tx.card_id && tx.type === 'spend') {
          db.prepare('UPDATE cards SET available_credit = available_credit + ? WHERE id = ? AND user_id = ?').run(val, tx.card_id, uid);
        } else if (tx.liability_id && tx.type === 'payment') {
          db.prepare('UPDATE liabilities SET balance = balance + ? WHERE id = ?').run(val, tx.liability_id);
        } else if (!tx.card_id && !tx.liability_id) {
          const cashAsset = db.prepare("SELECT id FROM assets WHERE user_id = ? AND category = 'bank_accounts' AND subcategory = 'Cash Wallet' AND isActive = 1").get(uid) as any;
          if (cashAsset) {
            const adjustment = tx.type === 'income' ? -val : val;
            db.prepare('UPDATE assets SET current_value = current_value + ? WHERE id = ?').run(adjustment, cashAsset.id);
          }
        }
      })();

      res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // --- Snapshot Architecture ---
  function recordUserSnapshot(uid: string | undefined) {
    if (!uid) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const existing = db.prepare('SELECT id FROM net_worth_history WHERE user_id = ? AND date = ?').get(uid, today);
      if (existing) return;

      const assetsTotal = db.prepare('SELECT SUM(current_value) as total FROM assets WHERE user_id = ? AND isActive = 1').get(uid) as any;
      const bankTotal = db.prepare('SELECT SUM(balance) as total FROM banks WHERE user_id = ? AND isActive = 1').get(uid) as any;
      const liabilitiesTotal = db.prepare('SELECT SUM(balance) as total FROM liabilities WHERE user_id = ? AND isActive = 1').get(uid) as any;
      const cardsTotal = db.prepare('SELECT SUM(credit_limit - available_credit) as total FROM cards WHERE isActive = 1 AND user_id = ?').get(uid) as any;

      const totalAssets = (assetsTotal.total || 0) + (bankTotal.total || 0);
      const totalLiabilities = (liabilitiesTotal.total || 0) + (cardsTotal.total || 0);
      const netWorth = totalAssets - totalLiabilities;

      db.prepare('INSERT INTO net_worth_history (id, user_id, date, total_assets, total_liabilities, net_worth) VALUES (?, ?, ?, ?, ?, ?)')
        .run(generateId(), uid, today, totalAssets, totalLiabilities, netWorth);
    } catch (e) {
      console.error('Snapshot failed for user:', uid, e);
    }
  }

  app.get('/api/net-worth/history', authenticateUser, (req, res) => {
    try {
      const uid = req.user?.uid;
      // Auto-snapshot for today if missing
      recordUserSnapshot(uid);

      const history = db.prepare('SELECT * FROM net_worth_history WHERE user_id = ? ORDER BY date ASC').all(uid);
      res.json(history);
    } catch (error) {
      console.error('Failed to fetch net worth history:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/net-worth', authenticateUser, (req, res) => {
    try {
      const uid = req.user?.uid;
      const assetsTotal = db.prepare('SELECT SUM(current_value) as total FROM assets WHERE user_id = ? AND isActive = 1').get(uid) as any;
      const bankTotal = db.prepare('SELECT SUM(balance) as total FROM banks WHERE user_id = ? AND isActive = 1').get(uid) as any;
      const liabilitiesTotal = db.prepare('SELECT SUM(balance) as total FROM liabilities WHERE user_id = ? AND isActive = 1').get(uid) as any;
      const cardsTotal = db.prepare('SELECT SUM(credit_limit - available_credit) as total FROM cards WHERE isActive = 1 AND user_id = ?').get(uid) as any;

      const totalAssets = (assetsTotal.total || 0) + (bankTotal.total || 0);
      const totalLiabilities = (liabilitiesTotal.total || 0) + (cardsTotal.total || 0);

      res.json({
        totalAssets,
        totalLiabilities,
        netWorth: totalAssets - totalLiabilities
      });
    } catch (error) {
      console.error('Failed to fetch net worth:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // =============================================
  // BANK & FINANCIAL INTELLIGENCE MODULE ROUTES
  // =============================================

  // --- Category auto-detection keywords ---
  const CATEGORY_KEYWORDS: Record<string, string[]> = {
    'Food': ['swiggy', 'zomato', 'restaurant', 'food', 'cafe', 'pizza', 'burger', 'dominos', 'mcdonald', 'kfc', 'starbucks', 'dunkin'],
    'Transport': ['uber', 'ola', 'rapido', 'metro', 'fuel', 'petrol', 'diesel', 'parking', 'toll', 'irctc', 'railway'],
    'Shopping': ['amazon', 'flipkart', 'myntra', 'ajio', 'shopping', 'mall', 'meesho', 'nykaa', 'reliance'],
    'Bills': ['electricity', 'water', 'gas', 'broadband', 'wifi', 'recharge', 'mobile', 'airtel', 'jio', 'vi', 'bsnl', 'rent'],
    'Entertainment': ['netflix', 'spotify', 'disney', 'hotstar', 'prime', 'youtube', 'gaming', 'movie', 'pvr', 'inox', 'bookmyshow'],
    'Investment': ['mutual fund', 'sip', 'stock', 'zerodha', 'groww', 'investment', 'upstox', 'kuvera', 'smallcase'],
    'Salary': ['salary', 'wages', 'payroll', 'stipend'],
    'Transfer': ['transfer', 'neft', 'rtgs', 'imps', 'upi'],
    'Health': ['pharmacy', 'hospital', 'doctor', 'medical', 'apollo', 'medplus', 'practo'],
    'Education': ['school', 'college', 'university', 'course', 'udemy', 'coursera', 'tuition'],
  };

  function detectCategory(description: string): string {
    const lower = description.toLowerCase();
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(kw => lower.includes(kw))) return category;
    }
    return 'Other';
  }

  function generateCsvHash(date: string, amount: string, description: string): string {
    return createHash('sha256').update(`${date}|${amount}|${description}`).digest('hex');
  }

  function generateId(): string {
    return createHash('sha256').update(`${Date.now()}-${Math.random()}`).digest('hex').substring(0, 16);
  }

  // --- Banks CRUD ---
  app.get('/api/banks', authenticateUser, (req, res) => {
    try {
      const banks = db.prepare('SELECT * FROM banks WHERE user_id = ? AND isActive = 1 ORDER BY updated_at DESC').all(req.user?.uid);
      res.json(banks);
    } catch (error) {
      console.error('Failed to fetch banks:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/banks', authenticateUser, (req, res) => {
    try {
      const { bank_name, account_type, nickname, balance, currency, notes } = req.body;
      const err = firstError(
        validateString(bank_name, 'bank_name'),
        validateString(account_type, 'account_type', 50),
        validateNumber(balance, 'balance')
      );
      if (err) return res.status(400).json({ error: err });
      const validTypes = ['savings', 'current', 'credit_card'];
      if (!validTypes.includes(account_type)) return res.status(400).json({ error: `account_type must be one of: ${validTypes.join(', ')}` });
      const id = generateId();
      db.prepare(
        'INSERT INTO banks (id, user_id, bank_name, account_type, nickname, balance, currency, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(id, req.user?.uid, bank_name.trim(), account_type, nickname?.trim() || null, Number(balance), currency || 'INR', notes?.trim() || null);
      res.status(201).json({ success: true, id });
    } catch (error) {
      console.error('Failed to add bank:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.put('/api/banks/:id', authenticateUser, (req, res) => {
    try {
      const { bank_name, account_type, nickname, balance, currency, notes } = req.body;
      const err = firstError(
        validateString(bank_name, 'bank_name'),
        validateString(account_type, 'account_type', 50),
        validateNumber(balance, 'balance')
      );
      if (err) return res.status(400).json({ error: err });
      const result = db.prepare(
        'UPDATE banks SET bank_name = ?, account_type = ?, nickname = ?, balance = ?, currency = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'
      ).run(bank_name.trim(), account_type, nickname?.trim() || null, Number(balance), currency || 'INR', notes?.trim() || null, req.params.id, req.user?.uid);
      if (result.changes === 0) return res.status(404).json({ error: 'Bank not found or unauthorized' });
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to update bank:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.delete('/api/banks/:id', authenticateUser, (req, res) => {
    try {
      // Cascade delete transactions first
      db.prepare('DELETE FROM bank_transactions WHERE bank_id = ? AND user_id = ?').run(req.params.id, req.user?.uid);
      const result = db.prepare('DELETE FROM banks WHERE id = ? AND user_id = ?').run(req.params.id, req.user?.uid);
      if (result.changes === 0) return res.status(404).json({ error: 'Bank not found or unauthorized' });
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete bank:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // --- Bank Transactions ---
  app.get('/api/bank-transactions', authenticateUser, (req, res) => {
    try {
      const { bank_id } = req.query;
      const uid = req.user?.uid;
      let transactions;
      if (bank_id) {
        transactions = db.prepare('SELECT * FROM bank_transactions WHERE user_id = ? AND bank_id = ? AND isActive = 1 ORDER BY transaction_date DESC').all(uid, bank_id);
      } else {
        transactions = db.prepare('SELECT * FROM bank_transactions WHERE user_id = ? AND isActive = 1 ORDER BY transaction_date DESC').all(uid);
      }
      res.json(transactions);
    } catch (error) {
      console.error('Failed to fetch bank transactions:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/bank-transactions', authenticateUser, (req, res) => {
    try {
      const { bank_id, amount, merchant, category, transaction_date, transaction_type, description, notes } = req.body;
      const err = firstError(
        validateString(bank_id, 'bank_id'),
        validateNumber(amount, 'amount'),
        validateString(transaction_date, 'transaction_date'),
        validateString(transaction_type, 'transaction_type', 10)
      );
      if (err) return res.status(400).json({ error: err });
      if (!['debit', 'credit'].includes(transaction_type)) return res.status(400).json({ error: 'Invalid transaction_type' });

      const uid = req.user?.uid;
      const val = Math.abs(Number(amount));
      const id = generateId();
      const detectedCategory = category || detectCategory(description || merchant || '');

      db.transaction(() => {
        db.prepare(
          'INSERT INTO bank_transactions (id, user_id, bank_id, amount, merchant, category, transaction_date, transaction_type, description, notes, source, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)'
        ).run(id, uid, bank_id, val, merchant?.trim() || null, detectedCategory, transaction_date, transaction_type, description?.trim() || null, notes?.trim() || null, 'manual');

        const adjustment = transaction_type === 'credit' ? val : -val;
        db.prepare('UPDATE banks SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?').run(adjustment, bank_id, uid);
      })();

      res.status(201).json({ success: true, id });
    } catch (error) {
      console.error('Failed to add bank transaction:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.put('/api/bank-transactions/:id', authenticateUser, (req, res) => {
    try {
      const uid = req.user?.uid;
      const oldTx = db.prepare('SELECT * FROM bank_transactions WHERE id = ? AND user_id = ?').get(req.params.id, uid) as any;
      if (!oldTx) return res.status(404).json({ error: 'Bank transaction not found or unauthorized' });

      const { amount, merchant, category, transaction_date, transaction_type, description, notes } = req.body;
      const err = firstError(
        validateNumber(amount, 'amount'),
        validateString(transaction_date, 'transaction_date'),
        validateString(transaction_type, 'transaction_type', 10)
      );
      if (err) return res.status(400).json({ error: err });
      if (!['debit', 'credit'].includes(transaction_type)) return res.status(400).json({ error: 'Invalid transaction_type' });

      const newVal = Math.abs(Number(amount));
      const oldVal = Math.abs(Number(oldTx.amount));

      db.transaction(() => {
        // 1. Reverse old balance effect
        const oldAdj = oldTx.transaction_type === 'credit' ? -oldVal : oldVal;
        db.prepare('UPDATE banks SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?').run(oldAdj, oldTx.bank_id, uid);

        // 2. Apply new balance effect
        const newAdj = transaction_type === 'credit' ? newVal : -newVal;
        db.prepare('UPDATE banks SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?').run(newAdj, oldTx.bank_id, uid);

        // 3. Update the record
        const detectedCategory = category || detectCategory(description || merchant || '');
        db.prepare(
          'UPDATE bank_transactions SET amount = ?, merchant = ?, category = ?, transaction_date = ?, transaction_type = ?, description = ?, notes = ? WHERE id = ? AND user_id = ?'
        ).run(newVal, merchant?.trim() || null, detectedCategory, transaction_date, transaction_type, description?.trim() || null, notes?.trim() || null, req.params.id, uid);
      })();

      res.json({ success: true });
    } catch (error) {
      console.error('Failed to update bank transaction:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.delete('/api/bank-transactions/:id', authenticateUser, (req, res) => {
    try {
      const uid = req.user?.uid;
      const tx = db.prepare('SELECT * FROM bank_transactions WHERE id = ? AND user_id = ?').get(req.params.id, uid) as any;
      if (!tx) return res.status(404).json({ error: 'Bank transaction not found or unauthorized' });

      db.transaction(() => {
        db.prepare('UPDATE bank_transactions SET isActive = 0 WHERE id = ?').run(req.params.id);

        const val = Number(tx.amount);
        const adjustment = tx.transaction_type === 'credit' ? -val : val;
        db.prepare('UPDATE banks SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?').run(adjustment, tx.bank_id, uid);
      })();

      res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete bank transaction:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // --- CSV Upload ---
  app.post('/api/upload-csv', authenticateUser, (req, res) => {
    try {
      const { bank_id, csv_content } = req.body;
      const err = firstError(
        validateString(bank_id, 'bank_id'),
        validateString(csv_content, 'csv_content', 500000)
      );
      if (err) return res.status(400).json({ error: err });

      // Verify bank ownership
      const bank = db.prepare('SELECT * FROM banks WHERE id = ? AND user_id = ?').get(bank_id, req.user?.uid) as any;
      if (!bank) return res.status(404).json({ error: 'Bank not found or unauthorized' });

      const lines = csv_content.trim().split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
      if (lines.length < 2) return res.status(400).json({ error: 'CSV must have a header row and at least one data row' });

      // Parse header
      const header = lines[0].toLowerCase().split(',').map((h: string) => h.trim());
      const dateIdx = header.findIndex((h: string) => h === 'date');
      const descIdx = header.findIndex((h: string) => h === 'description');
      const amountIdx = header.findIndex((h: string) => h === 'amount');
      const typeIdx = header.findIndex((h: string) => h === 'type');

      if (dateIdx === -1 || amountIdx === -1) {
        return res.status(400).json({ error: 'CSV must have at least Date and Amount columns' });
      }

      const insertStmt = db.prepare(
        'INSERT INTO bank_transactions (id, user_id, bank_id, amount, merchant, category, transaction_date, transaction_type, description, source, csv_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      );

      let imported = 0;
      let duplicates = 0;
      let errors: string[] = [];
      let balanceChange = 0;

      const insertMany = db.transaction(() => {
        for (let i = 1; i < lines.length; i++) {
          try {
            const cols = lines[i].split(',').map((c: string) => c.trim());
            const date = cols[dateIdx] || '';
            const desc = descIdx !== -1 ? cols[descIdx] : '';
            const amountRaw = cols[amountIdx] || '0';
            const typeRaw = typeIdx !== -1 ? cols[typeIdx]?.toLowerCase() : '';

            if (!date || amountRaw === '0') {
              errors.push(`Row ${i + 1}: Missing date or zero amount`);
              continue;
            }

            const amount = Math.abs(parseFloat(amountRaw));
            if (isNaN(amount)) {
              errors.push(`Row ${i + 1}: Invalid amount "${amountRaw}"`);
              continue;
            }

            // Determine type: debit if amount is negative or type says debit
            let txType: string;
            if (typeRaw === 'debit' || typeRaw === 'credit') {
              txType = typeRaw;
            } else {
              txType = parseFloat(amountRaw) < 0 ? 'debit' : 'credit';
            }

            const hash = generateCsvHash(date, amountRaw, desc);

            // Check duplicate
            const existing = db.prepare('SELECT id FROM bank_transactions WHERE csv_hash = ? AND user_id = ? AND bank_id = ?').get(hash, req.user?.uid, bank_id);
            if (existing) {
              duplicates++;
              continue;
            }

            const category = detectCategory(desc);
            const id = generateId() + i.toString(16);

            insertStmt.run(id, req.user?.uid, bank_id, amount, desc || null, category, date, txType, desc || null, 'csv', hash);
            imported++;

            if (txType === 'credit') {
              balanceChange += amount;
            } else {
              balanceChange -= amount;
            }
          } catch (rowError) {
            errors.push(`Row ${i + 1}: Parse error`);
          }
        }
      });

      insertMany();

      // Update bank balance
      if (balanceChange !== 0) {
        db.prepare('UPDATE banks SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?').run(balanceChange, bank_id, req.user?.uid);
      }

      res.json({
        success: true,
        imported,
        duplicates,
        errors: errors.slice(0, 10),
        total_rows: lines.length - 1
      });
    } catch (error) {
      console.error('Failed to process CSV:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // --- Subscriptions (Manual CRUD + Auto-detection) ---
  app.post('/api/subscriptions', authenticateUser, (req, res) => {
    try {
      const { name, amount, billing_cycle, next_payment_date, bank_id } = req.body;
      const err = firstError(
        validateString(name, 'name'),
        validateNumber(amount, 'amount', { min: 0 })
      );
      if (err) return res.status(400).json({ error: err });
      const id = generateId();
      db.prepare(
        'INSERT INTO subscriptions (id, user_id, name, amount, billing_cycle, next_payment_date, bank_id, status, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)'
      ).run(id, req.user?.uid, name.trim(), Number(amount), billing_cycle || 'monthly', next_payment_date || null, bank_id || null, 'active');
      res.status(201).json({ success: true, id });
    } catch (error) {
      console.error('Failed to add subscription:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.delete('/api/subscriptions/:id', authenticateUser, (req, res) => {
    try {
      const result = db.prepare('UPDATE subscriptions SET isActive = 0 WHERE id = ? AND user_id = ?').run(req.params.id, req.user?.uid);
      if (result.changes === 0) return res.status(404).json({ error: 'Subscription not found or unauthorized' });
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete subscription:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/subscriptions', authenticateUser, (req, res) => {
    try {
      const uid = req.user?.uid;
      // 1. Get manual subscriptions
      const manualSubs = db.prepare('SELECT * FROM subscriptions WHERE user_id = ? AND isActive = 1').all(uid) as any[];

      // 2. Detect recurring payments from bank transactions
      const recurring = db.prepare(`
        SELECT 
          merchant as name,
          amount,
          COUNT(DISTINCT strftime('%Y-%m', transaction_date)) as month_count,
          MAX(transaction_date) as last_payment,
          bank_id
        FROM bank_transactions
        WHERE user_id = ? AND transaction_type = 'debit' AND merchant IS NOT NULL AND merchant != '' AND isActive = 1
        GROUP BY merchant, amount
        HAVING month_count >= 2
        ORDER BY amount DESC
      `).all(uid) as any[];

      const detectedSubs = recurring.map((sub: any) => {
        const lastPayment = new Date(sub.last_payment);
        const nextPayment = new Date(lastPayment);
        nextPayment.setMonth(nextPayment.getMonth() + 1);

        return {
          id: `auto-sub-${generateCsvHash(sub.name, sub.amount.toString(), 'sub')}`,
          name: sub.name,
          amount: sub.amount,
          billing_cycle: 'monthly',
          next_payment_date: nextPayment.toISOString().split('T')[0],
          last_payment_date: sub.last_payment,
          bank_id: sub.bank_id,
          month_count: sub.month_count,
          status: 'active',
          source: 'auto'
        };
      });

      // Merge and deduplicate (favor manual)
      const mergedSubs = [...manualSubs.map(s => ({ ...s, source: 'manual' }))];
      detectedSubs.forEach(d => {
        if (!mergedSubs.some(m => m.name.toLowerCase() === d.name.toLowerCase())) {
          mergedSubs.push(d);
        }
      });

      const totalMonthly = mergedSubs.reduce((sum: number, s: any) => sum + s.amount, 0);

      res.json({
        subscriptions: mergedSubs,
        total_monthly: totalMonthly,
        insight: `You spend ₹${totalMonthly.toLocaleString('en-IN')}/month on subscriptions.`
      });
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // --- Financial Health Score ---
  app.get('/api/financial-health', authenticateUser, (req, res) => {
    try {
      const uid = req.user?.uid;

      // Get total credits (income) from last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const cutoff = threeMonthsAgo.toISOString().split('T')[0];

      const credits = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total FROM (
          SELECT amount FROM bank_transactions WHERE user_id = ? AND transaction_type = 'credit' AND transaction_date >= ? AND category != 'Transfer' AND isActive = 1
          UNION ALL
          SELECT amount FROM transactions WHERE user_id = ? AND type = 'income' AND transaction_date >= ? AND category != 'Transfer' AND isActive = 1
        )
      `).get(uid, cutoff, uid, cutoff) as any;

      const debits = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total FROM (
          SELECT amount FROM bank_transactions WHERE user_id = ? AND transaction_type = 'debit' AND transaction_date >= ? AND category != 'Transfer' AND isActive = 1
          UNION ALL
          SELECT amount FROM transactions WHERE user_id = ? AND (type = 'expense' OR type = 'spend') AND transaction_date >= ? AND category != 'Transfer' AND isActive = 1
        )
      `).get(uid, cutoff, uid, cutoff) as any;

      const totalIncome = credits.total || 0;
      const totalExpenses = debits.total || 0;

      // Get total bank balances (emergency fund)
      const bankBalances = db.prepare('SELECT COALESCE(SUM(balance), 0) as total FROM banks WHERE user_id = ? AND isActive = 1').get(uid) as any;
      const totalBalance = bankBalances.total || 0;

      // Get total liabilities (SSOT: manual + card debt)
      const liabilitiesTotal = db.prepare('SELECT SUM(balance) as total FROM liabilities WHERE user_id = ? AND isActive = 1').get(uid) as any;
      const cardsTotal = db.prepare('SELECT SUM(credit_limit - available_credit) as total FROM cards WHERE isActive = 1 AND user_id = ?').get(uid) as any;
      const totalDebt = (liabilitiesTotal.total || 0) + (cardsTotal.total || 0);

      // Monthly income/expenses (averaged over 3 months)
      const monthlyIncome = totalIncome / 3;
      const monthlyExpenses = totalExpenses / 3;
      const monthlyDebt = totalDebt > 0 ? totalDebt / 12 : 0; // Approximate monthly debt payments

      // 1. Savings Rate (30 pts) - (Income - Expenses) / Income
      let savingsRate = 0;
      if (monthlyIncome > 0) {
        savingsRate = Math.max(0, Math.min(1, (monthlyIncome - monthlyExpenses) / monthlyIncome));
      }
      const savingsScore = Math.round(savingsRate * 30);

      // 2. Debt Ratio (25 pts) - Lower is better
      let debtRatio = 0;
      if (monthlyIncome > 0) {
        debtRatio = Math.min(1, monthlyDebt / monthlyIncome);
      }
      const debtScore = Math.round((1 - debtRatio) * 25);

      // 3. Emergency Fund (25 pts) - Months of expenses covered
      let emergencyFundRatio = 0;
      if (monthlyExpenses > 0) {
        emergencyFundRatio = Math.min(6, totalBalance / monthlyExpenses); // Cap at 6 months
      }
      const emergencyScore = Math.round((emergencyFundRatio / 6) * 25);

      // 4. Spending Discipline (20 pts) - Consistency (std dev of monthly spend)
      const monthlySpending = db.prepare(`
        SELECT strftime('%Y-%m', transaction_date) as month, SUM(amount) as total
        FROM bank_transactions
        WHERE user_id = ? AND transaction_type = 'debit' AND transaction_date >= ?
        GROUP BY month
      `).all(uid, cutoff) as any[];

      let disciplineScore = 10; // Default middle score
      if (monthlySpending.length >= 2) {
        const amounts = monthlySpending.map((m: any) => m.total);
        const avg = amounts.reduce((a: number, b: number) => a + b, 0) / amounts.length;
        const variance = amounts.reduce((sum: number, val: number) => sum + Math.pow(val - avg, 2), 0) / amounts.length;
        const stdDev = Math.sqrt(variance);
        const cv = avg > 0 ? stdDev / avg : 1; // Coefficient of variation
        disciplineScore = Math.round(Math.max(0, Math.min(1, 1 - cv)) * 20);
      }

      const totalScore = Math.min(100, savingsScore + debtScore + emergencyScore + disciplineScore);

      // Determine ratings
      const getStatus = (pct: number) => pct >= 70 ? 'Good' : pct >= 40 ? 'Moderate' : 'Needs Improvement';

      const result = {
        score: totalScore,
        savings_rate: Math.round(savingsRate * 100),
        savings_rate_status: getStatus(savingsRate * 100),
        debt_ratio: Math.round(debtRatio * 100),
        debt_ratio_status: getStatus((1 - debtRatio) * 100),
        emergency_fund_ratio: Math.round(emergencyFundRatio * 10) / 10,
        emergency_fund_status: getStatus((emergencyFundRatio / 6) * 100),
        spending_discipline: disciplineScore * 5,
        spending_discipline_status: getStatus(disciplineScore * 5),
        monthly_income: Math.round(monthlyIncome),
        monthly_expenses: Math.round(monthlyExpenses),
        total_balance: Math.round(totalBalance)
      };

      res.json(result);
    } catch (error) {
      console.error('Failed to calculate financial health:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // --- Spending Predictions ---
  app.get('/api/spending-predictions', authenticateUser, (req, res) => {
    try {
      const uid = req.user?.uid;

      // Get spending by category for last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const cutoff = sixMonthsAgo.toISOString().split('T')[0];

      const categorySpending = db.prepare(`
        SELECT 
          category,
          COUNT(DISTINCT strftime('%Y-%m', transaction_date)) as months,
          SUM(amount) as total,
          AVG(amount) as avg_per_tx,
          COUNT(*) as tx_count
        FROM (
          SELECT category, transaction_date, amount FROM bank_transactions WHERE user_id = ? AND transaction_type = 'debit' AND transaction_date >= ? AND category != 'Transfer' AND isActive = 1
          UNION ALL
          SELECT category, transaction_date, amount FROM transactions WHERE user_id = ? AND (type = 'expense' OR type = 'spend') AND transaction_date >= ? AND category != 'Transfer' AND isActive = 1
        )
        GROUP BY category
        ORDER BY total DESC
      `).all(uid, cutoff, uid, cutoff) as any[];

      // Get total income for last 6 months
      const incomeData = db.prepare(`
        SELECT 
          COUNT(DISTINCT strftime('%Y-%m', transaction_date)) as months,
          SUM(amount) as total
        FROM (
          SELECT transaction_date, amount FROM bank_transactions WHERE user_id = ? AND transaction_type = 'credit' AND transaction_date >= ? AND category != 'Transfer' AND isActive = 1
          UNION ALL
          SELECT transaction_date, amount FROM transactions WHERE user_id = ? AND type = 'income' AND transaction_date >= ? AND category != 'Transfer' AND isActive = 1
        )
      `).get(uid, cutoff, uid, cutoff) as any;

      const incomeMonths = incomeData?.months || 1;
      const monthlyIncome = (incomeData?.total || 0) / Math.max(1, incomeMonths);

      // Build per-category predictions
      const categoryPredictions = categorySpending.map((cat: any) => {
        const monthlyAvg = cat.total / Math.max(1, cat.months);
        return {
          category: cat.category || 'Other',
          predicted_amount: Math.round(monthlyAvg),
          avg_per_transaction: Math.round(cat.avg_per_tx),
          transaction_count: cat.tx_count
        };
      });

      const predictedTotal = categoryPredictions.reduce((sum: number, c: any) => sum + c.predicted_amount, 0);
      const expectedSavings = Math.round(monthlyIncome - predictedTotal);

      // Next month label
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const monthLabel = nextMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

      res.json({
        predicted_month: monthLabel,
        predicted_total: predictedTotal,
        expected_savings: expectedSavings,
        monthly_income: Math.round(monthlyIncome),
        category_predictions: categoryPredictions,
        data_months: Math.max(...categorySpending.map((c: any) => c.months), 0)
      });
    } catch (error) {
      console.error('Failed to generate spending predictions:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // --- Safe to Spend ---
  app.get('/api/safe-to-spend', authenticateUser, (req, res) => {
    try {
      const uid = req.user?.uid;

      // 1. Average Monthly Income (3 months)
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const cutoff = threeMonthsAgo.toISOString().split('T')[0];
      const incomeData = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total FROM (
          SELECT amount FROM bank_transactions WHERE user_id = ? AND transaction_type = 'credit' AND transaction_date >= ? AND isActive = 1
          UNION ALL
          SELECT amount FROM transactions WHERE user_id = ? AND type = 'income' AND transaction_date >= ? AND isActive = 1
        )
      `).get(uid, cutoff, uid, cutoff) as any;
      const avgMonthlyIncome = (incomeData.total || 0) / 3;

      // 2. Fixed Obligations
      // Subscriptions
      const subs = db.prepare('SELECT SUM(amount) as total FROM subscriptions WHERE user_id = ? AND isActive = 1').get(uid) as any;
      const monthlySubs = subs.total || 0;

      // EMIs
      const emis = db.prepare('SELECT SUM(monthly_payment) as total FROM emis WHERE user_id = ? AND isActive = 1').get(uid) as any;
      const monthlyEmis = emis.total || 0;

      // 3. Calculation
      const mandatorySavings = avgMonthlyIncome * 0.20;
      const remainingBalance = avgMonthlyIncome - monthlySubs - monthlyEmis - mandatorySavings;
      const safeToSpendDaily = Math.max(0, remainingBalance / 30);

      res.json({
        monthly_income: Math.round(avgMonthlyIncome),
        monthly_subscriptions: monthlySubs,
        monthly_emis: monthlyEmis,
        mandatory_savings: Math.round(mandatorySavings),
        disposable_monthly: Math.round(remainingBalance),
        safe_to_spend_daily: Math.round(safeToSpendDaily)
      });
    } catch (error) {
      console.error('Failed to calculate safe to spend:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
