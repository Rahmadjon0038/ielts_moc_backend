// models/authModel.js
const db = require('../config/db')

// ❗ create table if not exists — faqat dastlabki ishga tushishda ishlatiladi
const createUsersTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) ,
      email VARCHAR(255) UNIQUE,
      password VARCHAR(255),
      role VARCHAR(50) DEFAULT 'user'
    )
  `;
  db.query(query, (err) => {
    if (err) {
      console.error('Users jadvalini yaratishda xatolik:', err);
    } else {
      console.log(' Users jadvali tayyor.');
    }
  });
};

// 💾 createUser — foydalanuvchi qo‘shish
const createUser = ({ username, email, password, role = 'user' }, callback) => {
  const query = `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`;
  db.query(query, [username, email, password, role], (err, result) => {
    if (err) return callback(err);
    callback(null, result.insertId); // SQLite'dagi `this.lastID` o‘rniga
  });
};

// 🔍 Username bo‘yicha topish
const findUserByUsername = (username, callback) => {
  const query = `SELECT * FROM users WHERE username = ?`;
  db.query(query, [username], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]); // SQLite'dagi `db.get` o‘rniga
  });
};

// 🔍 Email bo‘yicha topish
const findUserByEmail = (email, callback) => {
  const query = `SELECT * FROM users WHERE BINARY email = ?`;
  db.query(query, [email], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
};


module.exports = {
  createUsersTable,
  createUser,
  findUserByUsername,
  findUserByEmail
};
