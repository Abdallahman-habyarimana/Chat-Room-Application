const mongoose = require('mongoose');
const Schema = mongoose.Schema

var UserSchema = new Schema({
    name: {  type: String, required:true } ,
    created_dt : { type: Date, required:true },
});

var User = mongoose.model('User', UserSchema)

module.exports = { User }
