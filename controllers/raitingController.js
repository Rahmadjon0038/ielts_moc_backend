const db = require('../config/db'); // pg pool ni import qilish

// ✅ Async/await uslubiga o'tkazildi
const getParticipatedMonths = async (req, res) => {
  const { userId } = req.params;

  // ✅ $1 parametr ishlatildi va Postgres SQL sintaksisiga o'tkazildi
  const query = `
    SELECT DISTINCT m.id, m.month
    FROM raitings r
    JOIN mock_months m ON r.month_id = m.id
    WHERE r.user_id = $1
  `;

  try {
    // db.query endi Promise qaytaradi, uni await bilan kutib olamiz
    const result = await db.query(query, [userId]);
    
    // ✅ Natijalar result.rows da bo'ladi
    const results = result.rows; 

    if (results.length === 0) {
      return res.status(404).json({
        msg: "ℹThis user has not participated in any exams."
      });
    }

    res.status(200).json(results);
    
  } catch (err) {
    // Xatolikni ushlash va qaytarish
    console.error("Error getting users months (Postgres):", err.message);
    return res.status(500).json({
      msg: "Error getting users months",
      error: err.message
    });
  }
};

module.exports = { getParticipatedMonths };