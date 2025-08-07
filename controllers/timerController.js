const { insertStartTime, getStartTime } = require("../models/timerModel");

const startSection = async (req, res) => {
  const { userId, section, monthId } = req.body;

  if (!userId || !section || !monthId) {
    return res.status(400).json({ error: 'userId, section va monthId talab qilinadi' });
  }

  const finalMonthId = `2025-${String(monthId).padStart(2, '0')}`; // Masalan: 8 => 2025-08

  try {
    await insertStartTime(userId, section, finalMonthId);
    return res.status(200).json({ message: '✅ Vaqt boshlandi yoki oldin boshlangan' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: '❌ Vaqtni boshlashda xatolik' });
  }
};

const fetchStartTime = async (req, res) => {
  const { userId, section, monthId } = req.params;
  if (!userId || !section || !monthId) {
    return res.status(400).json({ error: 'userId, section va monthId talab qilinadi' });
  }

  const finalMonthId = `2025-${String(monthId).padStart(2, '0')}`;

  try {
    const [rows] = await getStartTime(userId, section, finalMonthId);
    if (rows.length === 0) {
      return res.status(404).json({ error: '❌ Vaqt topilmadi' });
    }

    return res.status(200).json({ startTime: rows[0].start_time });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: '❌ Maʼlumot olishda xatolik' });
  }
};

module.exports = {
  startSection,
  fetchStartTime,
};
