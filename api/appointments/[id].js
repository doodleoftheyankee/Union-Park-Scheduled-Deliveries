import db, { initDb } from '../db.js';

export default async function handler(req, res) {
  await initDb();

  const { id } = req.query;

  if (req.method === 'GET') {
    return getAppointment(id, res);
  }
  if (req.method === 'PUT') {
    return updateAppointment(id, req, res);
  }
  if (req.method === 'DELETE') {
    return deleteAppointment(id, res);
  }
  return res.status(405).json({ error: 'Method not allowed' });
}

async function getAppointment(id, res) {
  const result = await db.execute({ sql: 'SELECT * FROM appointments WHERE id = ?', args: [id] });
  if (result.rows.length === 0) return res.status(404).json({ error: 'Appointment not found' });
  return res.status(200).json(result.rows[0]);
}

async function updateAppointment(id, req, res) {
  const existing = await db.execute({ sql: 'SELECT * FROM appointments WHERE id = ?', args: [id] });
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
      customer_name || null,
      salesperson || null,
      appointment_date || null,
      appointment_time || null,
      deal_type || null,
      bank !== undefined ? bank : row.bank,
      stock_number !== undefined ? stock_number : row.stock_number,
      vehicle !== undefined ? vehicle : row.vehicle,
      trade_info !== undefined ? trade_info : row.trade_info,
      notes !== undefined ? notes : row.notes,
      status || null,
      id,
    ],
  });

  const updated = await db.execute({ sql: 'SELECT * FROM appointments WHERE id = ?', args: [id] });
  return res.status(200).json(updated.rows[0]);
}

async function deleteAppointment(id, res) {
  const existing = await db.execute({ sql: 'SELECT * FROM appointments WHERE id = ?', args: [id] });
  if (existing.rows.length === 0) return res.status(404).json({ error: 'Appointment not found' });

  await db.execute({ sql: 'DELETE FROM appointments WHERE id = ?', args: [id] });
  return res.status(200).json({ message: 'Appointment deleted' });
}
