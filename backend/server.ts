import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import { readFileSync } from 'fs';

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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.get('/api/assets', authenticateUser, (req, res) => {
    try {
      const assets = db.prepare('SELECT * FROM assets WHERE user_id = ? ORDER BY updated_at DESC').all(req.user?.uid);
      res.json(assets);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/assets', authenticateUser, (req, res) => {
    try {
      const { id, name, category, current_value, notes } = req.body;
      const err = firstError(
        validateString(id, 'id'),
        validateString(name, 'name'),
        validateString(category, 'category', 50),
        validateNumber(current_value, 'current_value', { min: 0 })
      );
      if (err) return res.status(400).json({ error: err });
      const stmt = db.prepare('INSERT INTO assets (id, user_id, name, category, current_value, notes) VALUES (?, ?, ?, ?, ?, ?)');
      stmt.run(id, req.user?.uid, name.trim(), category.trim(), Number(current_value), notes || null);
      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Failed to add asset:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.put('/api/assets/:id', authenticateUser, (req, res) => {
    try {
      const { name, category, current_value, notes } = req.body;
      const err = firstError(
        validateString(name, 'name'),
        validateString(category, 'category', 50),
        validateNumber(current_value, 'current_value', { min: 0 })
      );
      if (err) return res.status(400).json({ error: err });
      const result = db.prepare(
        'UPDATE assets SET name = ?, category = ?, current_value = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'
      ).run(name.trim(), category.trim(), Number(current_value), notes || null, req.params.id, req.user?.uid);
      if (result.changes === 0) return res.status(404).json({ error: 'Asset not found or unauthorized' });
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to update asset:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.delete('/api/assets/:id', authenticateUser, (req, res) => {
    try {
      const result = db.prepare('DELETE FROM assets WHERE id = ? AND user_id = ?').run(req.params.id, req.user?.uid);
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
      const stmt = db.prepare(`
        INSERT INTO emis (
          id, user_id, card_id, description, original_amount, 
          remaining_amount, monthly_payment, remaining_months, next_due_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        id, req.user?.uid, card_id, description, original_amount, 
        remaining_amount, monthly_payment, remaining_months, next_due_date
      );
      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Failed to add EMI:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.delete('/api/emis/:id', authenticateUser, (req, res) => {
    try {
      const result = db.prepare('DELETE FROM emis WHERE id = ? AND user_id = ?').run(req.params.id, req.user?.uid);
      if (result.changes === 0) return res.status(404).json({ error: 'EMI not found or unauthorized' });
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete EMI:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/liabilities', authenticateUser, (req, res) => {
    try {
      const liabilities = db.prepare('SELECT * FROM liabilities WHERE user_id = ? ORDER BY updated_at DESC').all(req.user?.uid);
      res.json(liabilities);
    } catch (error) {
      console.error('Failed to fetch liabilities:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/liabilities', authenticateUser, (req, res) => {
    try {
      const { id, name, type, balance, interest_rate, minimum_payment, due_date } = req.body;
      const err = firstError(
        validateString(id, 'id'),
        validateString(name, 'name'),
        validateString(type, 'type', 50),
        validateNumber(balance, 'balance', { min: 0 }),
        validateOptionalNumber(interest_rate, 'interest_rate', { min: 0, max: 100 }),
        validateOptionalNumber(minimum_payment, 'minimum_payment', { min: 0 })
      );
      if (err) return res.status(400).json({ error: err });
      const stmt = db.prepare('INSERT INTO liabilities (id, user_id, name, type, balance, interest_rate, minimum_payment, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      stmt.run(id, req.user?.uid, name.trim(), type.trim(), Number(balance), interest_rate || null, minimum_payment || null, due_date || null);
      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Failed to add liability:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.put('/api/liabilities/:id', authenticateUser, (req, res) => {
    try {
      const { name, type, balance, interest_rate, minimum_payment, due_date } = req.body;
      const err = firstError(
        validateString(name, 'name'),
        validateString(type, 'type', 50),
        validateNumber(balance, 'balance', { min: 0 }),
        validateOptionalNumber(interest_rate, 'interest_rate', { min: 0, max: 100 }),
        validateOptionalNumber(minimum_payment, 'minimum_payment', { min: 0 })
      );
      if (err) return res.status(400).json({ error: err });
      const result = db.prepare(
        'UPDATE liabilities SET name = ?, type = ?, balance = ?, interest_rate = ?, minimum_payment = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'
      ).run(name.trim(), type.trim(), Number(balance), interest_rate || null, minimum_payment || null, due_date || null, req.params.id, req.user?.uid);
      if (result.changes === 0) return res.status(404).json({ error: 'Liability not found or unauthorized' });
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to update liability:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.delete('/api/liabilities/:id', authenticateUser, (req, res) => {
    try {
      const result = db.prepare('DELETE FROM liabilities WHERE id = ? AND user_id = ?').run(req.params.id, req.user?.uid);
      if (result.changes === 0) return res.status(404).json({ error: 'Liability not found or unauthorized' });
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete liability:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/transactions', authenticateUser, (req, res) => {
    try {
      const transactions = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC').all(req.user?.uid);
      res.json(transactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/transactions', authenticateUser, (req, res) => {
    try {
      const { id, amount, category, description, transaction_date, type, card_id } = req.body;
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
      const stmt = db.prepare('INSERT INTO transactions (id, user_id, amount, category, description, transaction_date, type, card_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      stmt.run(id, req.user?.uid, Number(amount), category.trim(), description || null, transaction_date.trim(), type.trim(), card_id || null);
      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Failed to add transaction:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.put('/api/transactions/:id', authenticateUser, (req, res) => {
    try {
      const { amount, category, description, transaction_date, type, card_id } = req.body;
      const validTypes = ['income', 'expense', 'payment', 'spend'];
      const err = firstError(
        validateNumber(amount, 'amount', { min: 0 }),
        validateString(category, 'category', 100),
        validateString(transaction_date, 'transaction_date'),
        validateString(type, 'type', 20)
      );
      if (err) return res.status(400).json({ error: err });
      if (!validTypes.includes(type)) return res.status(400).json({ error: `type must be one of: ${validTypes.join(', ')}` });
      const result = db.prepare(
        'UPDATE transactions SET amount = ?, category = ?, description = ?, transaction_date = ?, type = ?, card_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'
      ).run(Number(amount), category.trim(), description || null, transaction_date.trim(), type.trim(), card_id || null, req.params.id, req.user?.uid);
      if (result.changes === 0) return res.status(404).json({ error: 'Transaction not found or unauthorized' });
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to update transaction:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.delete('/api/transactions/:id', authenticateUser, (req, res) => {
    try {
      const result = db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').run(req.params.id, req.user?.uid);
      if (result.changes === 0) return res.status(404).json({ error: 'Transaction not found or unauthorized' });
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/net-worth', authenticateUser, (req, res) => {
    try {
      const assetsTotal = db.prepare('SELECT SUM(current_value) as total FROM assets WHERE user_id = ?').get(req.user?.uid) as any;
      const liabilitiesTotal = db.prepare('SELECT SUM(balance) as total FROM liabilities WHERE user_id = ?').get(req.user?.uid) as any;
      const cardsTotal = db.prepare('SELECT SUM(credit_limit - available_credit) as total FROM cards WHERE isActive = 1 AND user_id = ?').get(req.user?.uid) as any;
      
      const totalAssets = assetsTotal.total || 0;
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


  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
