const express = require('express');
const router = express.Router();

// declare variable for clients 
var { ChatRoom } = require('../models/ChatRoom');
var { Events } = require('../models/Events')

router.get('/', (req, res) => {
    ChatRoom.find((err, docs) => {
        if (!err) { res.send(docs);}
        else { console.log('Error in Retrieving:' + JSON.stringify(err, undefined, 2));
    }
    })
})



module.exports = router;
