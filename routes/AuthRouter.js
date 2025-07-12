const expres = require('express');
const { Login, Register } = require('../controllers/AuthControrller');
const router = expres.Router();

router.post('/login', Login)
router.post('/register', Register)

module.exports = router;