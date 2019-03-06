const express = require('express');
var router = express.Router();

// declare variable for clients 
var { ChatRoom } = require('../models/ChatRoom');
var { Events } = require('../models/Events');
var { RoomHistory } = require('../models/RoomHistory')

router.get('/', (req, res) => {
    ChatRoom.find((err, docs) => {
        if (!err) { res.send(docs);}
        else { console.log('Error in Retrieving:' + JSON.stringify(err, undefined, 2));
    }
    })
})

router.get('/eventlog', (req, res) => {
    Events.find((err, docs) => {
        if (!err) { res.send(docs);}
        else { console.log('Error in Retrieving:' + JSON.stringify(err, undefined, 2));
    }
    })
})

router.get('/roomhistory', (req, res) => {
    RoomHistory.find((err, docs) => {
        if (!err) { res.send(docs);}
        else { console.log('Error in Retrieving:' + JSON.stringify(err, undefined, 2));
    }
    })
})



module.exports = router;
