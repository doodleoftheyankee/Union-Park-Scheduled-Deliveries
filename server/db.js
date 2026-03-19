import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'deliveries.db');

const db = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    salesperson TEXT NOT NULL,
    appointment_date TEXT NOT NULL,
    appointment_time TEXT NOT NULL,
    deal_type TEXT NOT NULL CHECK(deal_type IN ('Cash', 'Finance', 'Lease')),
    bank TEXT,
    stock_number TEXT,
    vehicle TEXT,
    trade_info TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'Scheduled' CHECK(status IN ('Scheduled', 'Delivered', 'Cancelled', 'No Show')),
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
  CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
  CREATE INDEX IF NOT EXISTS idx_appointments_salesperson ON appointments(salesperson);
`);

export default db;
