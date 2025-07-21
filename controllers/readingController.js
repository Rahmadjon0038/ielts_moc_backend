const readingModel = require('../models/readingsModels');

// 1. GET — Barcha part va savollarni olish
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

// 2. POST — Yangi part qo‘shish yoki mavjudini yangilash
const addReadingPart = (req, res) => {
  const { monthId, part, intro, passage, questions } = req.body;

  if (!monthId || !part || !intro || !passage || !questions) {
    return res.status(400).json({ message: "Barcha maydonlar to‘ldirilishi kerak" });
  }

  // 1. Tekshiramiz: shu part bor yoki yo‘qligini
  readingModel.findPartByMonthAndPart(monthId, part, (err, existingPart) => {
    if (err) {
      console.error("❌ Partni qidirishda xatolik:", err);
      return res.status(500).json({ message: "Partni qidirishda xatolik yuz berdi" });
    }

    if (existingPart) {
      // 🔄 Mavjud bo‘lsa: yangilaymiz
      const partId = existingPart.id;

      readingModel.updatePart({ partId, intro, passage }, (err) => {
        if (err) {
          console.error("❌ Partni yangilashda xatolik:", err);
          return res.status(500).json({ message: "Partni yangilab bo‘lmadi" });
        }

        // Savollarni tozalaymiz
        readingModel.deleteQuestionsByPartId(partId, (err) => {
          if (err) {
            console.error("❌ Savollarni o‘chirishda xatolik:", err);
            return res.status(500).json({ message: "Savollarni tozalab bo‘lmadi" });
          }

          // Yangi savollarni qo‘shamiz
          insertQuestions(partId, questions, res, "Part yangilandi va savollar yangitdan qo‘shildi");
        });
      });

    } else {
      // ➕ Yangi part yaratamiz
      readingModel.createPart({ monthId, part, intro, passage }, (err, partId) => {
        if (err) {
          console.error("❌ Yangi part qo‘shishda xatolik:", err);
          return res.status(500).json({ message: "Yangi partni yaratib bo‘lmadi" });
        }

        // Savollarni qo‘shamiz
        insertQuestions(partId, questions, res, "Yangi part va savollar muvaffaqiyatli qo‘shildi");
      });
    }
  });
};

// 3. Savollarni qo‘shish (yordamchi funksiya)
const insertQuestions = (partId, questions, res, successMessage) => {
  let count = 0;

  if (!questions.length) {
    return res.status(400).json({ message: "Hech qanday savollar berilmagan" });
  }

  questions.forEach((q) => {
    const questionData = {
      partId,
      questionText: q.text,
      type: q.type,
      options: q.options || [],
    };

    readingModel.createQuestion(questionData, (err) => {
      if (err) {
        console.error("❌ Savol qo‘shishda xatolik:", err);
        return res.status(500).json({ message: "Savollarni qo‘shib bo‘lmadi" });
      }

      count++;
      if (count === questions.length) {
        res.status(200).json({ message: successMessage });
      }
    });
  });
};

module.exports = {
  getReadingQuestions,
  addReadingPart
};
