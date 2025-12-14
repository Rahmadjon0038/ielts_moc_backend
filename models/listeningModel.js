const db = require('../config/db'); // pg pool ni import qilish

// Jadvalni yaratish (o'zgarishsiz, hozircha mavjud jadvalga teginmaymiz)
const createListeningAnswersTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS listening_answers (
        id SERIAL PRIMARY KEY,
        userId INT,
        monthId INT,
        questionNumber INT,
        questionText TEXT,
        type VARCHAR(50), 
        userAnswers JSONB,
        options JSONB
    );
  `;
  db.query(query)
    .then(() => {
      console.log("✅ Listening javoblari jadvali tayyor (Postgres).");
    })
    .catch((err) => {
      console.error("❌ Listening javoblari jadvalida xatolik:", err);
    });
};

// Javoblarni qo‘shish (Tuzatilgan)
const insertListeningAnswers = async (data) => {
  if (!data || data.length === 0) {
    throw new Error("Javoblar ma'lumoti topilmadi."); 
  }

  const placeholders = data.map((_, index) => {
    const base = index * 7;
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7})`;
  }).join(', ');

  let flatValues = [];
  data.forEach(answer => {
    flatValues.push(
      answer.userId,
      answer.monthId,
      answer.questionNumber,
      answer.questionText,
      answer.type,
      // JSONB uchun stringify: Controllerda o'chirildi, Modelda bo'lishi kerak.
      JSON.stringify(answer.userAnswers || []), 
      JSON.stringify(answer.options || []) 
    );
  });
  
  const query = `
    INSERT INTO listening_answers (
      -- ✅ TUZATISH: Ustun nomlarini kichik harflarga o'tkazdik (Postgres shunday saqlaydi)
      userid, monthid, questionnumber, questiontext, type, useranswers, options
    )
    VALUES ${placeholders}
  `;

  try {
    const result = await db.query(query, flatValues); 
    return result.rowCount; 
  } catch (err) {
    throw err; 
  }
};

// Javoblarni olish (Tuzatilgan)
const getListeningAnswersByUser = async (userId, monthId) => {
  const query = `
    SELECT * FROM listening_answers WHERE userid = $1 AND monthid = $2
  `;
  // ✅ TUZATISH: Ustun nomlari kichik harflarda
  
  try {
    const result = await db.query(query, [userId, monthId]); 
    return result.rows; 
  } catch (err) {
    throw err; 
  }
};

module.exports = {
  createListeningAnswersTable,
  insertListeningAnswers,
  getListeningAnswersByUser
};