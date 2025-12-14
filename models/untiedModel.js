const db = require('../config/db'); // pg pool ni import qilish

// 📦 Jadval yaratish (Model funksiyasi emas, shunchaki chaqiriladi)
const createSubmissionsTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS submissions (
      id SERIAL PRIMARY KEY,
      userId INT NOT NULL,
      monthId INT NOT NULL,
      section VARCHAR(100) NOT NULL,
      UNIQUE (userId, monthId, section)
    );
  `;
  db.query(query)
    .then(() => {
      console.log('✅ Submissions jadvali tayyor (Postgres).');
    })
    .catch((err) => {
      console.error('❌ Submissions jadvalini yaratishda xatolik:', err);
    });
};

// 💾 createSubmission — javobni saqlash (To'liq Promise/async ga o'tkazildi)
// ✅ callback argumenti olib tashlandi
const createSubmission = async ({ userId, monthId, section }) => {
  const query = `
    INSERT INTO submissions (userId, monthId, section) 
    VALUES ($1, $2, $3) 
    ON CONFLICT (userId, monthId, section) DO NOTHING
    RETURNING id
  `;
  
  try {
    const result = await db.query(query, [userId, monthId, section]);
    // Agar kiritilsa, ID ni qaytaramiz. Agar ON CONFLICT tufayli DO NOTHING bo'lsa, rows[0] undefined bo'lishi mumkin.
    return result.rows[0]?.id || null;
  } catch (err) {
    throw err; 
  }
};

// 🔍 hasUserSubmitted — tekshiradi: user allaqachon bu sectionni yechganmi? (To'liq Promise/async ga o'tkazildi)
// ✅ callback argumenti olib tashlandi
const hasUserSubmitted = async ({ userId, monthId, section }) => {
  const query = `SELECT id FROM submissions WHERE userId = $1 AND monthId = $2 AND section = $3`;
  
  try {
    const result = await db.query(query, [userId, monthId, section]);
    // true/false qaytaramiz
    return result.rows.length > 0; 
  } catch (err) {
    throw err;
  }
};


module.exports = {
  createSubmissionsTable,
  createSubmission,
  hasUserSubmitted
};