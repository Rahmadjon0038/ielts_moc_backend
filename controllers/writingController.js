const {
  upsertWritingTask,
  getWritingTask,
  saveUserWritingAnswer,
  getWritingAnswersByMonthAndUser,
  upsertUserRaiting,
  getUserRaitingmodel
} = require('../models/writingModel');

const db = require('../config/db')

// Admin - Writing qo‘shish
const setWriting = (req, res) => {
  const { mock_id } = req.params;
  const { task1, task2 } = req.body;

  const task1Image = req?.files?.task1Image?.[0]?.filename || null;
  const task2Image = req?.files?.task2Image?.[0]?.filename || null;

  if (!task1 || !task2) {
    return res.status(400).json({ msg: " Ikkala writing topshirig‘i ham to‘ldirilishi kerak." });
  }

  upsertWritingTask(mock_id, task1, task2, task1Image, task2Image, (err) => {
    if (err) {
      return res.status(500).json({
        msg: "Writing qo‘shishda xatolik",
        error: err.message
      });
    }
    res.status(201).json({ msg: "Writing muvaffaqiyatli qo‘shildi" });
  });
};

// Writingni olish
const getWriting = (req, res) => {
  const { mock_id } = req.params;

  getWritingTask(mock_id, (err, data) => {
    if (err) {
      return res.status(500).json({
        msg: "Ma’lumotni olishda xatolik",
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
    return res.status(400).json({ msg: ' Barcha maydonlar to‘ldirilishi kerak.' });
  }

  saveUserWritingAnswer(userId, monthId, section, answer, (err) => {
    if (err) {
      return res.status(500).json({
        msg: ' Javobni saqlashda xatolik',
        error: err.message
      });
    }
    res.json({ msg: 'Javoblar muvaffaqiyatli saqlandi' });
  });
};

//  Foydalanuvchi javoblarini olish (oy bo‘yicha)
const getUserWritingAnswersByMonth = (req, res) => {
  const { monthId, userId } = req.params;

  if (!monthId || !userId) {
    return res.status(400).json({ msg: '❗ monthId va userId kerak' });
  }

  getWritingAnswersByMonthAndUser(monthId, userId, (err, answers) => {
    if (err) {
      return res.status(500).json({
        msg: '❌ Javoblarni olishda server xatoligi',
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

  if (!section || !score) {
    return res.status(400).json({ msg: "❗ Baho (score) va bo‘lim (section) to‘ldirilishi kerak." });
  }

  upsertUserRaiting(userid, montId, section, score, comment || '', (err) => {
    if (err) {
      return res.status(500).json({
        msg: "❌ Bahoni saqlashda xatolik yuz berdi",
        error: err.message
      });
    }

    res.status(201).json({ msg: "Foydalanuvchi muvaffaqiyatli baholandi" });
  });
};

// Foydalanuvchi bahosini olish (oy + bo‘lim bo‘yicha)
const getUserRaiting = (req, res) => {
  const { montId, userid } = req.params;
  const { section } = req.query;

  if (!section) {
    return res.status(400).json({ msg: "❗ Qaysi bo‘lim uchun olish kerakligi aniqlanmagan (section)." });
  }

  getUserRaitingmodel(userid, montId, section, (err, result) => {
    if (err) {
      return res.status(500).json({
        msg: " Bahoni olishda xatolik yuz berdi",
        error: err.message
      });
    }

    if (!result) {
      return res.status(404).json({ msg: "ℹ Hali baho qo‘yilmagan." });
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
      return res.status(500).json({ msg: "Baholarni olishda xatolik", error: err.message });
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


module.exports = {
  setWriting,
  getWriting,
  userPostWritingAnswer,
  getUserWritingAnswersByMonth,

  setUserRaiting,
  getUserRaiting,
  getAllRaitingsByMonth
};
