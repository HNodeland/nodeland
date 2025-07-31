// server/src/services/migrate.js
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


  // ── 003: expand weather_readings ─────────────────
  const expandedReadingsSql = fs.readFileSync(
    path.join(migrationsDir, '003_expand_weather_readings.sql'),
    'utf8'
  );
  await pool.query(expandedReadingsSql);

  // ── 004: create weather_daily_max ────────────────
  const dailyMaxSql = fs.readFileSync(
    path.join(migrationsDir, '004_create_weather_daily_max.sql'),
    'utf8'
  );
  await pool.query(dailyMaxSql);

  // ── 005: create weather_daily_min ────────────────
  const dailyMinSql = fs.readFileSync(
    path.join(migrationsDir, '005_create_weather_daily_min.sql'),
    'utf8'
  );
  await pool.query(dailyMinSql);

  // ── 006: create weather_daily_avg ────────────────
  const dailyAvgSql = fs.readFileSync(
    path.join(migrationsDir, '006_create_weather_daily_avg.sql'),
    'utf8'
  );
  await pool.query(dailyAvgSql);

  // ── 007: create daily weather summary procedure ────────────────
  const dailySummarySql = fs.readFileSync(
    path.join(migrationsDir, '007_create_daily_weather_summary_procedure.sql'),
    'utf8'
  );
  await pool.query(dailySummarySql);


  console.log('✅ All migrations applied');
}