const {
  upsertWritingTask,
  getWritingTask,
  saveUserWritingAnswer,
  getWritingAnswersByMonthAndUser,
  upsertUserRaiting,
  getUserRaitingmodel,
  getMonthStatistics
} = require('../models/writingModel');

const db = require('../config/db')

// Admin - Writing qo‘shish
const setWriting = (req, res) => {
  const { mock_id } = req.params;
  const { task1, task2 } = req.body;

  const task1Image = req?.files?.task1Image?.[0]?.filename || null;
  const task2Image = req?.files?.task2Image?.[0]?.filename || null;

  if (!task1 || !task2) {
    return res.status(400).json({ msg: "Both writing assignments must be completed.." });
  }

  upsertWritingTask(mock_id, task1, task2, task1Image, task2Image, (err) => {
    if (err) {
      return res.status(500).json({
        msg: "Error adding writing",
        error: err.message
      });
    }
    res.status(201).json({ msg: "Writing successfully added" });
  });
};

// Writingni olish
const getWriting = (req, res) => {
  const { mock_id } = req.params;

  getWritingTask(mock_id, (err, data) => {
    if (err) {
      return res.status(500).json({
        msg: "Error fetching data",
        error: err.message
      });
    }
    res.status(200).json(data || {});
  });
};

// Foydalanuvchidan javobni qabul qilish
const userPostWritingAnswer = (req, res) => {
  const { userId, monthId, section, answer } = req.body;

  if (
    !userId ||
    !monthId ||
    !section ||
    !answer?.task1 ||
    !answer?.task2
  ) {
    return res.status(400).json({ msg: 'All fields must be filled.' });
  }

  saveUserWritingAnswer(userId, monthId, section, answer, (err) => {
    if (err) {
      return res.status(500).json({
        msg: 'Error saving answer',
        error: err.message
      });
    }
    res.json({ msg: 'Answers successfully saved' });
  });
};

//  Foydalanuvchi javoblarini olish (oy bo‘yicha)
const getUserWritingAnswersByMonth = (req, res) => {
  const { monthId, userId } = req.params;

  if (!monthId || !userId) {
    return res.status(400).json({ msg: 'monthId and userId are required' });
  }

  getWritingAnswersByMonthAndUser(monthId, userId, (err, answers) => {
    if (err) {
      return res.status(500).json({
        msg: 'Error fetching answers',
        error: err.message
      });
    }
    res.json(answers || []);
  });
};

// ---------------- user raiting --------------------

// Foydalanuvchini baholash (admin tomonidan)
const setUserRaiting = (req, res) => {
  const { montId, userid } = req.params;
  const { section, score, comment } = req.body;


  if (!section || score === undefined || score === null) {
    return res.status(400).json({ msg: "The score and section must be filled out." });
  }

  upsertUserRaiting(userid, montId, section, score, comment || '', (err) => {
    if (err) {
      return res.status(500).json({
        msg: "Error saving rating",
        error: err.message
      });
    }

    res.status(201).json({ msg: "User successfully rated" });
  });
};

// Foydalanuvchi bahosini olish (oy + bo‘lim bo‘yicha)
const getUserRaiting = (req, res) => {
  const { montId, userid } = req.params;
  const { section } = req.query;

  if (!section) {
    return res.status(400).json({ msg: "It is not specified for which section it should be taken." });
  }

  getUserRaitingmodel(userid, montId, section, (err, result) => {
    if (err) {
      return res.status(500).json({
        msg: "Error fetching rating",
        error: err.message
      });
    }

    if (!result) {
      return res.status(404).json({ msg: "ℹ Rating not found." });
    }

    res.status(200).json(result);
  });
};



// 4ta bo‘limni birgalikda olib beradigan controller
const getAllRaitingsByMonth = (req, res) => {
  const { montId, userid } = req.params;
  const sections = ['Reading', 'Listening', 'Writing', 'Speaking'];

  const query = `
    SELECT section, score, comment FROM raitings
    WHERE user_id = ? AND month_id = ?
  `;

  db.query(query, [userid, montId], (err, results) => {
    if (err) {
      return res.status(500).json({ msg: "Error fetching ratings", error: err.message });
    }

    // Bo‘sh bo‘lsa ham barcha bo‘limlar qaytishi kerak
    const response = sections.map((sectionName) => {
      const found = results.find((r) => r.section.toLowerCase() === sectionName.toLowerCase());
      return {
        section: sectionName,
        score: found ? found.score : null,
        comment: found ? found.comment : null,
      };
    });

    res.status(200).json(response);
  });
};



const getMonthStatsController = (req, res) => {
  const monthId = req.params.montId

  if (!monthId) {
    return res.status(400).json({ message: 'Month ID required!' });
  }

  getMonthStatistics(monthId, (err, results) => {
    if (err) {
      console.error('Error fetching statistics:', err.message);
      return res.status(500).json({ message: 'Server error occurred' });
    }

    res.json(results);
  });
};



module.exports = {
  setWriting,
  getWriting,
  userPostWritingAnswer,
  getUserWritingAnswersByMonth,

  setUserRaiting,
  getUserRaiting,
  getAllRaitingsByMonth,

  getMonthStatsController

};
