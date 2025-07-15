// models/userAnswers.js
const db = require('../config/db');

// Ushbu oyga javob bergan userlarni olish
const getUsersByMonthId = (monthId, callback) => {
  const query = `
    SELECT DISTINCT users.id, users.username
    FROM writing_answers
    JOIN users ON writing_answers.user_id = users.id
    WHERE writing_answers.month_id = ?
  `;
  db.all(query, [monthId], (err, rows) => {
    callback(err, rows);
  });
};

module.exports = {
  getUsersByMonthId,
};
