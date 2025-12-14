const db = require('../config/db'); // pg pool ni import qilish

// 📦 Jadval yaratish (Model funksiyasi emas, shunchaki chaqiriladi)
const createReadingAnswersTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS reading_answersAdmin (
      id SERIAL PRIMARY KEY,
      userId INT NOT NULL,
      monthId INT NOT NULL,
      part VARCHAR(50) NOT NULL,
      questionNumber INT NOT NULL,
      questionText TEXT NOT NULL,
      type VARCHAR(50),
      options JSONB,
      userAnswer JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  db.query(query)
    .then(() => {
      console.log('✅ reading_answersAdmin jadvali tayyor (Postgres).');
    })
    .catch((err) => {
      console.error('❌ reading_answersAdmin jadvali yaratishda xatolik:', err);
    });
};

// Javoblarni saqlash (To'liq Promise/async ga o'tkazildi)
const saveReadingAnswers = async (answers) => {
  if (!Array.isArray(answers) || answers.length === 0) {
    throw new Error("Javoblar ro‘yxati bo‘sh yoki noto‘g‘ri formatda");
  }

  // ✅ userId va monthId ni so'rovlar uchun o'zgaruvchi sifatida olamiz
  const { userId, monthId } = answers[0]; 

  // PostgreSQL INSERT VALUES sintaksisini yaratish
  const placeholders = answers.map((_, index) => {
      const base = index * 8; // Har bir qator 8 ta ustundan iborat
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8})`;
  }).join(', ');

  let flatValues = [];
  answers.forEach(q => {
      // ✅ TUZATISH: JSONB ustunlariga ma'lumot yuborishdan oldin JSON.stringify() ishlatamiz
      const optionsString = q.options ? JSON.stringify(q.options) : null;
      
      // userAnswer ni ham JSON.stringify dan o'tkazamiz
      // null bo'lsa, uni null sifatida qoldiramiz (Postgres uchun null)
      const userAnswerString = q.userAnswer === null ? null : JSON.stringify(q.userAnswer);

      flatValues.push(
          q.userId,
          q.monthId,
          q.part,
          q.questionNumber,
          q.questionText,
          q.type || null,
          optionsString,      // ✅ Endi JSON string
          userAnswerString    // ✅ Endi JSON string
      );
  });

  const deleteSql = `
    DELETE FROM reading_answersAdmin
    WHERE userId = $1 AND monthId = $2
  `;

  const insertSql = `
    INSERT INTO reading_answersAdmin 
    (userId, monthId, part, questionNumber, questionText, type, options, userAnswer)
    VALUES ${placeholders}
  `;

  try {
    // 1. Avval eski javoblarni o‘chiramiz
    await db.query(deleteSql, [userId, monthId]);
    
    // 2. So‘ng yangilarini qo‘shamiz
    const result = await db.query(insertSql, flatValues);
    
    return result.rowCount; // Kiritilgan qatorlar sonini qaytaramiz
  } catch (err) {
    // Xatolikni yuqoriga uzatamiz
    throw err;
  }
};


// 🔍 Ma’lum user va oy uchun javoblar olish (To'liq Promise/async ga o'tkazildi)
const getReadingAnswersByUserAndMonth = async ({ userId, monthId }) => {
  const query = `
    SELECT * FROM reading_answersAdmin
    WHERE userId = $1 AND monthId = $2
  `;
  
  try {
    const result = await db.query(query, [userId, monthId]);
    // Natijalar massivini qaytaramiz
    return result.rows; 
  } catch (err) {
    throw err;
  }
};

module.exports = {
  createReadingAnswersTable,
  saveReadingAnswers,
  getReadingAnswersByUserAndMonth,
};