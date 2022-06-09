const express = require('express')
const router = express.Router()

const simbolsDictionary = {
    "AAPL": 'apple',
    "AMZN": 'amazon',
    "GOOGL": 'google',
    "TSLA": 'tesla',
    "FB": 'facebook',
    "NFLX": 'netflix',
    "MSFT": 'microsoft',
    "NVDA": 'nvidia',
    "V": 'visa',
    "MA": 'mastercard'
};


router.get('/analysis/:symbol', (req, res) => {
    const stringForSearch = simbolsDictionary[req.params.symbol];
    console.log("stringForSearch", stringForSearch);
    var dataToSend;

    const { spawn } = require("child_process");

    var python = spawn('python', [`${process.cwd()}\\controllers\\sentiment-analysis.py`, stringForSearch]);
    // var python = spawn('python3', [`${process.cwd()}/controllers/sentiment-analysis.py`, stringForSearch]);

    python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...');
        dataToSend = data.toString();
    });
    python.stderr.on('data', function (data) {
        console.log('ps stderr: ' + data);
        res.send(500);
    });

    python.on('close', (code) => {
        const newArr = dataToSend.split(',');
        const positivePercentage = newArr[0].substr(1, newArr[0].length - 1);
        const negativePercentage = newArr[1].substr(1, newArr[1].length - 1);
        const neutralPercentage = newArr[2].substr(1, newArr[2].length - 4);
        const objToSend = { positive: +positivePercentage, negative: +negativePercentage, neutral: +neutralPercentage };
        res.status(200).send(objToSend);
    });
});


module.exports = router;