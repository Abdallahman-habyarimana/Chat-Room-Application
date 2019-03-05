const express  = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;


var app = express();

var apiController = require('./server/routes/apiController');
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
        const chat = db.collection('ChatRoom');
        const event = db.collection('Events')
        const rooms = db.collection('RoomHistory')
       // const chat_history = db.collection('chat_history');

        
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
            let name = data.name;
            let message = data.message;
            let date = data.date;
            let room = data.room;
            // check for name and message
                chat.insertOne({name: name, message: message, room:room, date: date}, function(){
                   client.emit('output', [data]);
                    //send status object
                    sendStatus({
                        message:'Message Sent',
                        clear: true
                    })
                })
        });

        // handle new User events
        socket.on('join', function(data){
            let name = data.name;
            let message = data.message;
            let date = data.date;
            let room = data.room;

            if( name == '' || message == '' || date == '' || room == ''){
                sendStatus('Please enter a name and message');
            } else {
                // find the name and the room in the room history
                // if the result not found send the message to the screen Join
                // else the message send to the screen connected
                chat.find({name:name, room:room}).toArray(function(err, res){
                    if(err) throw err
                    else {
                        if(res.length == 0){
                            message = `Joined`;
                            // call the function to insert the Events
                            InsertEvents({name:name, type:'Join', date:date, time: date})
                            // insert to the chat_history the new user who joined
                            chat.insertOne({name:name, message: message, room:room, date: date}, function(){
                                // emit to the output the user
                                client.emit('output', [{name:name, message: message, room:room, date: date}]);
                                sendStatus({
                                    clear:true
                                })
                            })
                        } else {
                            //
                            InsertEvents({name:name, type:'Connected', date:date, time: date})
                            // select all message from the room
                            // if no message in the room
                            chat.find({room:room}).limit(100).sort({_id:1}).toArray(function(err,doc) {
                                if(err){ throw err;  }
                                else {
                                doc.push(data)
                                socket.emit('output', doc);
                                }
                            })
                        }
                        
                    }
                })
            }

        })

        // handle on left events
        socket.on('leftRoom', function(data){
            // event.insertOne({Type:'Left', Date:date, })
            InsertEvents({name:data.name, type:'Left', date:data.date, time: data.date}) 
            client.emit('output', [data]);
                sendStatus({
                   clear:true
                })
            })


        socket.on('clear', function(data){
            // remove all chats from collection
            chat.remove({}, function(){
            //emit cleared
                socket.emit('cleared')
            })
        });

        socket.on('logout', function(data){
            let name = data.name;
            let message = data.message;
            let date = data.date;
            let room = data.room;

            console.log(name)
            console.log(message)
            console.log(room)
                
            if( name == '' || message == '' || date == '' || room == ''){
                //sendStatus('Please enter a name and message');
                console.log("Empty")
            }else{
                chat.insertOne({name:name, message: message, date: date, room: room}, function(){
                    client.emit('output', [data]);
                    sendStatus({
                        clear:true
                    })
                })
            }
         })

    // process to inserts events
    function InsertEvents(data){
     events = {
        name: data.name,
        type: data.type,
        date: data.date,
        time: data.time,
       };
    event.insertOne(events)
    }

    // remove the user from the room
    function RemoveUser(data){
      
    }

    // function to inserts chat history in the collection
    })
});


// express
app.use(cors({origin: 'http://localhost:4000'}))

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

//app.use(express.static(__dirname + '/static'));

app.get('/',(req, res) => {
    res.send('Server run at port 3000')
})

app.use('/api', apiController);

const port = 3000 || process.env.PORT;

app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})







