const db = require('../config/db');

const userMe = (req, res) => {
  const userId = req.user.id;

  const query = `SELECT id, username, email, role FROM users WHERE id = ?`;
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ msg: "Server error" });
    if (results.length === 0) return res.status(404).json({ msg: "user not found" });

    res.json({ user: results[0] });
  });
};

module.exports = { userMe };
