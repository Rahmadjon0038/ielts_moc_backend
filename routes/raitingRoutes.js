const express = require('express');
const router = express.Router();
const { getParticipatedMonths } = require("../controllers/raitingController");

router.get('/participated-months/:userId', getParticipatedMonths);

module.exports = router;
