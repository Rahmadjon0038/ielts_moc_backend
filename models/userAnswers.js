const db = require('../config/db'); // pg pool ni import qilish

// Ushbu oyga javob bergan userlarni olish (To'liq Promise/async ga o'tkazildi)
const getUsersByMonthId = async (monthId) => {
  const query = `
    SELECT DISTINCT u.id, u.username
    FROM writing_answers wa -- writing_answers uchun 'wa' qisqartmasi
    JOIN users u ON wa.user_id = u.id -- users uchun 'u' qisqartmasi
    WHERE wa.month_id = $1 -- $1 ishlatildi
  `;
  
  try {
    const result = await db.query(query, [monthId]);
    // Natijalar massivini qaytaramiz
    return result.rows;
  } catch (err) {
    // Xatolikni yuqoriga uzatamiz
    throw err;
  }
};

module.exports = {
  getUsersByMonthId,
};