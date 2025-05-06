import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../db/pool.js';
import config from '../config/index.js';

export default async function migrate() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname  = path.dirname(__filename);
  const migrationsDir = path.resolve(__dirname, '../../migrations');

  console.log('🛠  Running migrations');

  // ── 000: users table ─────────────────────────────
  const usersSql = fs.readFileSync(
    path.join(migrationsDir, '000_create_users_table.sql'),
    'utf8'
  );
  await pool.query(usersSql);

  // ── 001: ensure language column (JS conditional) ──
  const [cols] = await pool.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ?
       AND TABLE_NAME   = 'users'
       AND COLUMN_NAME  = 'language'`,
    [config.db.database]
  );
  if (cols.length === 0) {
    console.log('→ Adding missing language column to users');
    await pool.query(
      `ALTER TABLE users
         ADD COLUMN language VARCHAR(5) NOT NULL DEFAULT 'en'`
    );
  }

  // ── 002: weather_stats table ─────────────────────
  const statsSql = fs.readFileSync(
    path.join(migrationsDir, '002_create_weather_stats_table.sql'),
    'utf8'
  );
  await pool.query(statsSql);

  // ── 003: weather_readings table ──────────────────
  const readingsSql = fs.readFileSync(
    path.join(migrationsDir, '003_create_weather_readings_table.sql'),
    'utf8'
  );
  await pool.query(readingsSql);

  console.log('✅ All migrations applied');
}