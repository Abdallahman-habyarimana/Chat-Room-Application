// import all the package
const express  = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path')
// import the router from apiController
var apiController = require('./server/routes/apiController.js');
// import the connection from the database
const { mongoose } = require('./server/config/index')
// declare the express variable
var app = express();
// set the express use the body parse
app.use(bodyParser.json());
// set the cors to listen to this localhost with port 4000
app.use(cors({ origin: 'http://localhost:4000'}));
// when the url is http://localhost:3000 print the message below 
app.get('/',(req, res) => {
    res.send('Server at port 3000')
})
// heruko port 
const PORT = process.env.PORT || 3000
// serve static files from the Public 
app.use(express.static(path.join(__dirname, 'public/src')))
// set the express to listen to the server
app.listen(PORT, () => console.log('Server started at port : 3000'));
// set the express api to listen when is http:localhost:3000/api
// all the route of the apiController
app.use('/api', apiController);
// anything that doesn't match the above, send back index.html
app.get('*', (req, res) => {
   res.sendFile(path.join + 'public/src/index.html')
})







