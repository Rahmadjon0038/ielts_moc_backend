// controllers/adminController.js

// Model fayli nomi o'zgartirilmadi
const { getUsersByMonthId } = require("../models/userAnswers"); 

// ✅ Async/await uslubiga o'tkazildi
const getUserAnswerMontList = async (req, res) => {
  // req.params dan ma'lumotni olish
  const { monthId } = req.params; 

  if (!monthId) {
    return res.status(400).json({ msg: "Month ID required!" });
  }

  try {
    // Model funksiyasini Promise asosida chaqiramiz. 
    // Model endi callback o'rniga Promise orqali natijani qaytaradi.
    const users = await getUsersByMonthId(monthId); 
    
    // Natijani qaytarish
    res.json(users);

  } catch (err) {
    // Xatolarni ushlash va qaytarish
    console.error('Error fetching users (Postgres):', err.message);
    return res.status(500).json({ msg: "Server error occurred", details: err.message });
  }
};

module.exports = {
  getUserAnswerMontList
};