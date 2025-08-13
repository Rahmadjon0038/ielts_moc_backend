const {
  createMockMonth,
  getAllMockMonths,
  deleteMockMonth,
  getMockMonthById,
  setActiveMockMonth,
  getActiveMockMonth,
} = require('../models/mockModel');

const postMockMonth = (req, res) => {
  const { month } = req.body;
  if (!month) return res.status(400).json({ error: 'month is required' });

  createMockMonth(month, (err, id) => {
    if (err) return res.status(500).json({ error: 'Error adding mock month' });
    res.status(201).json({ id, month });
  });
};

const getMockMonths = (req, res) => {
  getAllMockMonths((err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch mock months' });
    res.json(rows);
  });
};

const getOneMockMonth = (req, res) => {
  const id = req.params.id;
  getMockMonthById(id, (err, row) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    if (!row) return res.status(404).json({ msg: 'Mock not found' });
    res.json(row);
  });
};

const removeMockMonth = (req, res) => {
  const id = req.params.id;
  deleteMockMonth(id, (err, changes) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    if (changes === 0) return res.status(404).json({ msg: 'Month not found' });
    res.json({ msg: 'Mock deleted' });
  });
};

const setActivemonth = (req, res) => {
  const { mockId } = req.body;

  // null bo‘lsa, o‘chiramiz
  if (mockId === null || mockId === undefined) {
    setActiveMockMonth(null, (err) => {
      if (err) return res.status(500).json({ error: 'Failed to unset active mock month' });
      res.status(200).json({ msg: 'Active mock month removed successfully' });
    });
  } else {
    // aks holda active mockni o‘rnatamiz
    setActiveMockMonth(Number(mockId), (err) => {
      if (err) return res.status(500).json({ error: 'Failed to set active mock month' });
      res.status(200).json({ msg: 'Active mock month set successfully', mockId });
    });
  }
};

// ✅ TUZATILGAN: active mock yo‘q bo‘lsa, 404 qaytaradi
const getActivemonth = (req, res) => {
  getActiveMockMonth((err, row) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch active mock month' });
    if (!row) return res.status(404).json({ msg: 'No active mock month set yet' });
    res.status(200).json(row);
  });
};
module.exports = {
  postMockMonth,
  getMockMonths,
  getOneMockMonth,
  removeMockMonth,
  setActivemonth,
  getActivemonth,
};
