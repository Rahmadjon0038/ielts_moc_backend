const { saveReadingAnswers, getReadingAnswersByUserAndMonth } = require("../models/readingAnsWerModel");

//  Javoblarni qabul qilish va saqlash
const submitReadingAnswers = async (req, res) => {
  const { userId, monthId, questions } = req.body;
  console.log("saveReadingAnswers:", saveReadingAnswers);

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

  saveReadingAnswers(formattedAnswers, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error saving answers', error: err });
    }

    return res.status(201).json({ message: 'Answers successfully saved.' });
  });
};

//  Admin uchun — user va oy bo‘yicha javoblarni olish
const getReadingAnswers = (req, res) => {
  const { userId, monthId } = req.query;

  if (!userId || !monthId) {
    return res.status(400).json({ message: 'Insufficient parameters.' });
  }

  getReadingAnswersByUserAndMonth({ userId, monthId }, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching data', error: err });
    }

    return res.status(200).json(results);
  });
};

module.exports = {
  submitReadingAnswers,
  getReadingAnswers,
};
