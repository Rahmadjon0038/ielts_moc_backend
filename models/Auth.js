const db = require('../config/db');

db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'user'
)`);

const createUser = ({ username, email, password, role = 'user' }, callback) => {
  const query = `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`;
  db.run(query, [username, email, password, role], function(err) {
    callback(err, this.lastID);
  });
};


const findUserByUsername = (username, callback) => {
    db.get(`SELECT * FROM users WHERE username = ?`, [username], callback);
};

const findUserByEmail = (email, callback) => {
    db.get(`SELECT * FROM users WHERE email = ?`, [email], callback);
};

module.exports = { createUser, findUserByUsername, findUserByEmail };
