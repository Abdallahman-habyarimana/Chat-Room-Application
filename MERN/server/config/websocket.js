const io = require('socket.io').listen(4000).sockets;

//Import the model
const { ChatRoom } = require('../models/ChatRoom');
const { RoomHistory } = require('../models/RoomHistory');
const mongoose = require('mongoose');

require('../routes/mongoController.js')

io.on('connection', function(socket) {
    // console.log("A user connected")
    // create function to send status
    sendStatus = function(s){
        socket.emit('status', s)
    }
    
    let ar1 = []
    // handle input events 
    socket.on('input', function(data){
        //Call the handleFunction to
        //Save the events using Events Model
        var ppid = Math.random().toString(26).slice(10)
        handleEvent({type:'Input', date:data.date, time: data.date,ppid:ppid}) 
        // check for name and message
        handleChatRoom({name:data.name, message: data.message, room:data.room, date:data.date})
        //set the 
        unSet({name:data.name, message: 'disconnect', room:data.room, date:data.date})
        //Emit back to the output the data that the user input
        io.emit('output', [data]);
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
                    handleRoomHistory({name:data.name, room:data.room, date:data.date})
                    //insert into the event collection
                    var ppid = Math.random().toString(26).slice(10)
                    handleEvent({type:'Join', date:data.date, time: data.date,ppid:ppid}) 
                    // insert into the chat history 
                    //emit to the user output that 
                    handleChatRoom({name:data.name, message: 'Join', room:data.room, date:data.date})
                    //Unset array
                    unSet({name:data.name, message: 'disconnect', room:data.room, date:data.date, time:data.date})
                    // emit the broadcast message that the user join
                    socket.broadcast.emit('output', [{name:data.name, message: 'Join', room:data.room, date:data.date}]);
                    sendStatus({
                            clear:true
                    })
                    // if we found the user in the collection
                } else {
                    //Call the handleEvent function to insert the events
                    var ppid = Math.random().toString(26).slice(10)        
                    handleEvent({type:'Connected', date:data.date, time: data.date,ppid:ppid}) 
                    unSet({name:data.name, message: 'disconnect', room:data.room, date:data.date, time:data.date})
                    // convert the result in the array 
                    var ar = doc.map(doc => ({ name:doc.name, date:doc.date, room:doc.room}));
                    let b = new Date();
                    for(var i=0; i<ar.length;i++){ b = ar[i].date}
                    // Select all the message from the room where the user belong
                    ChatRoom.where('room').equals(data.room).where('date').gte(b).exec((err, result) => {
                        if(err){ throw err;  }
                        else if(result){ 
                            //console.log(ar)
                           // loop throught the json and convert the result to array
                            let arr = result.map(result => ({ name:result.sender, message:result.message, room:result.room}));
                            //push the data to the array that came from the connected user
                            socket.broadcast.emit('output', [{name:data.name, message:'Connected', date:data.date, time:data.date, room:data.room}])
                            //emit to the other user that user is connected
                            socket.emit('output', arr);
                             sendStatus({
                            clear:true
                        })
                        }
                        else{ console.log("Not greater")}
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
        var ppid = Math.random().toString(26).slice(10)
        handleEvent({type:'Left', date:data.date, time: data.date,ppid:ppid}) 
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

    // When the user disconnet
    socket.on('logout', function(data){
        // Call the handleEvent to save the event 
        var ppid = Math.random().toString(26).slice(10)
        handleEvent({type:'Logout', date:data.date, time: data.date,ppid:ppid}) 
        // Call the handleChatRoom to save the history 
        handleChatRoom({name:data.name, message:data.message, date:data.date, room:data.room});
        RoomHistory.findOneAndRemove({name:data.name, room: data.room}, ((err) =>{
            if(err) { throw err }
            else { 
                socket.broadcast.emit('output', [data]);
                sendStatus({
                clear:true
            })
            }
        }))
    })

    // handle on left events
    // when the user left the room
    socket.on('disconnect', function(){
        // update in the history that the user left
        if (!ar1){ }
        else if( ar1.length === 1){
            for(var i=0; i<ar1.length;i++){
                handleChatRoom({name:ar1[i].name, message:'disconnect', date:Date.now(), room:ar1[i].room})
                socket.broadcast.emit('output', [{name:ar1[i].name, message:'disconnect', date:Date.now(), room:ar1[i].room}]);
                sendStatus({ clear:true })
            }
        // Call the handleEvent to save the event 
        var ppid = Math.random().toString(26).slice(10)
        handleEvent({type:'disconnect', date:Date.now(), time:Date.now(), ppid:ppid}) 
        // remove the user in the room
        // Emit the brodcast message to the output that user left the group
    }  
    else {  }
    })  
    function unSet(data){
         ar1.push(data) 
    }
   
})

module.exports = { io }