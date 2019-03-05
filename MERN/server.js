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
        const events = db.collection('Events')
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
            //Save the events
            events.insertOne({name:data.name, type:'Input', date:data.date, time: data.date}) 
            // check for name and message
                chat.insertOne({name:data.name, message: data.message, room:data.room, date:data.date}, function(){
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
           // find the user in the room 
           // if the user found send the message to the output User connected otherwise
           //U User Join and insert to the room the new user and the user history
            rooms.find({name:data.name, room:data.room}).toArray(function(err, res) {
                if(!err){
                    if(res.length === 0){
                        console.log("Join");
                        // insert the user to the room collections
                        rooms.insertOne({name:data.name, room:data.room})
                        //insert into the event collection
                        events.insertOne({name:data.name, type:'Join', date:data.date, time:data.date})
                        // insert into the chat history 
                        //emit to the user output that 
                        chat.insertOne({name:data.name, message: 'Join', room:data.room, date:data.date}, function(){
                            // emit to the output the user
                            client.emit('output', [{name:data.name, message: 'Join', room:data.room, date:data.date}]);
                            sendStatus({
                                clear:true
                            })
                        })
                    } else {
                        //insert into the event collection
                        events.insertOne({name:data.name, type:'Connected', date:data.date, time:data.date})
                        chat.find({room:data.room}).limit(100).sort({_id:1}).toArray(function(err,doc) {
                        if(err){ throw err;  }
                        else {
                        doc.push(data)
                        socket.broadcast.emit('output', doc);
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
            events.insertOne({name:data.name, type:'Left', date:data.date, time: data.date}) 
            chat.insertOne({name:data.name, message:'Left', date:data.date, time: data.date})
            // remove the user in the room
            // Emit the brodcast message to the output that user left the group
            rooms.remove({name:data.name, room:data.room}, (err, res) => {
                if(!err){
                    client.broadcast.emit('output', [data]);
                    sendStatus({ clear:true })
                } else { throw err }         
            })
        })
            


        socket.on('clear', function(data){
            //Save the events
            events.insertOne({name:data.name, type:'Clear', date:data.date, time: data.date}) 
            //emit cleared
                socket.emit('cleared')
        });
        // When the user disconnet
        socket.on('logout', function(data){
                //Save the events
                 events.insertOne({name:data.name, type:'Logout', date:data.date, time: data.date}) 
                 chat.insertOne({name:data.name, message:data.message, date:data.date, room:data.room}, function(){
                    client.broadcast.emit('output', [data]);
                    sendStatus({
                        clear:true
                    })
                })
            })    
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







