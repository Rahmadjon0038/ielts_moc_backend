const { saveReadingAnswers, getReadingAnswersByUserAndMonth } = require("../models/readingAnsWerModel");

//  Javoblarni qabul qilish va saqlash (Async/await ga o'tkazildi)
const submitReadingAnswers = async (req, res) => {
  // Funksiyani async qildik
  const { userId, monthId, questions } = req.body;
  
  // console.log("saveReadingAnswers:", saveReadingAnswers); // Endi bu model funksiyasi bo'ladi

  if (!userId || !monthId || !Array.isArray(questions)) {
    return res.status(400).json({ message: 'The information is incomplete.' });
  }

  const formattedAnswers = questions.map(q => ({
    userId,
    monthId,
    part: q.part,
    questionNumber: q.questionNumber,
    questionText: q.questionText,
    type: q.type,
    options: q.options || [],
    userAnswer: q.userAnswer
  }));

  try {
    // ✅ Model funksiyasini await bilan chaqiramiz (callback o'rniga)
    await saveReadingAnswers(formattedAnswers); 

    return res.status(201).json({ message: 'Answers successfully saved (Postgres).' });
  } catch (err) {
    console.error('Error saving answers (Postgres):', err.message);
    // Xatolikni qaytarish
    return res.status(500).json({ message: 'Error saving answers', error: err.message });
  }
};

//  Admin uchun — user va oy bo‘yicha javoblarni olish (Async/await ga o'tkazildi)
const getReadingAnswers = async (req, res) => {
  // Funksiyani async qildik
  const { userId, monthId } = req.query;

  if (!userId || !monthId) {
    return res.status(400).json({ message: 'Insufficient parameters.' });
  }

  try {
    // ✅ Model funksiyasini await bilan chaqiramiz (callback o'rniga)
    // Model Promise orqali natijalar massivini qaytaradi
    const results = await getReadingAnswersByUserAndMonth({ userId, monthId }); 

    return res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching data (Postgres):', err.message);
    // Xatolikni qaytarish
    return res.status(500).json({ message: 'Error fetching data', error: err.message });
  }
};

module.exports = {
  submitReadingAnswers,
  getReadingAnswers,
};