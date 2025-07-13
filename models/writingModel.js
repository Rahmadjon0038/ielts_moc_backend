const db = require('../config/db');

// Jadval yaratish (agar mavjud bo‘lmasa)
const createWritingTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS writing_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mock_id INTEGER UNIQUE,
      task1 TEXT,
      task2 TEXT
    )
  `;
  db.run(query, (err) => {
    if (err) {
      console.error('❌ Writing jadvalini yaratishda xatolik:', err.message);
    } else {
      console.log('✅ writing_tasks jadvali tayyor');
    }
  });
};

// Writing qo‘shish yoki yangilash
const upsertWritingTask = (mock_id, task1, task2, callback) => {
  const query = `
    INSERT INTO writing_tasks (mock_id, task1, task2)
    VALUES (?, ?, ?)
    ON CONFLICT(mock_id) DO UPDATE SET
      task1 = excluded.task1,
      task2 = excluded.task2
  `;
  db.run(query, [mock_id, task1, task2], function (err) {
    callback(err);
  });
};

// Writing olish (faqat bitta yozuv)
const getWritingTask = (mock_id, callback) => {
  const query = `SELECT task1, task2 FROM writing_tasks WHERE mock_id = ?`;
  db.get(query, [mock_id], (err, row) => {
    callback(err, row);
  });
};

module.exports = {
  createWritingTable,
  upsertWritingTask,
  getWritingTask
};
