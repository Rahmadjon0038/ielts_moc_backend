const db = require('../config/db');

// 🛠 Jadval yaratishlar (faqat bir marta chaqiriladi)
const createMockTables = () => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS mock_months (
      id INT AUTO_INCREMENT PRIMARY KEY,
      month VARCHAR(255) UNIQUE
    )`,
    `CREATE TABLE IF NOT EXISTS mock_parts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      mock_id INT,
      part VARCHAR(50),
      FOREIGN KEY (mock_id) REFERENCES mock_months(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS active_mock_month (
      id INT PRIMARY KEY CHECK (id = 1),
      mock_id INT,
      FOREIGN KEY (mock_id) REFERENCES mock_months(id) ON DELETE SET NULL
    )`
  ];

  queries.forEach(query => {
    db.query(query, (err) => {
      if (err) console.error(" Jadval yaratishda xatolik:", err);
    });
  });
};

//  Oy qo‘shish + 4ta part yaratish
const createMockMonth = (month, callback) => {
  const insertMonth = `INSERT INTO mock_months (month) VALUES (?)`;
  db.query(insertMonth, [month], (err, result) => {
    if (err) return callback(err);

    const mockId = result.insertId;
    const parts = ['writing', 'listening', 'reading', 'speaking'];
    const partQueries = parts.map(part => [mockId, part]);

    const insertParts = `INSERT INTO mock_parts (mock_id, part) VALUES ?`;
    db.query(insertParts, [partQueries], (err2) => {
      if (err2) return callback(err2);
      callback(null, mockId);
    });
  });
};

//  Barcha mock_months
const getAllMockMonths = (callback) => {
  db.query("SELECT * FROM mock_months", (err, results) => {
    callback(err, results);
  });
};

//  O'chirish
const deleteMockMonth = (id, callback) => {
  db.query("DELETE FROM mock_months WHERE id = ?", [id], (err, result) => {
    callback(err, result.affectedRows);
  });
};

//  ID orqali topish
const getMockMonthById = (id, callback) => {
  db.query("SELECT * FROM mock_months WHERE id = ?", [id], (err, results) => {
    callback(err, results[0]);
  });
};

//  active_mock_month ni o‘rnatish
const setActiveMockMonth = (mockId, callback) => {
  const query = `
    INSERT INTO active_mock_month (id, mock_id)
    VALUES (1, ?)
    ON DUPLICATE KEY UPDATE mock_id = VALUES(mock_id)
  `;
  db.query(query, [mockId], callback);
};

//  active_mock_month ni olish
const getActiveMockMonth = (callback) => {
  const query = `
    SELECT m.* FROM active_mock_month a
    LEFT JOIN mock_months m ON a.mock_id = m.id
    WHERE a.id = 1
  `;
  db.query(query, (err, results) => {
    callback(err, results[0]);
  });
};

module.exports = {
  createMockTables,
  createMockMonth,
  getAllMockMonths,
  deleteMockMonth,
  getMockMonthById,
  setActiveMockMonth,
  getActiveMockMonth
};
