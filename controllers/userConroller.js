const db = require('../config/db');

const userMe = (req, res) => {
  const userId = req.user.id;

  const query = `SELECT id, username, email, role FROM users WHERE id = ?`;
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ msg: "Server xatolik" });
    if (results.length === 0) return res.status(404).json({ msg: "Foydalanuvchi topilmadi" });

    res.json({ user: results[0] });
  });
};

module.exports = { userMe };
