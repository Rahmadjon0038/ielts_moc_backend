const { hasUserSubmitted, createSubmission } = require("../models/untiedModel"); // Nom o'zgartirilmadi

// ➕ Foydalanuvchi bo‘limni yechganini saqlash (Async/Await ga o'tkazildi)
const setUntied = async (req, res) => {
  const { userId, monthId, section } = req.body;

  if (!userId || !monthId || !section) {
    return res.status(400).json({ error: 'userId, monthId and section are required' });
  }

  try {
    // Model funksiyalari endi Promise qaytaradi deb qabul qilinadi
    const alreadySubmitted = await hasUserSubmitted({ userId, monthId, section });

    if (alreadySubmitted) {
      // 409 Conflict: allaqachon mavjud resursni yaratishga urinish
      return res.status(409).json({ message: 'You have already solved this section.' });
    }

    // Model funksiyasi Promise orqali insertId ni qaytaradi
    const insertId = await createSubmission({ userId, monthId, section });

    res.status(201).json({ message: 'Submission successfully saved', id: insertId });

  } catch (err) {
    console.error("Set Untied xatosi (Postgres):", err);
    return res.status(500).json({ error: 'Server error occurred during submission', details: err.message });
  }
};

// 🔍 Bu bo‘lim allaqachon yechilganmi — client frontend so‘raydi (Async/Await ga o'tkazildi)
const getUntied = async (req, res) => {
  const { userId, monthId, section } = req.query;

  if (!userId || !monthId || !section) {
    return res.status(400).json({ error: 'userId, monthId and section are required' });
  }

  try {
    // Model funksiyasi Promise orqali boolean qiymatni qaytaradi
    const alreadySubmitted = await hasUserSubmitted({ userId, monthId, section });

    if (alreadySubmitted) {
      res.json({ submitted: true, message: 'You have already solved this section.' });
    } else {
      res.json({ submitted: false });
    }
  } catch (err) {
    console.error("Get Untied xatosi (Postgres):", err);
    return res.status(500).json({ error: 'Server error occurred during check', details: err.message });
  }
};

module.exports = { setUntied, getUntied };