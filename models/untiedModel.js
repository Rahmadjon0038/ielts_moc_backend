const db = require('../config/db');

// 📦 Jadval yaratish (faqat birinchi ishga tushganda)
const createSubmissionsTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS submissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      monthId INT NOT NULL,
      section VARCHAR(100) NOT NULL,
      UNIQUE KEY unique_submission (userId, monthId, section)
    )
  `;
  db.query(query, (err) => {
    if (err) {
      console.error('❌ Submissions jadvalini yaratishda xatolik:', err);
    } else {
      console.log('✅ Submissions jadvali tayyor.');
    }
  });
};

// 💾 createSubmission — javobni saqlash
const createSubmission = ({ userId, monthId, section }, callback) => {
  const query = `INSERT INTO submissions (userId, monthId, section) VALUES (?, ?, ?)`;
  db.query(query, [userId, monthId, section], (err, result) => {
    if (err) return callback(err);
    callback(null, result.insertId);
  });
};

// 🔍 hasUserSubmitted — tekshiradi: user allaqachon bu sectionni yechganmi?
const hasUserSubmitted = ({ userId, monthId, section }, callback) => {
  const query = `SELECT * FROM submissions WHERE userId = ? AND monthId = ? AND section = ?`;
  db.query(query, [userId, monthId, section], (err, results) => {
    if (err) return callback(err);
    callback(null, results.length > 0); // true bo‘lsa: yechgan
  });
};




module.exports = {
  createSubmissionsTable,
  createSubmission,
  hasUserSubmitted
};
