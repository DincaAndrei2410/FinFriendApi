const express = require('express')
const router = express.Router()
const yahooFinance = require('yahoo-finance');
var unirest = require("unirest");
var moment = require('moment');

const SYMBOLS = [
  'AAPL',
  'AMZN',
  'GOOGL',
  'TSLA',
  'FB',
  'NFLX'
];

router.get('/historical', (req, res) => {
  let currentDate = moment(moment().format('YYYY-MM-DD'), 'YYYY-MM-DD');
  let startDate = currentDate.clone();
  startDate.subtract(1, 'years');
  const d1 = startDate.format('YYYY-MM-DD');
  const d2 = currentDate.format('YYYY-MM-DD');
  yahooFinance.historical({
    symbols: SYMBOLS,
    from: d1,
    to: d2,
    period: 'd'
  }).then(function (result) {
    let responseObj = {};
    for (var key in result) {
      let arr = result[key].reverse();
      for (let i = 1; i < arr.length; i++) {
        arr[i].dailyPercentageChange = arr[i].close / arr[i - 1].close - 1;
        if (i === 1) {
          arr[i].cumulativeReturn = arr[i].close / arr[i - 1].close - 1;
        }
        else {
          arr[i].cumulativeReturn = (arr[i].close / arr[i - 1].close - 1) * (arr[i - 1].close / arr[i - 2].close - 1);
        }
      }
      responseObj[key] = arr;
    }
    res.status(200).send(responseObj);
  }).catch((err) => {
    res.status(500).send(err)
  })
});

router.get('/historicalByCompany/:symbol', (req, res) => {
  let currentDate = moment(moment().format('YYYY-MM-DD'), 'YYYY-MM-DD');
  let startDate = currentDate.clone();
  startDate.subtract(1, 'years');
  const d1 = startDate.format('YYYY-MM-DD');
  const d2 = currentDate.format('YYYY-MM-DD');
  const symbol = [req.params.symbol];
  yahooFinance.historical({
    symbols: symbol,
    from: d1,
    to: d2,
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
    modules: ['price', 'summaryDetail', 'financialData', 'defaultKeyStatistics', 'earnings']
  }).then(function (result) {
    result.summaryDetail.PER = result.summaryDetail.marketCap / result.earnings.financialsChart.yearly[result.earnings.financialsChart.yearly.length - 1].earnings;
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