const db = require('../config/db');


// ================== WRITING TASKS (ADMIN UCHUN) ===================

// Jadval yaratish (admin tomonidan qo‘yilgan writing topshiriqlar)
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

// Writing qo‘shish yoki yangilash (admin tomonidan)
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

// Admin tomonidan berilgan writing taskni olish
const getWritingTask = (mock_id, callback) => {
  const query = `SELECT task1, task2 FROM writing_tasks WHERE mock_id = ?`;
  db.get(query, [mock_id], (err, row) => {
    callback(err, row);
  });
};


// ================== WRITING ANSWERS (USER YUBORGAN JAVOBLAR) ===================

// Foydalanuvchi javoblari uchun jadval
const createWritingAnswersTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS writing_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      month_id TEXT,
      section TEXT,
      task1 TEXT,
      task2 TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.run(query, (err) => {
    if (err) {
      console.error('❌ writing_answers jadvalini yaratishda xatolik:', err.message);
    } else {
      console.log('✅ writing_answers jadvali tayyor');
    }
  });
};

// Foydalanuvchi javobini saqlash
const saveUserWritingAnswer = (userId, monthId, section, answers, callback) => {
  const query = `
    INSERT INTO writing_answers (user_id, month_id, section, task1, task2)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.run(query, [userId, monthId, section, answers.task1, answers.task2], function (err) {
    callback(err);
  });
};

// Bitta userning ma’lum oydagi writing javoblarini olish
const getWritingAnswersByMonthAndUser = (monthId, userId, callback) => {
  const query = `
    SELECT * FROM writing_answers
    WHERE month_id = ? AND user_id = ?
  `;
  db.all(query, [monthId, userId], (err, rows) => {
    callback(err, rows);
  });
};


module.exports = {
  // Tasks (admin)
  createWritingTable,
  upsertWritingTask,
  getWritingTask,

  // Answers (user)
  createWritingAnswersTable,
  saveUserWritingAnswer,
  getWritingAnswersByMonthAndUser
};
