const db = require('../config/db');

// Jadvalni yaratish (1 marta ishga tushuriladi)
const createListeningAnswersTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS listening_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  monthId INT,
  questionNumber INT,
  questionText TEXT,
  type VARCHAR(50), -- 👈 BU joy yangi
  userAnswers JSON, -- 👈 BU ham yangi
  options JSON      -- 👈 BU ham yangi
);

  `;
  db.query(query, (err) => {
    if (err) {
      console.error("❌ Listening javoblari jadvalida xatolik:", err);
    } else {
      console.log("✅ Listening javoblari jadvali tayyor.");
    }
  });
};

// Javoblarni qo‘shish
const insertListeningAnswers = (data, callback) => {
  const values = [];

  data.answers.forEach(answer => {
    const answersString = JSON.stringify(answer.userAnswers); // array ni stringga aylantiramiz
    values.push([
      data.userId,
      data.monthId,
      answer.questionNumber,
      answer.questionText,
      answer.type,
      answersString
    ]);
  });

  const query = `
    INSERT INTO listening_answers (userId, monthId, questionNumber, questionText, answerType, userAnswer)
    VALUES ?
  `;

  db.query(query, [values], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

// Javoblarni olish (userId va monthId bo‘yicha)
const getListeningAnswersByUser = (userId, monthId, callback) => {
  const query = `
    SELECT * FROM listening_answers WHERE userId = ? AND monthId = ?
  `;
  db.query(query, [userId, monthId], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

module.exports = {
  createListeningAnswersTable,
  insertListeningAnswers,
  getListeningAnswersByUser
};
