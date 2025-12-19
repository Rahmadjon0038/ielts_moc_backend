const { insertStartTime, getStartTime } = require("../models/timerModel");

const startSection = async (req, res) => {
  // ... (startSection kodi o'zgarishsiz qoldi)
  const { userId, section, monthId } = req.body;

  if (!userId || !section || !monthId) {
    return res
      .status(400)
      .json({ error: "userId, section va monthId talab qilinadi" });
  }

  const finalMonthId = `2025-${String(monthId).padStart(2, "0")}`;

  try {
    await insertStartTime(userId, section, finalMonthId);

    return res
      .status(200)
      .json({ message: "Timer started or was started before " });
  } catch (err) {
    console.error("Timer start xatosi:", err);
    return res
      .status(500)
      .json({ error: "Error starting timer", details: err.message });
  }
};

const fetchStartTime = async (req, res) => {
  const { userId, section, monthId } = req.params;
  if (!userId || !section || !monthId) {
    return res
      .status(400)
      .json({ error: "userId, section and monthId are required." });
  }

  const finalMonthId = `2025-${String(monthId).padStart(2, "0")}`;

  try {
    // ✅ TUZATISH: Model allaqachon result.rows[0] ni qaytaradi (ya'ni yagona qatorni yoki null)
    const timerRow = await getStartTime(userId, section, finalMonthId);

    // ✅ Faqat qaytgan natijani tekshirish kifoya
    if (!timerRow) {
      // 404: Ma'lumot topilmadi
      return res.status(404).json({ error: "Timer not found" });
    }

    // ✅ start_time endi to'g'ridan-to'g'ri timerRow ichida
    return res.status(200).json({ startTime: timerRow.start_time });
  } catch (err) {
    console.error("Timer olish xatosi:", err);
    // 500: Server xatosi (DB ulanishi yoki boshqa kutilmagan xato)
    return res
      .status(500)
      .json({ error: "Error fetching data", details: err.message });
  }
};

module.exports = {
  startSection,
  fetchStartTime,
};
