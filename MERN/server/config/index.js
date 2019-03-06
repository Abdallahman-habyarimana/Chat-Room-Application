const mongoose = require('mongoose');
const client = require('socket.io').listen(4000).sockets;

// connect using m.lab
const url = "mongodb://101087205:Chat123456@ds351455.mlab.com:51455/chat-application"

const { ChatRoom } = require('../models/ChatRoom');
const { Events } = require('../models/Events');
const { RoomHistory } = require('../models/RoomHistory');


//connect to mongodb
mongoose.connect(url, { useNewUrlParser: true }, function(err) {
    if(err) { throw err }

    console.log('Mongodb Connected.....')

    //connect to socket.io
    client.on('connection', function(socket) {
        // console.log("A user connected")
        // create function to send status
        sendStatus = function(s){
            socket.emit('status', s)
        }

        //Gets Chats from mongo collection
        /*chat_history.find().limit(100).sort({_id:1}).toArray(function(err,res) {
            if(err){ throw err;  }
            socket.emit('output', res);
        });*/

        // handle input events 
        socket.on('input', function(data){
            //Save the events
            handleEvent({name:data.name, type:'Input', date:data.date, time: data.date}) 
            // check for name and message
            handleChatRoom({name:data.name, message: data.message, room:data.room, date:data.date})
            client.emit('output', [data]);
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
                if(!err){
                    if(doc.length === 0){
                        console.log("Join");
                        // insert the user to the room collections
                        handleRoomHistory({name:data.name, room:data.room})
                        //insert into the event collection
                        handleEvent({name:data.name, type:'Join', date:data.date, time:data.date})
                        // insert into the chat history 
                        //emit to the user output that 
                        handleChatRoom({name:data.name, message: 'Join', room:data.room, date:data.date})
                            // emit to the output the user
                            client.emit('output', [{name:data.name, message: 'Join', room:data.room, date:data.date}]);
                            sendStatus({
                                clear:true
                            })
                        
                    } else {
                        //insert into the event collection
                        handleEvent({name:data.name, type:'Connected', date:data.date, time:data.date})
                        ChatRoom.where('room').equals(data.room).exec((err, result) => {
                            if(err){ throw err;  }
                            else { 
                               // var arr = new Array()
                                let arr = result.map(result => ({ name:result.name, message:result.message}));
                                //console.log(arr)
                               // console.log(result)
                                arr.push(data);
                                client.emit('output', arr);
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
        socket.on('leftRoom', function(data){
            // event.insertOne({Type:'Left', Date:date, })
            handleEvent({name:data.name, type:'Left', date:data.date, time: data.date}) 
            handleChatRoom({name:data.name, message:'Left', date:data.date, time: data.date})
            // remove the user in the room
            // Emit the brodcast message to the output that user left the group
            RoomHistory.deleteOne({name:{$eq:data.name}, room:{$eq:data.room}}).exec((err, res) => {
                if(!err){
                    client.emit('output', [data]);
                    sendStatus({ clear:true })
                } else { throw err }         
            })
        })
            


        socket.on('clear', function(data){
            //Save the events
            handleEvent({name:data.name, type:'Clear', date:data.date, time: data.date}) 
            //emit cleared
                socket.emit('cleared')
        });
        // When the user disconnet
        socket.on('logout', function(data){
                //Save the events
                 handleEvent({name:data.name, type:'Logout', date:data.date, time: data.date}) 
                 handleChatRoom({name:data.name, message:data.message, date:data.date, room:data.room});
                    client.broadcast.emit('output', [data]);
                    sendStatus({
                        clear:true
                    })
            })
    })

    function handleChatRoom(data) {
        var chat = new ChatRoom({
            name:data.name,
            message:data.message,
            room:data.room,
            date:data.date
        })
        chat.save()
    }
    // Handle Events
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