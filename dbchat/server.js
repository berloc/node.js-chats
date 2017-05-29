'use strict';

const mongo = require('mongodb').MongoClient;
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const client = require('socket.io')(server);
app.use(express.static('public'));

server.listen(9090, '0.0.0.0');
console.log('The server is running on 9090');


let rooms = ['global','alma'];

app.get('/', function (req, res) {
   res.sendFile(__dirname + '/index.html');
});

mongo.connect('mongodb://127.0.0.1/chat', function(err, db) {
    if (err) throw err;

    client.on('connection', function(socket) {

        let col = db.collection('messages'),
            sendStatus = function(status) {
                socket.emit('status', status);
            };

        //emit all messages
        col.find().limit(1000).sort({_id:1}).toArray(function(err, res) {
            if (err) throw err;
            socket.emit('output', res)
        });

        // waiting for input
        socket.on('input', function(data) {
            let name = data.name,
                message = data.message,
                whitespacePattern = /^\s*$/;

            if (whitespacePattern.test(name) || whitespacePattern.test(message)) {
                sendStatus('Name and message is required');
            } else {
                col.insert({name: name, message: message}, function() {

                    //emit latest messages to all clients
                    client.emit('output', [data]);

                    sendStatus({
                        message: 'Message sent',
                        clear: true
                    });
                });
            }
        });

        socket.on('chatrooms', function() {
            socket.emit('chat-rooms', rooms);
            console.log(rooms);
        });
    });
});