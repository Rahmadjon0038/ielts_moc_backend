const { upsertWritingTask, getWritingTask, saveUserWritingAnswer, getWritingAnswersByMonthAndUser } = require('../models/writingModel');

// Writing qo‘shish
const setWriting = (req, res) => {
  const mock_id = req.params.mock_id;
  const { task1, task2 } = req.body;

  if (!task1 || !task2) {
    return res.status(400).json({ msg: "Please complete both writing tasks." });
  }

  upsertWritingTask(mock_id, task1, task2, (err, id) => {
    if (err) {
      return res.status(500).json({ msg: "Error adding writing", error: err.message });
    }
    res.status(201).json({ msg: "Writing added", id });
  });
};

// Writinglarni olish
const getWriting = (req, res) => {
  const mock_id = req.params.mock_id;

  getWritingTask(mock_id, (err, rows) => {
    if (err) {
      return res.status(500).json({ msg: "Error retrieving data", error: err.message });
    }
    res.status(200).json(rows);
  });
};


// ---------------------------------- user natijasini yuborishi uchun api ------------------------
// POST /api/writing/submit
const userPostWritingAnswer = (req, res) => {
  const { userId, monthId, section, answer } = req.body;

  // null yoki undefined tekshiruv
  if (
    userId == null ||
    monthId == null ||
    !section ||
    !answer?.task1 ||
    !answer?.task2
  ) {
    return res.status(400).json({ msg: 'Barcha maydonlar to‘ldirilishi shart!' });
  }

  saveUserWritingAnswer(userId, monthId, section, answer, (err) => {
    if (err) {
      console.error('❌ Javobni saqlashda xatolik:', err.message);
      return res.status(500).json({ msg: 'Saqlashda xatolik' });
    }

    res.json({ msg: '✅ Javoblar adminga yuborildi!' });
  });
};

// GET /api/mock/writing/answers/:monthId/:userId
const getUserWritingAnswersByMonth = (req, res) => {
  const { monthId, userId } = req.params;

  if (!monthId || !userId) {
    return res.status(400).json({ msg: 'Month ID va User ID kerak' });
  }

  getWritingAnswersByMonthAndUser(monthId, userId, (err, answers) => {
    if (err) {
      console.error('❌ Writing javoblarini olishda xatolik:', err.message);
      return res.status(500).json({ msg: 'Server xatoligi' });
    }
    res.json(answers);
  });
};



module.exports = {
  setWriting,
  getWriting,
  userPostWritingAnswer,
  getUserWritingAnswersByMonth,
};
