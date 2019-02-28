const mongoose = require('mongoose');
const Schema = mongoose.Schema

//Creating the ChatSchema 
var ChatSchema = new Schema({
    id: {type: number, required: true},
    message:{type: string, required:true},
    name:{type:string, required:true},
    user: [{  
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    }],
    created_dt : { type: Date, required:true },
});
// create a model ChatRoom
var ChatRoom  = mongoose.model('ChatRoom', ChatSchema)
// Exports the Model
module.exports = { ChatRoom }
