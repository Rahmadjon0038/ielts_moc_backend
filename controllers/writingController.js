const {
  upsertWritingTask,
  getWritingTask,
  saveUserWritingAnswer,
  getWritingAnswersByMonthAndUser,
  upsertUserRaiting,
  getUserRaitingmodel,
  getMonthStatistics
} = require('../models/writingModel');

const db = require('../config/db'); // pg pool ni import qilish

// ======================= WRITING TASKS (ADMIN) =======================

// Admin - Writing qo‘shish (Async/await ga o'tkazildi)
const setWriting = async (req, res) => {
  const { mock_id } = req.params;
  const { task1, task2 } = req.body;

  // req.files ni tekshirish biroz o'zgardi, chunki u middleware (masalan, multer) natijasi
  const task1Image = req?.files?.task1Image?.[0]?.filename || null;
  const task2Image = req?.files?.task2Image?.[0]?.filename || null;

  if (!task1 || !task2) {
    return res.status(400).json({ msg: "Both writing assignments must be completed." });
  }

  try {
    // Model funksiyasi endi Promise qaytaradi
    await upsertWritingTask(mock_id, task1, task2, task1Image, task2Image);
    res.status(201).json({ msg: "Writing successfully added (Postgres)" });
  } catch (err) {
    console.error("Error setting writing:", err.message);
    return res.status(500).json({
      msg: "Error adding writing",
      error: err.message
    });
  }
};

// Writingni olish (Async/await ga o'tkazildi)
const getWriting = async (req, res) => {
  const { mock_id } = req.params;

  try {
    // Model funksiyasi Promise qaytaradi. Natija to'g'ridan-to'g'ri data obyektidir
    const data = await getWritingTask(mock_id); 
    res.status(200).json(data || {});
  } catch (err) {
    console.error("Error fetching writing:", err.message);
    return res.status(500).json({
      msg: "Error fetching data",
      error: err.message
    });
  }
};

// ======================= WRITING ANSWERS (USER) =======================

// Foydalanuvchidan javobni qabul qilish (Async/await ga o'tkazildi)
const userPostWritingAnswer = async (req, res) => {
  // ⚠️ Eslatma: userId ni req.user.id dan olish xavfsizroq.
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

  try {
    // Model funksiyasi Promise qaytaradi
    await saveUserWritingAnswer(userId, monthId, section, answer);
    res.json({ msg: 'Answers successfully saved (Postgres)' });
  } catch (err) {
    console.error("Error posting answer:", err.message);
    return res.status(500).json({
      msg: 'Error saving answer',
      error: err.message
    });
  }
};

//  Foydalanuvchi javoblarini olish (oy bo‘yicha) (Async/await ga o'tkazildi)
const getUserWritingAnswersByMonth = async (req, res) => {
  const { monthId, userId } = req.params;

  if (!monthId || !userId) {
    return res.status(400).json({ msg: 'monthId and userId are required' });
  }

  try {
    // Model funksiyasi Promise orqali javoblar massivini qaytaradi
    const answers = await getWritingAnswersByMonthAndUser(monthId, userId);
    res.json(answers || []);
  } catch (err) {
    console.error("Error fetching answers:", err.message);
    return res.status(500).json({
      msg: 'Error fetching answers',
      error: err.message
    });
  }
};

// ======================= RAITINGS =======================

// Foydalanuvchini baholash (admin tomonidan) (Async/await ga o'tkazildi)
const setUserRaiting = async (req, res) => {
  const { montId, userid } = req.params;
  const { section, score, comment } = req.body;


  if (!section || score === undefined || score === null) {
    return res.status(400).json({ msg: "The score and section must be filled out." });
  }

  try {
    // Model funksiyasi (upsert) Promise qaytaradi
    await upsertUserRaiting(userid, montId, section, score, comment || '');

    res.status(201).json({ msg: "User successfully rated (Postgres)" });
  } catch (err) {
    console.error("Error setting rating:", err.message);
    return res.status(500).json({
      msg: "Error saving rating",
      error: err.message
    });
  }
};

// Foydalanuvchi bahosini olish (oy + bo‘lim bo‘yicha) (Async/await ga o'tkazildi)
const getUserRaiting = async (req, res) => {
  const { montId, userid } = req.params;
  const { section } = req.query;

  if (!section) {
    return res.status(400).json({ msg: "It is not specified for which section it should be taken." });
  }

  try {
    // Model funksiyasi Promise orqali yagona natija obyektini qaytaradi
    const result = await getUserRaitingmodel(userid, montId, section);

    if (!result) {
      return res.status(404).json({ msg: "ℹ Rating not found." });
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching rating:", err.message);
    return res.status(500).json({
      msg: "Error fetching rating",
      error: err.message
    });
  }
};


// 4ta bo‘limni birgalikda olib beradigan controller (Promise/Postgresga o'tkazildi)
const getAllRaitingsByMonth = async (req, res) => {
  const { montId, userid } = req.params;
  const sections = ['Reading', 'Listening', 'Writing', 'Speaking'];

  // DB.query'ni to'g'ridan-to'g'ri controllerda chaqirish
  const query = `
    SELECT section, score, comment FROM raitings
    WHERE user_id = $1 AND month_id = $2
  `;

  try {
    const result = await db.query(query, [userid, montId]); // ✅ Promise/Postgres
    const results = result.rows; // ✅ Natijalarni result.rows dan olish

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

  } catch (err) {
    console.error("Error fetching ratings:", err.message);
    return res.status(500).json({ msg: "Error fetching ratings", error: err.message });
  }
};


// ======================= STATISTICS =======================

const getMonthStatsController = async (req, res) => {
  const monthId = req.params.montId;

  if (!monthId) {
    return res.status(400).json({ message: 'Month ID required!' });
  }

  try {
    // Model funksiyasi Promise orqali natijalar massivini qaytaradi
    const results = await getMonthStatistics(monthId);

    res.json(results);
  } catch (err) {
    console.error('Error fetching statistics (Postgres):', err.message);
    return res.status(500).json({ message: 'Server error occurred', details: err.message });
  }
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