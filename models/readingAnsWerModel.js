const db = require('../config/db');

// 📦 Jadval yaratish
const createReadingAnswersTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS reading_answersAdminAdmin (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      monthId INT NOT NULL,
      part VARCHAR(50) NOT NULL,
      questionNumber INT NOT NULL,
      questionText TEXT NOT NULL,
      type VARCHAR(50),
      options TEXT,
      userAnswer TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.query(query, (err) => {
    if (err) {
      console.error(' reading_answersAdmin jadvali yaratishda xatolik:', err);
    } else {
      console.log(' reading_answersAdmin jadvali tayyor.');
    }
  });
};
const saveReadingAnswers = (answers, callback) => {
  if (typeof callback !== 'function') {
    console.error(' Callback uzatilmagan yoki noto‘g‘ri turda');
    return;
  }

  if (!Array.isArray(answers) || answers.length === 0) {
    return callback(new Error(" Javoblar ro‘yxati bo‘sh yoki noto‘g‘ri formatda"));
  }

  const { userId, monthId } = answers[0]; // barchasi uchun bir xil

  // 1. Avval eski javoblarni o‘chiramiz
  const deleteSql = `
    DELETE FROM reading_answersAdmin
    WHERE userId = ? AND monthId = ?
  `;

  db.query(deleteSql, [userId, monthId], (deleteErr) => {
    if (deleteErr) return callback(deleteErr);

    // 2. So‘ng yangilarini qo‘shamiz
    const values = answers.map(q => [
      q.userId,
      q.monthId,
      q.part,
      q.questionNumber,
      q.questionText,
      q.type || null,
      JSON.stringify(q.options || []),
      q.userAnswer === null ? null : JSON.stringify(q.userAnswer)
    ]);

    const insertSql = `
      INSERT INTO reading_answersAdmin 
      (userId, monthId, part, questionNumber, questionText, type, options, userAnswer)
      VALUES ?
    `;

    db.query(insertSql, [values], (insertErr, result) => {
      if (insertErr) return callback(insertErr);
      callback(null, result);
    });
  });
};


// 🔍 Ma’lum user va oy uchun javoblar olish
const getReadingAnswersByUserAndMonth = ({ userId, monthId }, callback) => {
  const query = `
    SELECT * FROM reading_answersAdmin
    WHERE userId = ? AND monthId = ?
  `;
  db.query(query, [userId, monthId], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

module.exports = {
  createReadingAnswersTable,
  saveReadingAnswers,
  getReadingAnswersByUserAndMonth,
};
