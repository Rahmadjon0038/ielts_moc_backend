const db = require('../config/db');

// ================== WRITING TASKS (ADMIN UCHUN) ===================

// Jadval yaratish (rasm ustunlari bilan)
const createWritingTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS writing_tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      mock_id INT UNIQUE,
      task1 TEXT,
      task2 TEXT,
      task1_image TEXT,
      task2_image TEXT
    )
  `;
  db.query(query, (err) => {
    if (err) {
      console.error('❌ Writing jadvalini yaratishda xatolik:', err.message);
    } else {
      console.log('✅ writing_tasks jadvali tayyor');
    }
  });
};

// Writing qo‘shish yoki yangilash
const upsertWritingTask = (mock_id, task1, task2, task1Image, task2Image, callback) => {
  const query = `
    INSERT INTO writing_tasks (mock_id, task1, task2, task1_image, task2_image)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      task1 = VALUES(task1),
      task2 = VALUES(task2),
      task1_image = VALUES(task1_image),
      task2_image = VALUES(task2_image)
  `;
  db.query(query, [mock_id, task1, task2, task1Image, task2Image], (err, result) => {
    callback(err);
  });
};

// Writingni olish
const getWritingTask = (mock_id, callback) => {
  const query = `SELECT task1, task2, task1_image, task2_image FROM writing_tasks WHERE mock_id = ?`;
  db.query(query, [mock_id], (err, results) => {
    callback(err, results[0]);
  });
};

// ================== WRITING ANSWERS (USER) ===================

const createWritingAnswersTable = () => {
  const query = `
   CREATE TABLE IF NOT EXISTS writing_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  month_id INT,
  section TEXT,
  task1 TEXT,
  task2 TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_month_section (user_id, month_id, section)
)
  `;
  db.query(query, (err) => {
    if (err) {
      console.error('❌ writing_answers jadvalini yaratishda xatolik:', err.message);
    } else {
      console.log('✅ writing_answers jadvali tayyor');
    }
  });
};

const saveUserWritingAnswer = (userId, monthId, section, answers, callback) => {
  const query = `
    INSERT INTO writing_answers (user_id, month_id, section, task1, task2)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      task1 = VALUES(task1),
      task2 = VALUES(task2),
      created_at = CURRENT_TIMESTAMP
  `;
  db.query(query, [userId, monthId, section, answers.task1, answers.task2], (err, result) => {
    callback(err);
  });
};


const getWritingAnswersByMonthAndUser = (monthId, userId, callback) => {
  const query = `
    SELECT * FROM writing_answers
    WHERE month_id = ? AND user_id = ?
  `;
  db.query(query, [monthId, userId], (err, results) => {
    callback(err, results);
  });
};












// Raitinglar jadvalini yaratish
const createRaitingsTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS raitings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      month_id INT,
      section VARCHAR(50),
      score VARCHAR(10),
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_section_month (user_id, month_id, section)
    )
  `;
  db.query(query, (err) => {
    if (err) {
      console.error('❌ Raitings jadvalini yaratishda xatolik:', err.message);
    } else {
      console.log('✅ raitings jadvali tayyor');
    }
  });
};

// Bahoni saqlash yoki yangilash
const upsertUserRaiting = (user_id, month_id, section, score, comment, callback) => {
  const query = `
    INSERT INTO raitings (user_id, month_id, section, score, comment)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      score = VALUES(score),
      comment = VALUES(comment)
  `;
  db.query(query, [user_id, month_id, section, score, comment], (err, result) => {
    callback(err);
  });
};

// Bahoni olish
const getUserRaitingmodel = (user_id, month_id, section, callback) => {
  const query = `
    SELECT * FROM raitings
    WHERE user_id = ? AND month_id = ? AND section = ?
  `;
  db.query(query, [user_id, month_id, section], (err, results) => {
    callback(err, results[0]);
  });
};


module.exports = {
  // Admin
  createWritingTable,
  upsertWritingTask,
  getWritingTask,
  // User
  createWritingAnswersTable,
  saveUserWritingAnswer,
  getWritingAnswersByMonthAndUser,

  //rraitings
  createRaitingsTable,
  upsertUserRaiting,
  getUserRaitingmodel

};
