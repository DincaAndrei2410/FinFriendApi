const express = require('express')
const router = express.Router()

router.get('/', function (req, res) {
    res.sendFile('investment.html', { root: '.' });
});

module.exports = router;