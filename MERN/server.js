const express  = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
// import the router from apiController
var apiController = require('./server/routes/apiController.js');
// import the connection from the database
const { mongoose } = require('./server/config/index')

var app = express();
app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:4000'}));

app.get('/',(req, res) => {
    res.send('Server at port 3000')
})

app.listen(3000, () => console.log('Server started at port : 3000'));

app.use('/api', apiController);







