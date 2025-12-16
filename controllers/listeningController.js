const {
  insertListeningAnswers,
  getListeningAnswersByUser
} = require('../models/listeningModel');

const db = require('../config/db');

// Javoblarni o‘chirish va yangidan saqlash
const addListeningAnswer = async (req, res) => {
  // ✅ TUZATISH: De-structuringda nomi kichik harfga o'tkazildi (userid, monthid)
  const { userId: userid, monthId: monthid, answers } = req.body; 

  if (!userid || !monthid || !answers || !Array.isArray(answers)) {
    return res.status(400).json({ message: 'Invalid data format' });
  }

  // ✅ TUZATISH: Modelga yuboriladigan ma'lumotlarda ham ustun nomlari kichik harfda
  const values = answers.map((ans) => ({
    userid: userid, // Kichik harf
    monthid: monthid, // Kichik harf
    questionNumber: ans.questionNumber,
    questionText: ans.questionText,
    type: ans.type,
    userAnswers: ans.userAnswers, 
    options: ans.options || []
  }));

  try {
    // ✅ TUZATISH: DELETE so'rovida ustun nomlari kichik harflarga o'tkazildi
    const deleteQuery = `DELETE FROM listening_answers WHERE monthid = $1 AND userid = $2`;
    await db.query(deleteQuery, [monthid, userid]);
    
    // Modelga to'g'ri formatdagi ma'lumot yuborilmoqda
    const insertedCount = await insertListeningAnswers(values); 

    res.status(201).json({ message: 'Answers successfully updated (Postgres)', inserted: insertedCount });
  } catch (err) {
    console.error('Error in addListeningAnswer (Postgres):', err);
    // Xatolik xabarini to'liq ko'rsatish uchun error.message ishlatildi
    return res.status(500).json({ message: 'Failed to save/update answers', error: err.message });
  }
};


// Javoblarni olish
const getListeningAnswer = async (req, res) => {
  // ✅ TUZATISH: Parametrlarni olishda nomi kichik harfga o'tkazildi (userid, monthid)
  const { userId: userid, monthId: monthid } = req.params;

  try {
    // Model funksiyasini chaqirishda ham kichik harfli nomlar ishlatildi
    const answers = await getListeningAnswersByUser(userid, monthid);

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