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
    name TEXT NOT NULL,
    card_type TEXT NOT NULL,
    credit_limit DECIMAL(15, 2) NOT NULL,
    current_balance DECIMAL(15, 2) NOT NULL,
    payment_due_date TEXT,
    apr DECIMAL(5, 2),
    last4 TEXT,
    color TEXT,
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
`);

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
      const cards = db.prepare('SELECT * FROM cards ORDER BY updated_at DESC').all();
      res.json(cards);
    } catch (error) {
      console.error('Failed to fetch cards:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/cards', (req, res) => {
    try {
      const { id, name, card_type, credit_limit, current_balance, payment_due_date, apr, last4, color } = req.body;
      if (!id || !name || !card_type || credit_limit === undefined || current_balance === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const stmt = db.prepare('INSERT INTO cards (id, name, card_type, credit_limit, current_balance, payment_due_date, apr, last4, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
      stmt.run(id, name, card_type, credit_limit, current_balance, payment_due_date, apr, last4, color);
      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Failed to add card:', error);
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
      const cardsTotal = db.prepare('SELECT SUM(current_balance) as total FROM cards').get() as any;
      
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
