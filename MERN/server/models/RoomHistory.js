const mongoose = require('mongoose');
const Schema = mongoose.Schema
var RoomSchema = new Schema({
    name: {  type: String, required:true } ,
    room: { type: String, required:true},
    date: { type: Date, required:true}
});
var RoomHistory = mongoose.model('RoomHistory', RoomSchema)
module.exports = { RoomHistory }