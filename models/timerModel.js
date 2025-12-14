const pool = require('../config/db'); // pg pool ni import qilish

// Jadval yaratish (Model funksiyasi emas, shunchaki chaqiriladi)
const createSectionTimerTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS section_timer (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL,
      section VARCHAR(50) NOT NULL,
      month_id VARCHAR(7) NOT NULL,
      start_time TIMESTAMP WITH TIME ZONE NOT NULL,
      
      UNIQUE (user_id, section, month_id) 
    );
  `;

  pool.query(query)
    .then(() => {
      console.log('✅ section_timer jadvali yaratildi yoki mavjud (Postgres)!');
    })
    .catch((err) => {
      console.error('❌ Jadval yaratishda xatolik:', err.message);
    });
};


// Boshlanish vaqtini kiritish (To'liq Async/await ga o'tkazildi)
const insertStartTime = async (userId, section, monthId) => {
  // PostgreSQLda ON CONFLICT ishlatiladi. Agar ziddiyat yuzaga kelsa, HEC BIR ISH QILMA.
  const query = `
    INSERT INTO section_timer (user_id, section, month_id, start_time)
    VALUES ($1, $2, $3, NOW())
    ON CONFLICT (user_id, section, month_id) 
    DO NOTHING;
  `;
  
  try {
    // Shunchaki so'rovni bajarish, natijani qaytarish shart emas
    await pool.query(query, [userId, section, monthId]);
    return true;
  } catch (err) {
    throw err;
  }
};


// Boshlanish vaqtini olish (To'liq Async/await ga o'tkazildi)
const getStartTime = async (userId, section, monthId) => {
  const query = `
    SELECT start_time FROM section_timer
    WHERE user_id = $1 AND section = $2 AND month_id = $3
  `;
  
  try {
    const result = await pool.query(query, [userId, section, monthId]);
    // Yagona qatorni yoki null ni qaytaramiz
    return result.rows[0] || null;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  createSectionTimerTable,
  insertStartTime,
  getStartTime,
};