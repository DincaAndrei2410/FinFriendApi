const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);

const simulators = require('./controllers/simulators.js');
const finance = require('./controllers/finance.js');

app.use(bodyParser.json());
app.use(bodyParser.json({
  limit: '50mb'
}));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));


app.get('/', (req, res) => {
  res.send('Hello World!')
})

const port = 3005;
http.listen(port, () => console.log(`Server started at port: ${port}`));

app.use('/simulators', simulators);
app.use('/finance', finance);