const expres = require('express');
const verifyToken = require('../middleware/auth');
const { setUntied, getUntied } = require('../controllers/untiedController');
const router = expres.Router();
router.post('/set',setUntied)
router.get('/get',getUntied)

module.exports = router;