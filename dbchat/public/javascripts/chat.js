'use strict';

$(function () {
    var getNode = function(selector) {
            return document.querySelector(selector);
        },

        // get required nodes
        status = getNode('.chat-status span'),
        textarea = getNode('.chat-textarea'),
        chatName = getNode('.chat-name'),
        statusDefault = status.textContent,
        messages = getNode('.chat-messages'),
        button = getNode('#send-message');

        var setStatus = function(statuss) {
            status.textContent = statuss;

            if (status !== statusDefault) {
                var delay = setTimeout(function() {
                    setStatus(statusDefault);
                    clearInterval(delay);
                }, 5000)
            }
        };

    try {
        var socket = io.connect();
    } catch (e) {
        console.log(e);
        // set status
    }
    if (socket!==undefined) {
        console.log('Ok');

        //listen for a status
        socket.on('status', function(data) {
            setStatus((typeof data === 'object') ? data.message : data);

            if (data.clear === true) {
                textarea.value = '';
            }
        });

        //listen for output
        socket.on('output', function(data) {
            if(data.length) {
                //loop through results
                for (let x = 0; x < data.length; x++) {
                    let message = document.createElement('div');
                    message.setAttribute('class', 'chat-message');
                    message.textContent = data[x].name + ': ' + data[x].message;

                    //append the messages to the bottom of the div and scroll automatically when the user send the message
                    messages.appendChild(message);
                    messages.insertBefore(message, messages.lastChild);
                    // messages.insertBefore(messages.lastChild, message);
                    messages.scrollTop = messages.scrollHeight;
                }
            }
        });

        //listen for keydown
        textarea.addEventListener('keydown', function (event) {
            let self = this,
                name = chatName.value;
            if (event.which===13 && event.shiftKey === false){
                socket.emit('input', {
                    name: name,
                    message: self.value
                });
                event.preventDefault();
            }
        });

        // /listen for click
        $(button).on('click', function (event) {
            socket.emit('input', {
                name: chatName.value,
                message: textarea.value
            });
            event.preventDefault();
        });

        const addEmojiToTextarea = function () {
            $(".emoji").on('click', function(element) {
                let value = element.target.textContent;
                textarea.value += value;
            })
        };

        $('#myModal').on('shown.bs.modal', function () {
            textarea = getNode('.chat-textarea');
            addEmojiToTextarea();
        });

        $('#myModal').on('hidden.bs.modal', function () {
            $(".emoji").off('click');
        })

        $('.alma').on('click', function() {
            socket.emit('chatrooms', function() {
                socket.on('chat-rooms', function(data) {
                    console.log(data);
                    console.log('kiskutyafasza')
                });
            });
        })

    }
});

let hideModal = function() {
    document.addEventListener('keydown', function(event) {
        if (event.which===27) {
            $('#myModal').modal('hide');
        }
    })
};

$(document).ready(function() {
    hideModal();
});

