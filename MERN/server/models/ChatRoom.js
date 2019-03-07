const mongoose = require('mongoose');
const Schema = mongoose.Schema
var ChatSchema = new Schema({
    sender: {  type: String, required:true } ,
    message: { type: String,required:true },
    room: { type: String, required:true},
    date : { type: Date, required:true }, 
});
var ChatRoom = mongoose.model('ChatRoom', ChatSchema)
module.exports = { ChatRoom }