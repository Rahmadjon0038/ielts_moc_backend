const { saveListeningTest, getListeningTestByMonth } = require("../models/listeningTaskModel");

// Listening test yaratish yoki yangilash
const createOrUpdateListeningTest = (req, res) => {
  const testData = req.body;
  const monthId = parseInt(testData.monthId);

  if (!monthId || !testData.sections) {
    return res.status(400).json({ 
      message: "monthId va sections majburiy", 
      success: false 
    });
  }

  saveListeningTest(monthId, testData, (err, result) => {
    if (err) {
      return res.status(500).json({ 
        message: "Listening test saqlashda xatolik", 
        error: err.message,
        success: false 
      });
    }

    res.status(201).json({ 
      message: "Listening test muvaffaqiyatli saqlandi", 
      monthId: monthId,
      success: true
    });
  });
};

// Month ID bo'yicha listening test olish
const getListeningTest = (req, res) => {
  const monthId = parseInt(req.params.monthId || req.query.monthId);
  
  if (!monthId) {
    return res.status(400).json({ 
      message: "monthId kerak", 
      success: false 
    });
  }

  getListeningTestByMonth(monthId, (err, testData) => {
    if (err) {
      return res.status(500).json({ 
        message: "Listening test olishda xatolik", 
        error: err.message,
        success: false 
      });
    }

    if (!testData) {
      return res.status(404).json({ 
        message: "Test topilmadi", 
        success: false 
      });
    }

    res.status(200).json({ 
      success: true,
      data: testData
    });
  });
};

module.exports = {
  createOrUpdateListeningTest,
  getListeningTest
};