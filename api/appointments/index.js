import db, { initDb } from '../db.js';

export default async function handler(req, res) {
  await initDb();

  if (req.method === 'GET') {
    return getAppointments(req, res);
  }
  if (req.method === 'POST') {
    return createAppointment(req, res);
  }
  return res.status(405).json({ error: 'Method not allowed' });
}

async function getAppointments(req, res) {
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
  return res.status(200).json(result.rows);
}

async function createAppointment(req, res) {
  const { customer_name, salesperson, appointment_date, appointment_time, deal_type, bank, stock_number, vehicle, trade_info, notes } = req.body;

  if (!customer_name || !salesperson || !appointment_date || !appointment_time || !deal_type) {
    return res.status(400).json({ error: 'Missing required fields: customer_name, salesperson, appointment_date, appointment_time, deal_type' });
  }

  const result = await db.execute({
    sql: `INSERT INTO appointments (customer_name, salesperson, appointment_date, appointment_time, deal_type, bank, stock_number, vehicle, trade_info, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [customer_name, salesperson, appointment_date, appointment_time, deal_type, bank || null, stock_number || null, vehicle || null, trade_info || null, notes || null],
  });

  const newRow = await db.execute({
    sql: 'SELECT * FROM appointments WHERE id = ?',
    args: [Number(result.lastInsertRowid)],
  });

  return res.status(201).json(newRow.rows[0]);
}
