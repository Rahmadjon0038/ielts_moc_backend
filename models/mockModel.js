const db = require('../config/db');

// Jadval yaratishlar
db.run(`CREATE TABLE IF NOT EXISTS mock_months (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  month TEXT UNIQUE
)`);

db.run(`CREATE TABLE IF NOT EXISTS mock_parts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mock_id INTEGER,
  part TEXT,
  FOREIGN KEY (mock_id) REFERENCES mock_months(id)
)`);

db.run(`CREATE TABLE IF NOT EXISTS active_mock_month (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  mock_id INTEGER,
  FOREIGN KEY (mock_id) REFERENCES mock_months(id)
)`);

// Oy qo‘shish
const createMockMonth = (month, callback) => {
  const query = `INSERT INTO mock_months (month) VALUES (?)`;
  db.run(query, [month], function (err) {
    if (err) return callback(err);

    const mockId = this.lastID;
    const parts = ['writing', 'listening', 'reading', 'speaking'];
    const stmt = db.prepare("INSERT INTO mock_parts (mock_id, part) VALUES (?, ?)");

    for (const part of parts) {
      stmt.run(mockId, part);
    }
    stmt.finalize();

    callback(null, mockId);
  });
};

const getAllMockMonths = (callback) => {
  db.all("SELECT * FROM mock_months", [], callback);
};

const deleteMockMonth = (id, callback) => {
  db.run("DELETE FROM mock_months WHERE id = ?", [id], function (err) {
    callback(err, this.changes);
  });
};

const getMockMonthById = (id, callback) => {
  db.get("SELECT * FROM mock_months WHERE id = ?", [id], callback);
};

// ✅ TUZATILGAN: active_mock_month ni o‘rnatish yoki o‘chirish
const setActiveMockMonth = (mockId, callback) => {
  const query = `
    INSERT INTO active_mock_month (id, mock_id)
    VALUES (1, ?)
    ON CONFLICT(id) DO UPDATE SET mock_id = excluded.mock_id
  `;
  db.run(query, [mockId], function (err) {
    callback(err);
  });
};

// ✅ TUZATILGAN: LEFT JOIN orqali null ham qaytariladi
const getActiveMockMonth = (callback) => {
  const query = `
    SELECT mock_months.*
    FROM active_mock_month
    LEFT JOIN mock_months ON mock_months.id = active_mock_month.mock_id
    WHERE active_mock_month.id = 1
  `;
  db.get(query, [], callback);
};

module.exports = {
  createMockMonth,
  getAllMockMonths,
  deleteMockMonth,
  getMockMonthById,
  setActiveMockMonth,
  getActiveMockMonth
};
