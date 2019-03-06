const mongoose = require('mongoose');

// connect using m.lab
const { io } = require('./websocket');

const url = "mongodb://101087205:Chat123456@ds161345.mlab.com:61345/chat-application";
//connect to mongodb

mongoose.connect(url, { useNewUrlParser: true }, function(err) {
    // If error throw err
    if(err) { throw err }
    // If not print the message to the console cli
    console.log('Mongodb Connected.....')
    //connect to socket.io
  });
module.exports = mongoose