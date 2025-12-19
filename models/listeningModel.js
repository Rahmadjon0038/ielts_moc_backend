const db = require("../config/db"); // pg pool ni import qilish

// ✅ TUZATISH: Jadvalni yaratish so'rovi to'liq kichik harfli ustun nomlariga o'tkazildi
const createListeningAnswersTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS listening_answers (
        id SERIAL PRIMARY KEY,
        userid INT,
        monthid INT,
        questionnumber INT,
        questiontext TEXT,
        type VARCHAR(50), 
        useranswers JSONB,
        options JSONB
    );
  `;
  db.query(query)
    .then(() => {
      console.log("✅ Listening javoblari jadvali tayyor .");
    })
    .catch((err) => {
      console.error("❌ Listening javoblari jadvalida xatolik:", err);
    });
};

// Javoblarni qo‘shish (Controllerdan to'g'ri ma'lumot kelishi kutiladi)
const insertListeningAnswers = async (data) => {
  if (!data || data.length === 0) {
    return 0;
  }

  const placeholders = data
    .map((_, index) => {
      const base = index * 7;
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${
        base + 5
      }, $${base + 6}, $${base + 7})`;
    })
    .join(", ");

  let flatValues = [];
  data.forEach((answer) => {
    flatValues.push(
      answer.userid, // ✅ Kichik harf
      answer.monthid, // ✅ Kichik harf
      answer.questionNumber,
      answer.questionText,
      answer.type,
      JSON.stringify(answer.userAnswers || []),
      JSON.stringify(answer.options || [])
    );
  });

  const query = `
    INSERT INTO listening_answers (
      userid, monthid, questionnumber, questiontext, type, useranswers, options
    )
    VALUES ${placeholders}
    RETURNING id
  `;

  try {
    const result = await db.query(query, flatValues);
    return result.rowCount;
  } catch (err) {
    console.error("❌ Xatolik insertListeningAnswers:", err);
    throw err;
  }
};

// Javoblarni olish
const getListeningAnswersByUser = async (userid, monthid) => {
  const query = `
    SELECT * FROM listening_answers WHERE userid = $1 AND monthid = $2
  `;
  // ✅ Kichik harfli ustun nomlari

  try {
    const result = await db.query(query, [userid, monthid]);
    return result.rows;
  } catch (err) {
    console.error("❌ Xatolik getListeningAnswersByUser:", err);
    throw err;
  }
};

module.exports = {
  createListeningAnswersTable,
  insertListeningAnswers,
  getListeningAnswersByUser,
};
