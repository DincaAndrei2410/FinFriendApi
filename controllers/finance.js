const express = require('express')
const router = express.Router()
const yahooFinance = require('yahoo-finance');
var unirest = require("unirest");

const SYMBOLS = [
  'AAPL',
  'AMZN',
  'GOOGL',
  'TSLA',
  'FB',
  'NFLX'
];

router.get('/historical', (req, res) => {
  yahooFinance.historical({
    symbols: SYMBOLS,
    from: '2021-01-01',
    to: '2021-02-20',
    period: 'd'
  }).then(function (result) {
    res.status(200).send(result);
  }).catch((err) => {
    res.status(500).send(err)
  })
});

router.get('/historicalByCompany/:symbol', (req, res) => {
  const symbol = [req.params.symbol];
  yahooFinance.historical({
    symbols: symbol,
    from: '2021-01-01',
    to: '2021-02-20',
    period: 'd'
  }).then(function (result) {
    res.status(200).send(result);
  }).catch((err) => {
    res.status(500).send(err)
  })
});

router.get('/summarybyCompany/:symbol', (req, res) => {
  const symbol = req.params.symbol;
  yahooFinance.quote({
    symbol: symbol,
    modules: ['price', 'summaryDetail', 'financialData']
  }).then(function (result) {
    res.status(200).send(result);
  }).catch((err) => {
    res.status(500).send(err)
  })
});

router.get('/chart/:symbol', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  const symbol = req.params.symbol;
  var req = unirest("GET", "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-chart");
  req.query({
    "interval": "5m",
    "symbol": symbol,
    "range": "5d",
  });
  req.headers({
    "x-rapidapi-key": "e499b14d1amshcf40a6f5bde46dep1721f4jsn0a021671d1dd",
    "x-rapidapi-host": "apidojo-yahoo-finance-v1.p.rapidapi.com",
    "useQueryString": true
  });

  req.end(function (resp) {
    if (resp.error) throw new Error(resp.error);
    res.send(resp.body);
  });
});


module.exports = router;