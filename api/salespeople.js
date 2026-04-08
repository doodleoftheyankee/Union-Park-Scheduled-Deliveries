import db, { initDb } from './db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await initDb();

  const result = await db.execute('SELECT DISTINCT salesperson FROM appointments ORDER BY salesperson ASC');
  const team = [
    'Jim VanDyke', 'Chris Meeks', 'Sam Williams', 'Andrea Guido',
    'Tom Guido', 'Alfonso Colon', 'Javier Aviles', 'Eddie Perez',
    'Armando Charriez',
  ];
  const fromDb = result.rows.map(r => r.salesperson);
  const merged = [...new Set([...team, ...fromDb])].sort();
  return res.status(200).json(merged);
}
