const { hasUserSubmitted, createSubmission } = require("../models/untiedModel");

// ➕ Foydalanuvchi bo‘limni yechganini saqlash
const setUntied = (req, res) => {
  const { userId, monthId, section } = req.body;

  if (!userId || !monthId || !section) {
    return res.status(400).json({ error: 'userId, monthId va section majburiy' });
  }

  // Avval tekshiramiz — bu user allaqachon yechganmi
  hasUserSubmitted({ userId, monthId, section }, (err, alreadySubmitted) => {
    if (err) return res.status(500).json({ error: 'Server xatosi' });

    if (alreadySubmitted) {
      return res.status(409).json({ message: 'Siz bu bo‘limni allaqachon yechgansiz' });
    }

    // Agar hali yechmagan bo‘lsa — saqlaymiz
    createSubmission({ userId, monthId, section }, (err, insertId) => {
      if (err) return res.status(500).json({ error: 'Saqlashda xatolik' });

      res.status(201).json({ message: '✅ Yechilgan bo‘lim saqlandi', id: insertId });
    });
  });
};

// 🔍 Bu bo‘lim allaqachon yechilganmi — client frontend so‘raydi
const getUntied = (req, res) => {
  const { userId, monthId, section } = req.query;

  if (!userId || !monthId || !section) {
    return res.status(400).json({ error: 'userId, monthId va section kerak' });
  }

  hasUserSubmitted({ userId, monthId, section }, (err, alreadySubmitted) => {
    if (err) return res.status(500).json({ error: 'Server xatosi' });

    if (alreadySubmitted) {
      res.json({ submitted: true, message: 'Siz bu bo‘limni allaqachon yechgansiz' });
    } else {
      res.json({ submitted: false });
    }
  });
};

module.exports = { setUntied, getUntied };
