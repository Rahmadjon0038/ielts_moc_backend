const express = require('express');
const router = express.Router();
const { postMockMonth, getMockMonths, removeMockMonth, getOneMockMonth, setActivemonth, getActivemonth } = require('../controllers/mockController');

router.delete('/delete/:id', removeMockMonth);  // bitta oyni ochirish
router.get('/get/:id', getOneMockMonth);  // bitta oyni olish
router.post('/add', postMockMonth); // Oy qo‘shish
router.get('/get', getMockMonths);  // Barcha oylarni olish


router.post('/setactivemonth',setActivemonth)
router.get('/getactivemonth',getActivemonth)
module.exports = router;
