const express = require('express')
const router = express.Router()

router.get('/', function (req, res) {
    res.sendFile('banking.html', { root: '.' });
});

module.exports = router;