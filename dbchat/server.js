'use strict';

var mongo = require('mongodb').MongoClient;
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var client = require('socket.io')(server);
var users = [];
var connections = [];
app.use(express.static('public'));

server.listen(8080, '0.0.0.0');
console.log('The server is running on 8080');


app.get('/', function (req, res) {
   res.sendfile(__dirname + '/index.html');
});

mongo.connect('mongodb://127.0.0.1/chat', function(err, db) {
    if (err) throw err;

    client.on('connection', function(socket) {

        let col = db.collection('messages'),
            sendStatus = function(status) {
                socket.emit('status', status);
            };

        //emit all messages
        col.find().limit(100).sort({_id:1}).toArray(function(err, res) {
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
    });
});