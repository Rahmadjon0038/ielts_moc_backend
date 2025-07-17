const db = require('../config/db');

// Ushbu oyga javob bergan userlarni olish
const getUsersByMonthId = (monthId, callback) => {
  const query = `
    SELECT DISTINCT users.id, users.username
    FROM writing_answers
    JOIN users ON writing_answers.user_id = users.id
    WHERE writing_answers.month_id = ?
  `;
  db.query(query, [monthId], (err, results) => {
    callback(err, results);
  });
};

module.exports = {
  getUsersByMonthId,
};
