const express = require('express');
var bodyParser = require('body-parser');
var app = express();
let http = require('http').Server(app);

const simulators = require('./controllers/simulators.js');

app.use(bodyParser.json());
app.use(bodyParser.json({
  limit: '50mb'
}));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));

const port = 3005;
http.listen(port, () => console.log(`Server started at port: ${port}`));

app.use('/simulators', simulators);