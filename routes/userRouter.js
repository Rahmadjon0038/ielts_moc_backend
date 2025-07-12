const expres = require('express');
const { userMe } = require('../controllers/userConroller');
const verifyToken = require('../middleware/auth');
const router = expres.Router();

router.get('/me',verifyToken, userMe)

module.exports = router;