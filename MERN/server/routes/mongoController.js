//import all schema
const { ChatRoom } = require('../models/ChatRoom');
const { Events } = require('../models/Events')
const { RoomHistory } = require('../models/RoomHistory')
//function to save the data
handleChatRoom = (data) => {
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
handleEvent = (data) => {
    var event = new Events({
        name: data.name,
        type: data.type,
        date : data.date, 
        time: data.time
    })
    event.save()
} 
//Handle RoomHistory
handleRoomHistory = (data) => {
    var rooms = new RoomHistory({
        name:data.name,
        room:data.room
    })
    rooms.save()
}  
//exports all functions
module.exports = {
    // Function to save the Chat history
    handleChatRoom,
    handleEvent,
    handleRoomHistory
}