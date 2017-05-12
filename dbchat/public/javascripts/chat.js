
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

        setStatus = function(statuss) {
            status.textContent = statuss;

            if (status !== statusDefault) {
                var delay = setTimeout(function() {
                    setStatus(statusDefault);
                    clearInterval(delay);
                }, 3000)
            }
        };

    try {
        var socket = io.connect('0.0.0.0:8080');
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
                    message.textContent = data[x].name + ':' + data[x].message;

                    //append
                    messages.appendChild(message);
                    messages.insertBefore(message, messages.firstChild);
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
        })
    }
});