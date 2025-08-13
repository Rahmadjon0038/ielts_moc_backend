const { hasUserSubmitted, createSubmission } = require("../models/untiedModel");

// ➕ Foydalanuvchi bo‘limni yechganini saqlash
const setUntied = (req, res) => {
  const { userId, monthId, section } = req.body;

  if (!userId || !monthId || !section) {
    return res.status(400).json({ error: 'userId, monthId and section are required' });
  }

  // Avval tekshiramiz — bu user allaqachon yechganmi
  hasUserSubmitted({ userId, monthId, section }, (err, alreadySubmitted) => {
    if (err) return res.status(500).json({ error: 'Server error occurred' });

    if (alreadySubmitted) {
      return res.status(409).json({ message: 'You have already solved this section.' });
    }

    // Agar hali yechmagan bo‘lsa — saqlaymiz
    createSubmission({ userId, monthId, section }, (err, insertId) => {
      if (err) return res.status(500).json({ error: 'Error saving submission' });

      res.status(201).json({ message: 'Submission successfully saved', id: insertId });
    });
  });
};

// 🔍 Bu bo‘lim allaqachon yechilganmi — client frontend so‘raydi
const getUntied = (req, res) => {
  const { userId, monthId, section } = req.query;

  if (!userId || !monthId || !section) {
    return res.status(400).json({ error: 'userId, monthId and section are required' });
  }

  hasUserSubmitted({ userId, monthId, section }, (err, alreadySubmitted) => {
    if (err) return res.status(500).json({ error: 'Server error occurred' });

    if (alreadySubmitted) {
      res.json({ submitted: true, message: 'You have already solved this section.' });
    } else {
      res.json({ submitted: false });
    }
  });
};

module.exports = { setUntied, getUntied };
