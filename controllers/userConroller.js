const db = require('../config/db');

const userMe = (req, res) => {
  const userId = req.user.id; // token orqali middleware dan keldi

  const query = `SELECT id, username, email, role FROM users WHERE id = ?`;
  db.get(query, [userId], (err, user) => {
    if (err) return res.status(500).json({ msg: "Server xatolik" });
    if (!user) return res.status(404).json({ msg: "Foydalanuvchi topilmadi" });

    res.json({ user });
  });
};

module.exports = { userMe };
