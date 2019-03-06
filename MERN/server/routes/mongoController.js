const { ChatRoom } = require('../models/ChatRoom');
const { Events } = require('../models/Events')
const { RoomHistory } = require('../models/RoomHistory')

module.exports = {

    handleChatRoom = (data) => {
    var chat = new ChatRoom({
    name:data.name,
    message:data.message,
    date:data.date,
    room:data.room
    })
    chat
    },

    handleEvent = () => {

    },

    handleChatHistory = () => {

    }
}