const db = require("../config/db"); // pg pool ni import qilish

// ✅ Async/await uslubiga o'tkazildi
const userMe = async (req, res) => {
  // req.user.id ni olish (autentifikatsiya middleware orqali o'rnatilgan)
  const userId = req.user.id;

  // ✅ $1 parametr ishlatildi
  const query = `SELECT id, username, email, role FROM users WHERE id = $1`;

  try {
    // db.query endi Promise qaytaradi, uni await bilan kutib olamiz
    const result = await db.query(query, [userId]);

    // ✅ Natijalar result.rows da bo'ladi
    const results = result.rows;

    if (results.length === 0) {
      return res.status(404).json({ msg: "User not found " });
    }

    // ✅ results[0] o'rniga result.rows[0]
    res.json({ user: results[0] });
  } catch (err) {
    // Xatolikni ushlash
    console.error("PostgreSQL server xatosi:", err);
    res.status(500).json({ msg: "Server error ", error: err.message });
  }
};

module.exports = { userMe };
