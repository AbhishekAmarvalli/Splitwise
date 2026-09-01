const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle connection', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.execute(text, params),
  getConnection: () => pool.getConnection(),
  pool,
};
