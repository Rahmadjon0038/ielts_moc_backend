const { createMockMonth, getAllMockMonths, deleteMockMonth, getMockMonthById, setActiveMockMonth, getActiveMockMonth } = require('../models/mockModel');

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
        if (err) return res.status(500).json({ error: 'Serverda xatolik' });
        if (!row) return res.status(404).json({ msg: 'Mock topilmadi' });
        res.json(row);
    });
};


const removeMockMonth = (req, res) => {
    const id = req.params.id;

    deleteMockMonth(id, (err, changes) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        if (changes === 0) {
            return res.status(404).json({ msg: 'month not found' });
        }
        res.json({ msg: 'Mock deleted' });
    });
};



const setActivemonth = (req, res) => {
    const { mockId } = req.body;

    if (!mockId) return res.status(400).json({ error: 'mockId is required' });

    setActiveMockMonth(mockId, (err) => {
        if (err) return res.status(500).json({ error: 'Failed to set active mock month' });
        res.status(200).json({ msg: 'Active mock month set successfully', mockId });
    });
};

const getActivemonth = (req, res) => {
    getActiveMockMonth((err, row) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch active mock month' });
        if (!row) return res.status(404).json({ msg: 'No active mock month set yet' });
        res.status(200).json(row);
    });
};

module.exports = { postMockMonth, getMockMonths, removeMockMonth, getOneMockMonth ,setActivemonth,getActivemonth};
