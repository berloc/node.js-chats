'use strict';

const mongo = require('mongodb').MongoClient;
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('public'));

server.listen(9090, '0.0.0.0');
console.log('The server is running on 9090');

let room = null;
let firstName = null;
let lastName = null;

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
    room = req.query.room;
    firstName = req.query.firstname;
    lastName = req.query.lastname;
});


mongo.connect('mongodb://127.0.0.1/chat', function(err, db) {
    if (err) throw err;

    io.on('connection', function(socket) {

        let col = db.collection('messages'),
            sendStatus = function(status) {
                socket.emit('status', status);
            };

        //emit all messages
        col.find({room: room}).limit(100).sort({date: -1}).toArray(function(err, res) {
            if (err) throw err;
            socket.emit('output', res);
        });

        // emit room number and firstname
        socket.emit('room', room);
        socket.emit('firstName', firstName);

        // waiting for input
        socket.on('input', function(data) {
            let name = data.name,
                message = data.message,
                whitespacePattern = /^\s*$/;

            if (whitespacePattern.test(name) || whitespacePattern.test(message)) {
                sendStatus('Name and message is required');
            } else {
                col.insert({name: name, message: message, date: new Date(), room: room, lastname: lastName}, function() {

                    //emit latest messages to all clients
                    io.emit('output', [data]);

                    sendStatus({
                        message: 'Message sent',
                        clear: true
                    });
                });
            }
        });
    });
});