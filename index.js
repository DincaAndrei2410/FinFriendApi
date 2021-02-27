const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const http = require('http').Server(app);
const https = require('https');
const fs = require('fs')

const simulators = require('./controllers/simulators.js');
const finance = require('./controllers/finance.js');
const sentiment = require('./controllers/sentiment.js');

const port = 3005;
const portSecure = 3006;

app.options('*', cors());

app.use(cors({
  origin: ['http://localhost:8080'],
  credentials: true,
}));

app.use(function (err, req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With, Content-Type, Accept, Authorization');
})

app.use(bodyParser.json());

app.use(bodyParser.json({
  limit: '50mb'
}));

app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));

// const server = https.createServer({
//   key: fs.readFileSync('key.pem'),
//   cert: fs.readFileSync('cert.pem'),
//   requestCert: false,
//   rejectUnauthorized: false
// }, app).listen(portSecure, () => {
//   console.log(`Server started at port: ${portSecure} for https`)
// })


app.get('/', (req, res) => {
  res.send('Hello World!')
})

http.listen(port, () => console.log(`Server started at port: ${port}`));

app.use('/simulators', simulators);
app.use('/finance', finance);
app.use('/sentiment', sentiment);