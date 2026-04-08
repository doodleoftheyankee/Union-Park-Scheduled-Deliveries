import db, { initDb } from '../db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await initDb();

  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    return res.status(400).json({ error: 'start_date and end_date are required' });
  }

  const statusCounts = await db.execute({
    sql: 'SELECT status, COUNT(*) as count FROM appointments WHERE appointment_date BETWEEN ? AND ? GROUP BY status',
    args: [start_date, end_date],
  });

  const totals = { total: 0, Scheduled: 0, Delivered: 0, Cancelled: 0, 'No Show': 0 };
  statusCounts.rows.forEach(r => { totals[r.status] = r.count; totals.total += r.count; });

  const dealTypeCounts = await db.execute({
    sql: 'SELECT deal_type, COUNT(*) as count FROM appointments WHERE appointment_date BETWEEN ? AND ? GROUP BY deal_type',
    args: [start_date, end_date],
  });

  const dealTypes = { Cash: 0, Finance: 0, Lease: 0 };
  dealTypeCounts.rows.forEach(r => { dealTypes[r.deal_type] = r.count; });

  const salespersonResult = await db.execute({
    sql: `SELECT salesperson,
           COUNT(*) as total,
           SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) as delivered,
           SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled,
           SUM(CASE WHEN status = 'No Show' THEN 1 ELSE 0 END) as no_show
    FROM appointments
    WHERE appointment_date BETWEEN ? AND ?
    GROUP BY salesperson
    ORDER BY total DESC`,
    args: [start_date, end_date],
  });

  const dailyResult = await db.execute({
    sql: `SELECT appointment_date as date,
           COUNT(*) as total,
           SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) as delivered
    FROM appointments
    WHERE appointment_date BETWEEN ? AND ?
    GROUP BY appointment_date
    ORDER BY appointment_date ASC`,
    args: [start_date, end_date],
  });

  return res.status(200).json({
    totals,
    dealTypes,
    salespersonStats: salespersonResult.rows,
    dailyCounts: dailyResult.rows,
  });
}
