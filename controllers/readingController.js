const readingModel = require('../models/readingsModels');

const getReadingQuestions = (req, res) => {
  const { monthId } = req.params;

  readingModel.getReadingByMonthId(monthId, (err, parts) => {
    if (err) {
      console.error("❌ Ma'lumotlarni olishda xatolik:", err);
      return res.status(500).json({ message: "Server xatoligi" });
    }

    if (!parts || parts.length === 0) {
      return res.status(404).json({ message: `${monthId} oyi uchun hech qanday part topilmadi.` });
    }

    res.status(200).json({
      monthId,
      parts
    });
  });
};




// POST /api/reading/add
const addReadingPart = (req, res) => {
  const { monthId, part, intro, passage, questions } = req.body;

  if (!monthId || !part || !intro || !passage || !questions) {
    return res.status(400).json({ message: "Barcha maydonlar to‘ldirilishi kerak" });
  }

  // 1. Partni qo‘shamiz
  readingModel.createPart({ monthId, part, intro, passage }, (err, partId) => {
    if (err) {
      console.error("❌ Part qo‘shishda xatolik:", err);
      return res.status(500).json({ message: "Partni qo‘shib bo‘lmadi" });
    }

    // 2. Savollarni ketma-ket bazaga yozamiz
    let errors = [];
    let completed = 0;

    if (questions.length === 0) {
      return res.status(200).json({ message: "Part qo‘shildi, ammo savollar yo‘q", partId });
    }

    questions.forEach((q) => {
      readingModel.createQuestion({
        partId,
        questionText: q.text,
        type: q.type,
        options: q.options || []
      }, (err) => {
        completed++;
        if (err) errors.push(err);

        if (completed === questions.length) {
          if (errors.length > 0) {
            return res.status(500).json({ message: "Ba'zi savollarni qo‘shib bo‘lmadi", errors });
          } else {
            return res.status(200).json({ message: "Part va barcha savollar muvaffaqiyatli qo‘shildi", partId });
          }
        }
      });
    });
  });
};

module.exports = {
  getReadingQuestions,
  addReadingPart
};