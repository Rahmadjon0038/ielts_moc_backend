const express = require('express')
const router = express.Router()
const { getUserAnswerMontList } = require("../controllers/userAnswerListController");

router.get('/:monthId/users', getUserAnswerMontList)

module.exports = router;
