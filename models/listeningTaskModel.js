const db = require('../config/db');

// Listening jadvalini yaratish
const createListeningTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS listening_tests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      month_id INT NOT NULL,
      test_data JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_month_id (month_id)
    ) ENGINE=InnoDB;
  `;
  db.query(query, (err) => {
    if (err) console.error("Listening jadval yaratishda xatolik:", err);
    else console.log("Listening jadval muvaffaqiyatli yaratildi");
  });
};

// Listening test saqlash/yangilash
const saveListeningTest = (monthId, testData, callback) => {
  db.query(
    'SELECT id FROM listening_tests WHERE month_id = ?',
    [monthId],
    (err, results) => {
      if (err) return callback(err);

      if (results.length > 0) {
        db.query(
          'UPDATE listening_tests SET test_data = ?, updated_at = CURRENT_TIMESTAMP WHERE month_id = ?',
          [JSON.stringify(testData), monthId],
          callback
        );
      } else {
        db.query(
          'INSERT INTO listening_tests (month_id, test_data) VALUES (?, ?)',
          [monthId, JSON.stringify(testData)],
          callback
        );
      }
    }
  );
};

// Month ID bo'yicha listening test olish
const getListeningTestByMonth = (monthId, callback) => {
  db.query(
    'SELECT id, month_id, test_data, created_at, updated_at FROM listening_tests WHERE month_id = ?',
    [monthId],
    (err, results) => {
      if (err) return callback(err);
      
      if (results.length === 0) {
        return callback(null, null);
      }

      const result = results[0];
      try {
        result.test_data = JSON.parse(result.test_data);
        callback(null, result);
      } catch (parseErr) {
        callback(parseErr);
      }
    }
  );
};

// Barcha listening testlarni olish
const getAllListeningTests = (callback) => {
  db.query(
    'SELECT id, month_id, created_at, updated_at FROM listening_tests ORDER BY month_id DESC',
    [],
    callback
  );
};

// Listening test o'chirish
const deleteListeningTest = (monthId, callback) => {
  db.query(
    'DELETE FROM listening_tests WHERE month_id = ?',
    [monthId],
    callback
  );
};

module.exports = {
  createListeningTable,
  saveListeningTest,
  getListeningTestByMonth,
  getAllListeningTests,
  deleteListeningTest
};