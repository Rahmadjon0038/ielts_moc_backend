// controllers/listeningTaskController.js
const tasksModel = require('../models/listeningTaskModel');

// POST - Yangi task qo‘shish
const addTask = (req, res) => {
  const { monthId, sections } = req.body;

  tasksModel.saveReadingData(monthId, sections, (err) => {
    if (err) {
      console.error('Error adding task:', err);
      return res.status(500).json({ error: 'Task qo‘shishda xatolik yuz berdi' });
    }
    res.status(201).json({ message: 'Task muvaffaqiyatli qo‘shildi' });
  });
};

// GET - Month ID bo‘yicha tasklarni olish
const getTasksByMonth = (req, res) => {
  const { month_id } = req.params;
  const monthId = parseInt(month_id, 10);

  if (isNaN(monthId)) {
    return res.status(400).json({ error: 'Noto‘g‘ri monthId format' });
  }

  tasksModel.getReadingDataByMonth(monthId, (err, data) => {
    if (err) {
      console.error('Error getting tasks:', err);
      return res.status(500).json({
        error: 'Tasklarni olishda xatolik yuz berdi',
        details: err.message,
      });
    }

    if (!data || !data.sections || data.sections.length === 0) {
      return res.status(404).json({ message: 'Ushbu oy uchun tasklar topilmadi' });
    }

    res.status(200).json(data);
  });
};

module.exports = {
  addTask,
  getTasksByMonth,
};
