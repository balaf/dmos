var url = "ws://"+window.location.host;
var connection = new WebSocket(url);


var simStats = {};
var simActualConfig = {};
var simConfig = {
    serverAddress : "10.5.62.10",
    mac : "03:00:00:00:00:00",
    be164 : 3021080000,
    e164 : 4021080000,
    action: 'startup',
    users: 1,
    targetRate: 1,//(users/sec)
};
var simStatus = {
    status : "unknown"
};

var actualArrivalRate;
var actualFinishRate;
var estimatedDuration;
var currentDuration;
var progress;


// When the connection is open, send some data to the server
connection.onopen = function () {
    connection.send('{"action" : "ping"}'); // Send the message 'Ping' to the server
};

connection.onerror = function (error) {
    console.log('WebSocket Error ' + error);
};


connection.onmessage = function (e) {

    var jsonData;
    try {
        jsonData = JSON.parse(e.data);
    } catch(err) {
        console.log(err);
    }
    simStatus = jsonData.status;

    // update buttons based on status
    if (simStatus.status === "finished") {
        $('#stop').attr('disabled', 'disabled');
        $('#start').removeAttr('disabled');
        $('#saveBt').removeAttr('disabled');

    } else if (simStatus.status === "stopped") {
        $('#stop').attr('disabled', 'disabled');
        $('#saveBt').attr('disabled', 'disabled');
        $('#start').attr('disabled', 'disabled');
    } else {
        $('#stop').removeAttr('disabled');
        $('#saveBt').attr('disabled', 'disabled');
        $('#start').attr('disabled', 'disabled');
    }
    console.log("Status:", simStatus.status);


    if (jsonData.stats) {
        simStats = jsonData.stats;
        /// fix simStats ///
        simStats.startTime = new Date(jsonData.stats.startTime);
        simStats.lastStarted = new Date(jsonData.stats.lastStarted);
        simStats.lastFinished = new Date(jsonData.stats.lastFinished);
        simStats.firstStarted = new Date(jsonData.stats.firstStarted);
        simStats.firstFinished = new Date(jsonData.stats.firstFinished);
        simStats.now = new Date(jsonData.stats.now);
        simActualConfig = jsonData.config;

        console.log(simStats);
        console.log(simActualConfig);

        /// edge cases:
        /// 1. none or only one has yet started
        actualArrivalRate = 0;
        actualFinishRate = 0;
        estimatedDuration = 0;
        currentDuration = 0;
        progress = ((simStats.finished + simStats.failed)/ simActualConfig.users) * 100 || 0;
        console.log("progress:", progress);
        /// 1. none or only one has yet finished

        if (simStats.finished <=1) {
            actualArrivalRate = simStats.started * 1000 / (simStats.lastStarted - simStats.firstStarted);
        }
        else if ((simStats.started > 1) && (simStats.finished > 1)) {
            actualArrivalRate = simStats.started * 1000 / (simStats.lastStarted - simStats.firstStarted);
            actualFinishRate = simStats.finished * 1000 / (simStats.lastFinished - simStats.firstFinished);
            estimatedDuration = simActualConfig.users/actualFinishRate;

            if (simStatus.status === "finished") {
                currentDuration = (simStats.lastFinished - simStats.startTime)/1000;
            } else {
                currentDuration = (simStats.now - simStats.startTime)/1000;

            }
        }
    }
}

$(document).ready(function () {
    $('#confTab a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    })

    $("#start").click(function () {
        //drawQueueChart();
        //drawRateChart();
        var message = {};
        message.action = "start";
        message.config = simConfig;
        // clean up charts


        connection.send(JSON.stringify(message));
        console.log(JSON.stringify(message));
        $('#start').attr('disabled', 'disabled');
        progress = 0;

    });
    $("#stop").click(function () {
        var message = {};
        message.action = "stop";

        connection.send(JSON.stringify(message));
        $('#stop').attr('disabled', 'disabled');

    });
});

function roundTo2Decimals(numberToRound) {
    return Math.round(numberToRound * 100) / 100
}

