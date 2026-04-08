import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.NODE_ENV === 'production' ? (process.env.PORT || 3001) : 3001;

app.use(cors());
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'dist')));
}

// ── GET all appointments (with optional date filter) ──
app.get('/api/appointments', (req, res) => {
  const { date, start_date, end_date, status, salesperson } = req.query;

  let sql = 'SELECT * FROM appointments WHERE 1=1';
  const params = [];

  if (date) {
    sql += ' AND appointment_date = ?';
    params.push(date);
  }
  if (start_date && end_date) {
    sql += ' AND appointment_date BETWEEN ? AND ?';
    params.push(start_date, end_date);
  }
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (salesperson) {
    sql += ' AND salesperson = ?';
    params.push(salesperson);
  }

  sql += ' ORDER BY appointment_date ASC, appointment_time ASC';

  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

// ── GET single appointment ──
app.get('/api/appointments/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Appointment not found' });
  res.json(row);
});

// ── CREATE appointment ──
app.post('/api/appointments', (req, res) => {
  const { customer_name, salesperson, appointment_date, appointment_time, deal_type, bank, stock_number, vehicle, trade_info, notes } = req.body;

  if (!customer_name || !salesperson || !appointment_date || !appointment_time || !deal_type) {
    return res.status(400).json({ error: 'Missing required fields: customer_name, salesperson, appointment_date, appointment_time, deal_type' });
  }

  const stmt = db.prepare(`
    INSERT INTO appointments (customer_name, salesperson, appointment_date, appointment_time, deal_type, bank, stock_number, vehicle, trade_info, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(customer_name, salesperson, appointment_date, appointment_time, deal_type, bank || null, stock_number || null, vehicle || null, trade_info || null, notes || null);
  const newRow = db.prepare('SELECT * FROM appointments WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newRow);
});

// ── UPDATE appointment ──
app.put('/api/appointments/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Appointment not found' });

  const { customer_name, salesperson, appointment_date, appointment_time, deal_type, bank, stock_number, vehicle, trade_info, notes, status } = req.body;

  const stmt = db.prepare(`
    UPDATE appointments SET
      customer_name = COALESCE(?, customer_name),
      salesperson = COALESCE(?, salesperson),
      appointment_date = COALESCE(?, appointment_date),
      appointment_time = COALESCE(?, appointment_time),
      deal_type = COALESCE(?, deal_type),
      bank = ?,
      stock_number = ?,
      vehicle = ?,
      trade_info = ?,
      notes = ?,
      status = COALESCE(?, status),
      updated_at = datetime('now', 'localtime')
    WHERE id = ?
  `);

  stmt.run(
    customer_name || null, salesperson || null, appointment_date || null, appointment_time || null, deal_type || null,
    bank !== undefined ? bank : existing.bank,
    stock_number !== undefined ? stock_number : existing.stock_number,
    vehicle !== undefined ? vehicle : existing.vehicle,
    trade_info !== undefined ? trade_info : existing.trade_info,
    notes !== undefined ? notes : existing.notes,
    status || null,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// ── DELETE appointment ──
app.delete('/api/appointments/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Appointment not found' });

  db.prepare('DELETE FROM appointments WHERE id = ?').run(req.params.id);
  res.json({ message: 'Appointment deleted' });
});

// ── GET salesperson list (distinct from existing appointments) ──
app.get('/api/salespeople', (req, res) => {
  const rows = db.prepare('SELECT DISTINCT salesperson FROM appointments ORDER BY salesperson ASC').all();
  // Also include the default team
  const team = [
    'Jim VanDyke', 'Chris Meeks', 'Sam Williams', 'Andrea Guido',
    'Tom Guido', 'Alfonso Colon', 'Javier Aviles', 'Eddie Perez',
    'Armando Charriez'
  ];
  const fromDb = rows.map(r => r.salesperson);
  const merged = [...new Set([...team, ...fromDb])].sort();
  res.json(merged);
});

// ── GET report stats (aggregated) ──
app.get('/api/reports/stats', (req, res) => {
  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    return res.status(400).json({ error: 'start_date and end_date are required' });
  }

  // Overall counts by status
  const statusCounts = db.prepare(`
    SELECT status, COUNT(*) as count
    FROM appointments
    WHERE appointment_date BETWEEN ? AND ?
    GROUP BY status
  `).all(start_date, end_date);

  const totals = { total: 0, Scheduled: 0, Delivered: 0, Cancelled: 0, 'No Show': 0 };
  statusCounts.forEach(r => { totals[r.status] = r.count; totals.total += r.count; });

  // Counts by deal type
  const dealTypeCounts = db.prepare(`
    SELECT deal_type, COUNT(*) as count
    FROM appointments
    WHERE appointment_date BETWEEN ? AND ?
    GROUP BY deal_type
  `).all(start_date, end_date);

  const dealTypes = { Cash: 0, Finance: 0, Lease: 0 };
  dealTypeCounts.forEach(r => { dealTypes[r.deal_type] = r.count; });

  // Per-salesperson breakdown
  const salespersonStats = db.prepare(`
    SELECT salesperson,
           COUNT(*) as total,
           SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) as delivered,
           SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled,
           SUM(CASE WHEN status = 'No Show' THEN 1 ELSE 0 END) as no_show
    FROM appointments
    WHERE appointment_date BETWEEN ? AND ?
    GROUP BY salesperson
    ORDER BY total DESC
  `).all(start_date, end_date);

  // Daily counts for trend chart
  const dailyCounts = db.prepare(`
    SELECT appointment_date as date,
           COUNT(*) as total,
           SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) as delivered
    FROM appointments
    WHERE appointment_date BETWEEN ? AND ?
    GROUP BY appointment_date
    ORDER BY appointment_date ASC
  `).all(start_date, end_date);

  res.json({
    totals,
    dealTypes,
    salespersonStats,
    dailyCounts,
  });
});

// Catch-all for production SPA
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Union Park Delivery Board API running on port ${PORT}`);
});
