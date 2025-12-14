const db = require('../config/db'); // pg pool ni import qilish

// ❗ create table if not exists (Model funksiyasi emas, shunchaki chaqiriladi)
const createUsersTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255),
      email VARCHAR(255) UNIQUE,
      password VARCHAR(255),
      role VARCHAR(50) DEFAULT 'user'
    );
  `;
  // pg.Pool.query Promise qaytaradi
  db.query(query)
    .then(() => {
      console.log(' Users jadvali tayyor (Postgres).');
    })
    .catch((err) => {
      console.error('Users jadvalini yaratishda xatolik:', err);
    });
};

// 💾 createUser — foydalanuvchi qo‘shish (To'liq Promise/async ga o'tkazildi)
// ✅ callback argumenti olib tashlandi
const createUser = async ({ username, email, password, role = 'user' }) => {
  const query = `INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id`;
  
  try {
    const result = await db.query(query, [username, email, password, role]);
    // Kiritilgan ID ni qaytaramiz
    return result.rows[0].id; 
  } catch (err) {
    // Xatolikni yuqoriga uzatamiz (masalan, UNIQUE CONSTAINT xatosi)
    throw err;
  }
};

// 🔍 Username bo‘yicha topish (To'liq Promise/async ga o'tkazildi)
// ✅ callback argumenti olib tashlandi
const findUserByUsername = async (username) => {
  const query = `SELECT id, username, email, role, password FROM users WHERE username = $1`;
  
  try {
    const result = await db.query(query, [username]);
    // Topilgan foydalanuvchi obyektini yoki null ni qaytaramiz
    return result.rows[0] || null; 
  } catch (err) {
    throw err;
  }
};

// 🔍 Email bo‘yicha topish (To'liq Promise/async ga o'tkazildi)
// ✅ callback argumenti olib tashlandi
const findUserByEmail = async (email) => {
  const query = `SELECT id, username, email, role, password FROM users WHERE email = $1`;
  
  try {
    const result = await db.query(query, [email]);
    // Topilgan foydalanuvchi obyektini yoki null ni qaytaramiz
    return result.rows[0] || null;
  } catch (err) {
    throw err;
  }
};


module.exports = {
  createUsersTable,
  createUser,
  findUserByUsername,
  findUserByEmail
};