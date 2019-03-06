const express = require('express');
var router = express.Router();

// declare variable for clients 
var { ChatRoom } = require('../models/ChatRoom');
var { Events } = require('../models/Events');
var { RoomHistory } = require('../models/RoomHistory')

// get all chat history
router.get('/history', (req, res) => {
    ChatRoom.find((err, docs) => {
        if (!err) { res.send(docs);}
        else { console.log('Error in Retrieving:' + JSON.stringify(err, undefined, 2));
    }
    })
})

// get all Event
router.get('/eventlog', (req, res) => {
    Events.find((err, docs) => {
        if (!err) { res.send(docs);}
        else { console.log('Error in Retrieving:' + JSON.stringify(err, undefined, 2));
    }
    })
})

router.get('/roomhistory/:room', (req, res) => {
    ChatRoom.where('room').equals(req.params.room).exec((err, docs) => {
        if (!err) { res.send(docs);}
        else { console.log('Error in Retrieving:' + JSON.stringify(err, undefined, 2)); }
    })
})

module.exports = router;
