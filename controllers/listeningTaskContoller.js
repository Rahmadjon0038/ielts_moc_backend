const { saveListeningTest, getListeningTestByMonth } = require("../models/listeningTaskModel");

// Create or update listening test
const createOrUpdateListeningTest = (req, res) => {
  const testData = req.body;
  const monthId = parseInt(testData.monthId);

  if (!monthId || !testData.sections) {
    return res.status(400).json({ 
      message: "monthId and sections are required", 
      success: false 
    });
  }

  saveListeningTest(monthId, testData, (err, result) => {
    if (err) {
      return res.status(500).json({ 
        message: "Error while saving listening test", 
        error: err.message,
        success: false 
      });
    }

    res.status(201).json({ 
      message: "Listening test saved successfully", 
      monthId: monthId,
      success: true
    });
  });
};

// Get listening test by month ID
const getListeningTest = (req, res) => {
  const monthId = parseInt(req.params.monthId || req.query.monthId);
  
  if (!monthId) {
    return res.status(400).json({ 
      message: "monthId is required", 
      success: false 
    });
  }

  getListeningTestByMonth(monthId, (err, testData) => {
    if (err) {
      return res.status(500).json({ 
        message: "Error while fetching listening test", 
        error: err.message,
        success: false 
      });
    }

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
  });
};

module.exports = {
  createOrUpdateListeningTest,
  getListeningTest
};
