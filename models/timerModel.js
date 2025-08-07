const pool = require('../config/db')
const createSectionTimerTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS section_timer (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      section VARCHAR(50) NOT NULL,
      month_id VARCHAR(7) NOT NULL, -- Masalan: "2025-08"
      start_time DATETIME NOT NULL,
      UNIQUE KEY unique_user_section_month (user_id, section, month_id)
    )
  `;

  pool.query(query, (err) => {
    if (err) {
      console.error('❌ Jadval yaratishda xatolik:', err.message);
    } else {
      console.log('✅ section_timer jadvali yaratildi yoki mavjud!');
    }
  });
};


const insertStartTime = (userId, section, monthId) => {
  const now = new Date();

  const query = `
    INSERT IGNORE INTO section_timer (user_id, section, month_id, start_time)
    VALUES (?, ?, ?, ?)
  `;
  return pool.promise().query(query, [userId, section, monthId, now]);
};


const getStartTime = (userId, section, monthId) => {
  const query = `
    SELECT start_time FROM section_timer
    WHERE user_id = ? AND section = ? AND month_id = ?
  `;
  return pool.promise().query(query, [userId, section, monthId]);
};

module.exports = {
  createSectionTimerTable,
  insertStartTime,
  getStartTime,
};
