const mongoose = require('mongoose');

// connect using m.lab
const { io } = require('./websocket');

const { config } =require('./dev')
//connect to mongodb
var url = config.URL

mongoose.connect(url, { useNewUrlParser: true }, function(err) {
    // If error throw err
    if(err) { throw err }
    // If not print the message to the console cli
    console.log('Mongodb Connected.....')
    //connect to socket.io
  });
module.exports = mongoose