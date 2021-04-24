const express = require('express')
const router = express.Router()

router.get('/', function (req, res) {
    res.sendFile('budget.html', { root: '.' });
});

module.exports = router;