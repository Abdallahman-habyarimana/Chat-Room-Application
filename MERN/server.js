const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

// connect using m.lab
const url = "mongodb://101087205:Chat123456@ds351455.mlab.com:51455/chat-application"

//connect to mongodb
mongo.connect(url, { useNewUrlParser: true }, function(err, database) {
    if(err) { throw err }

    console.log('Mongodb Connected.....')

    //connect to socket.io
    client.on('connection', function(socket) {
        // connection to the database
        var db = database.db('chat-application')
        // create the collection
        const chat = db.collection('chats');
        const event = db.collection('events')
        const rooms = db.collection('rooms')
        const chat_history = db.collection('chat_history');


        // console.log("A user connected")
        // create function to send status
        sendStatus = function(s){
            socket.emit('status', s)
        }

        //Gets Chats from mongo collection
        chat.find().limit(100).sort({_id:1}).toArray(function(err,res) {
            if(err){ throw err;  }
            socket.emit('output', res);
        });

        // handle input events 
        socket.on('input', function(data){
            let name = data.name;
            let message = data.message;
            let date = data.date;
            let room = data.rooms;

            console.log(name + " " + message + " " + date)
            // check for name and message
            if( name == '' || message == '' || date == ''){
                //send error status
                sendStatus('Please enter a name and message')
            }
            else {
                chat.insert({name: name, message: message, date: date}, function(){
                    client.emit('output', [data]);
                    //send status object
                    sendStatus({
                        message:'Message Sent',
                        clear: true
                    })
                })
            }
        });

        // handle new User events
        socket.on('join', function(data){
            let name = data.name;
            let message = data.message;
            let date = data.date;
            let room = data.room;

            if( name == '' || message == '' || date == '' || room == ''){
                sendStatus('Please enter a name and message');
            }else{
                chat_history.insert({name:name, message: message, date: date, room: room}, function(){
                    client.emit('output', [data]);
                    sendStatus({
                        clear:true
                    })
                })
            }

        })

        // handle on left events
        socket.on('leftRoom', function(data){
            
            let name = data.name;
            let message = data.message;
            let date = data.date;
            let room = data.room;

            if( name == '' || message == '' || date == '' || room == ''){
                sendStatus('Please enter a name and message');
            }else{
                    client.emit('output', [data]);
                    sendStatus({
                        clear:true
                    })
            }
        })


        socket.on('Clear', function(data){
            // remove all chats from collection
            chat.remove({}, function(){
                //emit cleared
                socket.emit('cleared')
            })
        });

        socket.on('disconnect', function(data){
            let name = data.name;
            let message = data.message;
            let date = data.date;
            let room = data.room;

            if( name == '' || message == '' || date == '' || room == ''){
                //sendStatus('Please enter a name and message');
            }else{
                chat_history.insert({name:name, message: message, date: date, room: room}, function(){
                    client.emit('output', [data]);
                    sendStatus({
                        clear:true
                    })
                })
            }
         })
     
    })

});

