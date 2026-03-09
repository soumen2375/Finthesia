import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database('finthesia.db');

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    current_value DECIMAL(15, 2) NOT NULL,
    notes TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS liabilities (
    id TEXT PRIMARY KEY,
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

  app.use(express.json());

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.get('/api/assets', (req, res) => {
    try {
      const assets = db.prepare('SELECT * FROM assets ORDER BY updated_at DESC').all();
      res.json(assets);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/assets', (req, res) => {
    try {
      const { id, name, category, current_value, notes } = req.body;
      if (!id || !name || !category || current_value === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const stmt = db.prepare('INSERT INTO assets (id, name, category, current_value, notes) VALUES (?, ?, ?, ?, ?)');
      stmt.run(id, name, category, current_value, notes);
      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Failed to add asset:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/cards', (req, res) => {
    try {
      const cards = db.prepare('SELECT * FROM cards WHERE isActive = 1 ORDER BY updated_at DESC').all();
      res.json(cards);
    } catch (error) {
      console.error('Failed to fetch cards:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/cards', (req, res) => {
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
          id, bank_name, card_variant, name, card_type, 
          credit_limit, available_credit, billing_cycle, 
          payment_due_date, total_amount_due, apr, last4, color,
          annual_fee, joining_fee, reward_points, cashback_percent,
          monthly_budget, statement_generation_day, payment_due_day,
          minimum_amount_due, utilization_alert_threshold,
          remind_before_days, remind_on_due_date, allow_manual_override,
          isActive
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `);
      stmt.run(
        id, bank_name, card_variant, name, card_type, 
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

  app.put('/api/cards/:id', (req, res) => {
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
        WHERE id = ?
      `);
      stmt.run(
        bank_name, card_variant, name, card_type, 
        credit_limit, available_credit, billing_cycle, 
        payment_due_date, total_amount_due, apr, last4, color,
        annual_fee || 0, joining_fee || 0, reward_points || 0, cashback_percent || 0,
        monthly_budget || 0, statement_generation_day, payment_due_day,
        minimum_amount_due || 0, utilization_alert_threshold || 70,
        remind_before_days || 3, remind_on_due_date === false ? 0 : 1,
        allow_manual_override ? 1 : 0,
        isActive === undefined ? 1 : (isActive ? 1 : 0),
        req.params.id
      );
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to update card:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.delete('/api/cards/:id', (req, res) => {
    try {
      db.prepare('UPDATE cards SET isActive = 0 WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to soft delete card:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/cards/:id/emis', (req, res) => {
    try {
      const emis = db.prepare('SELECT * FROM emis WHERE card_id = ? ORDER BY next_due_date ASC').all(req.params.id);
      res.json(emis);
    } catch (error) {
      console.error('Failed to fetch EMIs:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/emis', (req, res) => {
    try {
      const { 
        id, card_id, description, original_amount, 
        remaining_amount, monthly_payment, remaining_months, next_due_date 
      } = req.body;
      const stmt = db.prepare(`
        INSERT INTO emis (
          id, card_id, description, original_amount, 
          remaining_amount, monthly_payment, remaining_months, next_due_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        id, card_id, description, original_amount, 
        remaining_amount, monthly_payment, remaining_months, next_due_date
      );
      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Failed to add EMI:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.delete('/api/emis/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM emis WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete EMI:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/liabilities', (req, res) => {
    try {
      const liabilities = db.prepare('SELECT * FROM liabilities ORDER BY updated_at DESC').all();
      res.json(liabilities);
    } catch (error) {
      console.error('Failed to fetch liabilities:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/liabilities', (req, res) => {
    try {
      const { id, name, type, balance, interest_rate, minimum_payment, due_date } = req.body;
      if (!id || !name || !type || balance === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const stmt = db.prepare('INSERT INTO liabilities (id, name, type, balance, interest_rate, minimum_payment, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)');
      stmt.run(id, name, type, balance, interest_rate, minimum_payment, due_date);
      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Failed to add liability:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/transactions', (req, res) => {
    try {
      const transactions = db.prepare('SELECT * FROM transactions ORDER BY transaction_date DESC').all();
      res.json(transactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/transactions', (req, res) => {
    try {
      const { id, amount, category, description, transaction_date, type, card_id } = req.body;
      if (!id || amount === undefined || !category || !transaction_date || !type) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const stmt = db.prepare('INSERT INTO transactions (id, amount, category, description, transaction_date, type, card_id) VALUES (?, ?, ?, ?, ?, ?, ?)');
      stmt.run(id, amount, category, description, transaction_date, type, card_id);
      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Failed to add transaction:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/net-worth', (req, res) => {
    try {
      const assetsTotal = db.prepare('SELECT SUM(current_value) as total FROM assets').get() as any;
      const liabilitiesTotal = db.prepare('SELECT SUM(balance) as total FROM liabilities').get() as any;
      const cardsTotal = db.prepare('SELECT SUM(credit_limit - available_credit) as total FROM cards').get() as any;
      
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
