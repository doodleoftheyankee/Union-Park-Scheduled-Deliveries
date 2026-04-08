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
app.get('/api/appointments', async (req, res) => {
  try {
    const { date, start_date, end_date, status, salesperson } = req.query;

    let sql = 'SELECT * FROM appointments WHERE 1=1';
    const args = [];

    if (date) {
      sql += ' AND appointment_date = ?';
      args.push(date);
    }
    if (start_date && end_date) {
      sql += ' AND appointment_date BETWEEN ? AND ?';
      args.push(start_date, end_date);
    }
    if (status) {
      sql += ' AND status = ?';
      args.push(status);
    }
    if (salesperson) {
      sql += ' AND salesperson = ?';
      args.push(salesperson);
    }

    sql += ' ORDER BY appointment_date ASC, appointment_time ASC';

    const result = await db.execute({ sql, args });
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/appointments error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET single appointment ──
app.get('/api/appointments/:id', async (req, res) => {
  try {
    const result = await db.execute({ sql: 'SELECT * FROM appointments WHERE id = ?', args: [req.params.id] });
    if (result.rows.length === 0) return res.status(404).json({ error: 'Appointment not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('GET /api/appointments/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── CREATE appointment ──
app.post('/api/appointments', async (req, res) => {
  try {
    const { customer_name, salesperson, appointment_date, appointment_time, deal_type, bank, stock_number, vehicle, trade_info, notes } = req.body;

    if (!customer_name || !salesperson || !appointment_date || !appointment_time || !deal_type) {
      return res.status(400).json({ error: 'Missing required fields: customer_name, salesperson, appointment_date, appointment_time, deal_type' });
    }

    const result = await db.execute({
      sql: `INSERT INTO appointments (customer_name, salesperson, appointment_date, appointment_time, deal_type, bank, stock_number, vehicle, trade_info, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [customer_name, salesperson, appointment_date, appointment_time, deal_type, bank || null, stock_number || null, vehicle || null, trade_info || null, notes || null]
    });

    const newRow = await db.execute({ sql: 'SELECT * FROM appointments WHERE id = ?', args: [result.lastInsertRowid] });
    res.status(201).json(newRow.rows[0]);
  } catch (err) {
    console.error('POST /api/appointments error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── UPDATE appointment ──
app.put('/api/appointments/:id', async (req, res) => {
  try {
    const existing = await db.execute({ sql: 'SELECT * FROM appointments WHERE id = ?', args: [req.params.id] });
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Appointment not found' });
    const row = existing.rows[0];

    const { customer_name, salesperson, appointment_date, appointment_time, deal_type, bank, stock_number, vehicle, trade_info, notes, status } = req.body;

    await db.execute({
      sql: `UPDATE appointments SET
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
            WHERE id = ?`,
      args: [
        customer_name || null, salesperson || null, appointment_date || null, appointment_time || null, deal_type || null,
        bank !== undefined ? bank : row.bank,
        stock_number !== undefined ? stock_number : row.stock_number,
        vehicle !== undefined ? vehicle : row.vehicle,
        trade_info !== undefined ? trade_info : row.trade_info,
        notes !== undefined ? notes : row.notes,
        status || null,
        req.params.id
      ]
    });

    const updated = await db.execute({ sql: 'SELECT * FROM appointments WHERE id = ?', args: [req.params.id] });
    res.json(updated.rows[0]);
  } catch (err) {
    console.error('PUT /api/appointments/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── DELETE appointment ──
app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const existing = await db.execute({ sql: 'SELECT * FROM appointments WHERE id = ?', args: [req.params.id] });
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Appointment not found' });

    await db.execute({ sql: 'DELETE FROM appointments WHERE id = ?', args: [req.params.id] });
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    console.error('DELETE /api/appointments/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET salesperson list (distinct from existing appointments) ──
app.get('/api/salespeople', async (req, res) => {
  try {
    const result = await db.execute('SELECT DISTINCT salesperson FROM appointments ORDER BY salesperson ASC');
    const team = [
      'Jim VanDyke', 'Chris Meeks', 'Sam Williams', 'Andrea Guido',
      'Tom Guido', 'Alfonso Colon', 'Javier Aviles', 'Eddie Perez',
      'Armando Charriez'
    ];
    const fromDb = result.rows.map(r => r.salesperson);
    const merged = [...new Set([...team, ...fromDb])].sort();
    res.json(merged);
  } catch (err) {
    console.error('GET /api/salespeople error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET report stats (aggregated) ──
app.get('/api/reports/stats', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    const statusCounts = await db.execute({
      sql: `SELECT status, COUNT(*) as count FROM appointments WHERE appointment_date BETWEEN ? AND ? GROUP BY status`,
      args: [start_date, end_date]
    });

    const totals = { total: 0, Scheduled: 0, Delivered: 0, Cancelled: 0, 'No Show': 0 };
    statusCounts.rows.forEach(r => { totals[r.status] = r.count; totals.total += r.count; });

    const dealTypeCounts = await db.execute({
      sql: `SELECT deal_type, COUNT(*) as count FROM appointments WHERE appointment_date BETWEEN ? AND ? GROUP BY deal_type`,
      args: [start_date, end_date]
    });

    const dealTypes = { Cash: 0, Finance: 0, Lease: 0 };
    dealTypeCounts.rows.forEach(r => { dealTypes[r.deal_type] = r.count; });

    const salespersonStats = await db.execute({
      sql: `SELECT salesperson,
                   COUNT(*) as total,
                   SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) as delivered,
                   SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled,
                   SUM(CASE WHEN status = 'No Show' THEN 1 ELSE 0 END) as no_show
            FROM appointments
            WHERE appointment_date BETWEEN ? AND ?
            GROUP BY salesperson
            ORDER BY total DESC`,
      args: [start_date, end_date]
    });

    const dailyCounts = await db.execute({
      sql: `SELECT appointment_date as date,
                   COUNT(*) as total,
                   SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) as delivered
            FROM appointments
            WHERE appointment_date BETWEEN ? AND ?
            GROUP BY appointment_date
            ORDER BY appointment_date ASC`,
      args: [start_date, end_date]
    });

    res.json({
      totals,
      dealTypes,
      salespersonStats: salespersonStats.rows,
      dailyCounts: dailyCounts.rows,
    });
  } catch (err) {
    console.error('GET /api/reports/stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
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
