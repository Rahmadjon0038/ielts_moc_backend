const {
  insertListeningAnswers,
  getListeningAnswersByUser
} = require('../models/listeningModel');

const db = require('../config/db');

const addListeningAnswer = (req, res) => {
  const { userId, monthId, answers } = req.body;

  if (!userId || !monthId || !answers || !Array.isArray(answers)) {
    return res.status(400).json({ message: 'Invalid data format' });
  }

  // 1. Eski javoblarni o‘chiramiz (agar bo‘lsa)
  const deleteQuery = `DELETE FROM listening_answers WHERE userId = ? AND monthId = ?`;
  db.query(deleteQuery, [userId, monthId], (deleteErr) => {
    if (deleteErr) {
      console.error('Error deleting previous replies:', deleteErr);
      return res.status(500).json({ message: 'Failed to delete old answers' });
    }

    // 2. Yangi javoblarni saqlaymiz
    const insertQuery = `
      INSERT INTO listening_answers (userId, monthId, questionNumber, questionText, type, userAnswers, options)
      VALUES ?
    `;

    const values = answers.map((ans) => [
      userId,
      monthId,
      ans.questionNumber,
      ans.questionText,
      ans.type,
      JSON.stringify(ans.userAnswers),
      JSON.stringify(ans.options || [])
    ]);

    db.query(insertQuery, [values], (insertErr, result) => {
      if (insertErr) {
        console.error('Error adding new replies:', insertErr);
        return res.status(500).json({ message: 'Failed to save answers' });
      }

      res.status(201).json({ message: 'Answers successfully updated', inserted: result.affectedRows });
    });
  });
};


const getListeningAnswer = (req, res) => {
  const { userId, monthId } = req.params;

  getListeningAnswersByUser(userId, monthId, (err, answers) => {
    if (err) {
      console.error("Error fetching answers:", err);
      return res.status(500).json({ message: 'Server error occurred' });
    }

    // userAnswer va options ni xavfsiz o'qish
    const parsedAnswers = answers.map(item => ({
      ...item,
      userAnswer: item.userAnswer ? JSON.parse(item.userAnswer) : [],
      options: item.options ? JSON.parse(item.options) : []
    }));

    res.json({ message: 'Answers fetched successfully', answers: parsedAnswers });
  });
};

module.exports = {
  addListeningAnswer,
  getListeningAnswer
};
