const db = require('../config/db');

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

// Oy qo‘shish
const createMockMonth = (month, callback) => {
    const query = `INSERT INTO mock_months (month) VALUES (?)`;
    db.run(query, [month], function (err) {
        if (err) return callback(err);
        const mockId = this.lastID;

        // 4 ta test turi qo‘shamiz
        const parts = ['writing', 'listening', 'reading', 'speaking'];
        const stmt = db.prepare("INSERT INTO mock_parts (mock_id, part) VALUES (?, ?)");

        for (const part of parts) {
            stmt.run(mockId, part);
        }
        stmt.finalize();

        callback(null, mockId);
    });
};

// Barcha mock oylarini olish
const getAllMockMonths = (callback) => {
    db.all("SELECT * FROM mock_months", [], callback);
};

const deleteMockMonth = (id, callback) => {
    const query = `DELETE FROM mock_months WHERE id = ?`;
    db.run(query, [id], function (err) {
        callback(err, this.changes); // this.changes => nechta row o‘chdi
    });
};
const getMockMonthById = (id, callback) => {
    const query = `SELECT * FROM mock_months WHERE id = ?`;
    db.get(query, [id], (err, row) => {
        callback(err, row);
    });
};

module.exports = {
    createMockMonth,
    getAllMockMonths,
    deleteMockMonth,
    getMockMonthById
};
