var url = "ws://"+window.location.host;
var connection = new WebSocket(url, ["json"]);

var simConfig = {
    serverAddress : "10.1.3.4",
    mac : "03:00:00:00:00:00",
    be164 : 30210800000,
    e164 : 4021080000,
    action: 'logon',
    users: 10,
    targetRate: 6 //(users/sec)
};


// When the connection is open, send some data to the server
connection.onopen = function () {
    connection.send('Ping'); // Send the message 'Ping' to the server
};

// Log errors
connection.onerror = function (error) {
    console.log('WebSocket Error ' + error);
};

// Log messages from the server
connection.onmessage = function (e) {
    console.log('Server: ' + e.data);
};


$(document).ready(function() {
    $("#start").click(function () {
        var message = {};
        message.action = "start";
        message.config = simConfig;

        connection.send(JSON.stringify(message));
    });
    $("#stop").click(function () {
        var message = {};
        message.action = "stop";

        connection.send(JSON.stringify(message));
    });
});