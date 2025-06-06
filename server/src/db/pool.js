import mysql from 'mysql2/promise';
import config from '../config/index.js';

const pool = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // allow multi‐statement migrations
  multipleStatements: true,
});

export default pool;