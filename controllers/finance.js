const express = require('express')
const router = express.Router()
const yahooFinance = require('yahoo-finance');

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
      modules: [ 'price', 'summaryDetail', 'financialData' ] 
    }).then(function (result) {
      res.status(200).send(result);
    }).catch((err) => {
      res.status(500).send(err)
    })
});




module.exports = router;