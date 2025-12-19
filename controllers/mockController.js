const {
  createMockMonth,
  getAllMockMonths,
  deleteMockMonth,
  getMockMonthById,
  setActiveMockMonth,
  getActiveMockMonth,
} = require("../models/mockModel");

// ✅ postMockMonth (Async/await ga o'tkazildi)
const postMockMonth = async (req, res) => {
  const { month } = req.body;
  if (!month) return res.status(400).json({ error: "month is required" });

  try {
    // Model Promise orqali kiritilgan ID ni qaytaradi
    const id = await createMockMonth(month);
    res.status(201).json({ id, month });
  } catch (err) {
    console.error("Error adding mock month :", err.message);
    return res
      .status(500)
      .json({ error: "Error adding mock month", details: err.message });
  }
};

// ✅ getMockMonths (Async/await ga o'tkazildi)
const getMockMonths = async (req, res) => {
  try {
    // Model Promise orqali barcha qatorlarni qaytaradi
    const rows = await getAllMockMonths();
    res.json(rows);
  } catch (err) {
    console.error("Failed to fetch mock months :", err.message);
    return res
      .status(500)
      .json({ error: "Failed to fetch mock months", details: err.message });
  }
};

// ✅ getOneMockMonth (Async/await ga o'tkazildi)
const getOneMockMonth = async (req, res) => {
  const id = req.params.id;
  try {
    // Model Promise orqali yagona qator obyektini (yoki null) qaytaradi
    const row = await getMockMonthById(id);
    if (!row) return res.status(404).json({ msg: "Mock not found" });
    res.json(row);
  } catch (err) {
    console.error("Server error fetching mock month :", err.message);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

// ✅ removeMockMonth (Async/await ga o'tkazildi)
const removeMockMonth = async (req, res) => {
  const id = req.params.id;
  try {
    // Model Promise orqali o'chirilgan qatorlar sonini qaytaradi
    const changes = await deleteMockMonth(id);
    if (changes === 0) return res.status(404).json({ msg: "Month not found" });
    res.json({ msg: "Mock deleted" });
  } catch (err) {
    console.error("Server error deleting mock month :", err.message);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

// ✅ setActivemonth (Async/await ga o'tkazildi)
const setActivemonth = async (req, res) => {
  const { mockId } = req.body;
  const finalMockId =
    mockId === null || mockId === undefined ? null : Number(mockId);

  try {
    // Model funksiyasi Promise qaytaradi
    await setActiveMockMonth(finalMockId);

    if (finalMockId === null) {
      res.status(200).json({ msg: "Active mock month removed successfully" });
    } else {
      res
        .status(200)
        .json({
          msg: "Active mock month set successfully",
          mockId: finalMockId,
        });
    }
  } catch (err) {
    console.error("Failed to set active mock month :", err.message);
    return res
      .status(500)
      .json({ error: "Failed to set active mock month", details: err.message });
  }
};

// ✅ getActivemonth (Async/await ga o'tkazildi)
const getActivemonth = async (req, res) => {
  try {
    // Model Promise orqali faol qator obyektini (yoki null) qaytaradi
    const row = await getActiveMockMonth();
    if (!row)
      return res.status(404).json({ msg: "No active mock month set yet" });
    res.status(200).json(row);
  } catch (err) {
    console.error("Failed to fetch active mock month :", err.message);
    return res
      .status(500)
      .json({
        error: "Failed to fetch active mock month",
        details: err.message,
      });
  }
};

module.exports = {
  postMockMonth,
  getMockMonths,
  getOneMockMonth,
  removeMockMonth,
  setActivemonth,
  getActivemonth,
};
