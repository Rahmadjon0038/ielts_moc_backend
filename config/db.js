const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'rahmadjon',
  password: 'yangi_parolingiz',
  database: 'ieltsMock',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

module.exports = pool;
