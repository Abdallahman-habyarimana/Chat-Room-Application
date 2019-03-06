const mongoose = require('mongoose');
const io = require('socket.io').listen(4000).sockets;

// connect using m.lab
const url = "mongodb://101087205:Chat123456@ds161345.mlab.com:61345/chat-application";

//Import the model
const { ChatRoom } = require('../models/ChatRoom');
const { Events } = require('../models/Events');
const { RoomHistory } = require('../models/RoomHistory');

//connect to mongodb
mongoose.connect(url, { useNewUrlParser: true }, function(err) {
    // If error throw err
    if(err) { throw err }
    // If not print the message to the console cli
    console.log('Mongodb Connected.....')
    //connect to socket.io
    io.on('connection', function(socket) {
        // console.log("A user connected")
        // create function to send status
        sendStatus = function(s){
            socket.emit('status', s)
        }

        // handle input events 
        socket.on('input', function(data){
            //Call the handleFunction to
            //Save the events using Events Model
            handleEvent({name:data.name, type:'Input', date:data.date, time: data.date}) 
            // check for name and message
            handleChatRoom({name:data.name, message: data.message, room:data.room, date:data.date})
            //Emit back to the output the data that the user input
            socket.emit('output', [data]);
                    //send status object
            sendStatus({
                 message:'Message Sent',
                clear: true
            })
        });

        // handle new User events
        socket.on('join', function(data){
           // find the user in the room 
           // if the user found send the message to the output User connected otherwise
           //U User Join and insert to the room the new user and the user history
           RoomHistory.find({name:data.name, room:data.room}, (err, doc) => {
               //if no error find 
                if(!err){
                    // check whether the result is empty or if the length is equal to 0
                    if(doc.length === 0){
                        // insert the user to the room collections
                        handleRoomHistory({name:data.name, room:data.room})
                        //insert into the event collection
                        handleEvent({name:data.name, type:'Join', date:data.date, time:data.date})
                        // insert into the chat history 
                        //emit to the user output that 
                        handleChatRoom({name:data.name, message: 'Join', room:data.room, date:data.date})
                        // emit the broadcast message that the user join
                        io.emit('output', [{name:data.name, message: 'Join', room:data.room, date:data.date}]);
                        sendStatus({
                                clear:true
                        })
                        // if we found the user in the collection
                    } else {
                        //Call the handleEvent function to insert the events
                        handleEvent({name:data.name, type:'Connected', date:data.date, time:data.date})
                        // Select all the message from the room where the user belong
                        ChatRoom.where('room').equals(data.room).exec((err, result) => {
                            if(err){ throw err;  }
                            else { 
                               // loop throught the json and convert the result to array
                                let arr = result.map(result => ({ name:result.name, message:result.message}));
                                //push the data to the array that came from the connected user
                                arr.push(data);
                                //emit to the other user that user is connected
                                io.emit('output', arr);
                            sendStatus({
                                clear:true
                            })
                            }
                        })    
                    }
                }
                // if there is error it will throw it
                else { throw err}
            })
        })

        // handle on left events
        // when the user left the room
        socket.on('leftRoom', function(data){
            // Call the handleEvent to save the event 
            handleEvent({name:data.name, type:'Left', date:data.date, time: data.date}) 
            // update in the history that the user left
            handleChatRoom({name:data.name, message:'Left', date:data.date, time: data.date})
            // remove the user in the room
            // Emit the brodcast message to the output that user left the group
            RoomHistory.deleteOne({name:{$eq:data.name}, room:{$eq:data.room}}).exec((err, res) => {
                if(!err){
                    socket.broadcast.emit('output', [data]);
                    sendStatus({ clear:true })
                } else { throw err }         
            })
        })  
        
        // When the user clear the room
        socket.on('clear', function(data){
            // Call the handleEvent to save the event 
            handleEvent({name:data.name, type:'Clear', date:data.date, time: data.date}) 
            //emit cleared
            socket.emit('cleared')
        });

        // When the user disconnet
        socket.on('logout', function(data){
            // Call the handleEvent to save the event 
            handleEvent({name:data.name, type:'Logout', date:data.date, time: data.date}) 
            // Call the handleChatRoom to save the history 
            handleChatRoom({name:data.name, message:data.message, date:data.date, room:data.room});
                 socket.broadcast.emit('output', [data]);
                 sendStatus({
                     clear:true
                 })
                // client.emit
            })
    })

    // Function to save the Chat history
    function handleChatRoom(data) {
        var chat = new ChatRoom({
            name:data.name,
            message:data.message,
            room:data.room,
            date:data.date
        })
        chat.save()
    }

     // Function to save the Events
     // paramether that holds the data
    function handleEvent(data) {
        var event = new Events({
            name: data.name,
            type: data.type,
            date : data.date, 
            time: data.time
        })
        event.save()
    } 

    //Handle RoomHistory
    function handleRoomHistory(data){
        var rooms = new RoomHistory({
            name:data.name,
            room:data.room
        })
        rooms.save()
    }  
  });
module.exports = mongoose