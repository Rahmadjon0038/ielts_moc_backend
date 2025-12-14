const { saveListeningTest, getListeningTestByMonth } = require("../models/listeningTaskModel");

// Create or update listening test (Async/await ga o'tkazildi)
const createOrUpdateListeningTest = async (req, res) => {
  const testData = req.body;
  const monthId = parseInt(testData.monthId);

  if (!monthId || !testData.sections) {
    return res.status(400).json({ 
      message: "monthId and sections are required", 
      success: false 
    });
  }

  try {
    // Model funksiyasi endi Promise qaytaradi
    await saveListeningTest(monthId, testData);

    res.status(201).json({ 
      message: "Listening test saved successfully (Postgres)", 
      monthId: monthId,
      success: true
    });
  } catch (err) {
    console.error("Error while saving listening test (Postgres):", err.message);
    return res.status(500).json({ 
      message: "Error while saving listening test", 
      error: err.message,
      success: false 
    });
  }
};

// Get listening test by month ID (Async/await ga o'tkazildi)
const getListeningTest = async (req, res) => {
  const monthId = parseInt(req.params.monthId || req.query.monthId);
  
  if (!monthId) {
    return res.status(400).json({ 
      message: "monthId is required", 
      success: false 
    });
  }

  try {
    // Model funksiyasi Promise orqali yagona testData obyektini (yoki null) qaytaradi
    const testData = await getListeningTestByMonth(monthId);

    if (!testData) {
      return res.status(404).json({ 
        message: "Test not found", 
        success: false 
      });
    }

    res.status(200).json({ 
      success: true,
      data: testData
    });
  } catch (err) {
    console.error("Error while fetching listening test (Postgres):", err.message);
    return res.status(500).json({ 
      message: "Error while fetching listening test", 
      error: err.message,
      success: false 
    });
  }
};

module.exports = {
  createOrUpdateListeningTest,
  getListeningTest
};