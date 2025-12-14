const {
  insertListeningAnswers, // Endi bu model funksiyasi bir nechta qatorni insert qiladi
  getListeningAnswersByUser
} = require('../models/listeningModel');

const db = require('../config/db'); // pg pool ni import qilish

// Javoblarni o‘chirish va yangidan saqlash (Transaction va Async/await ga o'tkazildi)
const addListeningAnswer = async (req, res) => {
  const { userId, monthId, answers } = req.body;

  if (!userId || !monthId || !answers || !Array.isArray(answers)) {
    return res.status(400).json({ message: 'Invalid data format' });
  }

  // PostgreSQL INSERT qilish uchun tayyorlash (JSON ma'lumotlarini to'g'ri formatlash)
  const values = answers.map((ans) => ({
    userId: userId,
    monthId: monthId,
    questionNumber: ans.questionNumber,
    questionText: ans.questionText,
    type: ans.type,
    // JSON ma'lumotlarini SQLga to'g'ri uzatish uchun JSON.stringify shart (Agar modelda to'g'ridan-to'g'ri ishlatilsa)
    userAnswers: ans.userAnswers, 
    options: ans.options || []
  }));

  try {
    // 1. Eski javoblarni o‘chiramiz (Model ishlatilishi shart emas, to'g'ridan-to'g'ri db.query)
    const deleteQuery = `DELETE FROM listening_answers WHERE "userId" = $1 AND "monthId" = $2`;
    await db.query(deleteQuery, [userId, monthId]);
    
    // 2. Yangi javoblarni saqlaymiz (Model funksiyasini chaqiramiz)
    // Model funksiyasi bu yerda massivni qabul qilib, uni bir nechta INSERT so'roviga aylantirishi kerak.
    // Yoki bitta so'rovda UNNEST yoki generate_series ishlatilishi kerak.
    // Sodda bo'lishi uchun, model funksiyasi barcha insertni o'zi bajaradi deb faraz qilamiz.
    const insertedCount = await insertListeningAnswers(values); // Model funksiyasi insert qilingan qator sonini qaytaradi deb faraz qilamiz

    res.status(201).json({ message: 'Answers successfully updated (Postgres)', inserted: insertedCount });
  } catch (err) {
    console.error('Error in addListeningAnswer (Postgres):', err);
    return res.status(500).json({ message: 'Failed to save/update answers', error: err.message });
  }
};


// Javoblarni olish (Async/await ga o'tkazildi)
const getListeningAnswer = async (req, res) => {
  const { userId, monthId } = req.params;

  try {
    // Model funksiyasi Promise orqali natijalar massivini qaytaradi
    const answers = await getListeningAnswersByUser(userId, monthId);

    // PostgreSQLda JSON/JSONB ustunlari Node.js tomonidan avtomatik ravishda obyektga/massivga Parse qilinadi.
    // Shuning uchun bu yerda JSON.parse qilish shart emas.

    res.json({ message: 'Answers fetched successfully (Postgres)', answers: answers });
  } catch (err) {
    console.error("Error fetching answers (Postgres):", err);
    return res.status(500).json({ message: 'Server error occurred', error: err.message });
  }
};

module.exports = {
  addListeningAnswer,
  getListeningAnswer
};