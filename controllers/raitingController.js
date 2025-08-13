const db = require('../config/db');

const getParticipatedMonths = (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT DISTINCT m.id, m.month
    FROM raitings r
    JOIN mock_months m ON r.month_id = m.id
    WHERE r.user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({
        msg: "Error getting users months",
        error: err.message
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        msg: "ℹThis user has not participated in any exams."
      });
    }

    res.status(200).json(results);
  });
};

module.exports = { getParticipatedMonths };
