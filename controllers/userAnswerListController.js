// controllers/adminController.js

const { getUsersByMonthId } = require("../models/userAnswers");

const getUserAnswerMontList = (req, res) => {
  const { monthId } = req.params;

  if (!monthId) return res.status(400).json({ msg: "Month ID kerak!" });

  getUsersByMonthId(monthId, (err, users) => {
    if (err) {
      console.error('❌ Foydalanuvchilarni olishda xatolik:', err.message);
      return res.status(500).json({ msg: "Server xatosi" });
    }

    res.json(users);
  });
};

module.exports = {
  getUserAnswerMontList
};
