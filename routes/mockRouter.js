const express = require('express');
const router = express.Router();
const { postMockMonth, getMockMonths, removeMockMonth, getOneMockMonth } = require('../controllers/mockController');

router.delete('/delete/:id', removeMockMonth);  // bitta oyni ochirish
router.get('/get/:id', getOneMockMonth);  // Barcha oyni olish
router.post('/add', postMockMonth); // Oy qo‘shish
router.get('/get', getMockMonths);  // Barcha oylarni olish

module.exports = router;
