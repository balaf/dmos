var url = "ws://"+window.location.host;
var connection = new WebSocket(url);

var simConfig = {
    serverAddress : "10.1.3.4",
    mac : "03:00:00:00:00:00",
    be164 : 30210800000,
    e164 : 4021080000,
    action: 'logon',
    users: 10,
    targetRate: 6 //(users/sec)
};

var simStats = {}
var simActualConfig = {}
var simStatus = {
    status : "finished"
}

var actualArrivalRate;
var actualFinishRate;
var estimatedDuraiton;
var currentDuration;
var remainingTime;
var remainingPercentage;

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
    console.log( e.data);
    var jsonData;
    try {
        jsonData = JSON.parse(e.data);
    } catch(err) {
        console.log(err);
    }
    simStatus = jsonData.status;
    if (jsonData.stats) {
        simStats = jsonData.stats;
        /// fix simStats ///
        simStats.lastStarted = new Date(jsonData.stats.lastStarted);
        simStats.lastFinished = new Date(jsonData.stats.lastFinished);
        simStats.firstStarted = new Date(jsonData.stats.firstStarted);
        simStats.firstFinished = new Date(jsonData.stats.firstFinished);
        simStats.now = new Date(jsonData.stats.now);
        simActualConfig = jsonData.config;

        console.log(simStats);
        console.log(simActualConfig);



        actualArrivalRate = simStats.started / (simStats.lastStarted - simStats.firstStarted);
        actualFinishRate = simStats.finished / (simStats.lastFinished - simStats.firstFinished);
        estimatedDuraiton = (simStats.firstFinished - simStats.firstStarted) + (simActualConfig.users/actualFinishRate)
        currentDuration = Math.min((simStats.now - simStats.startTime))
        remainingTime = estimatedDuraiton - currentDuration;
        remainingPercentage = (currentDuration / estimatedDuraiton) * 100;

        console.log("remainingTime:", remainingTime);
        console.log("remainingPrecentage", remainingPercentage);
    }


};


$(document).ready(function () {
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

///    ProgressBar /////////////////////
    $("#progressBar").dxLinearGauge({
        scale: {
            startValue: 0,
            endValue: 100,
            majorTick: {
                showCalculatedTicks: false,
                customTickValues: [0,10,20,30,40,50,60,70,80,90,100]
            }
        },
        rangeContainer: {
            backgroundColor: "none",
            ranges: [
                {
                    startValue: 0,
                    endValue: 100,
                    color: "#A6C567"
                }
            ]
        },
        markers: [{ value: 32 }],
        rangeBars: [{ value: 32 }]
    });

// Arrival Rate Gauges
    $(".gauge").dxCircularGauge({
        size: {
            width: 200,
            height: 200
        },
        margin: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        },
        scale: {
            startValue: 0,
            endValue: 10,
            majorTick: {
                showCalculatedTicks: false,
                customTickValues: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
            }
        },
        rangeContainer: {
            backgroundColor: "none",
            ranges: [{
                startValue: 0,
                endValue: 2,
                color: 'blue'
            }, {
                startValue: 2.2,
                endValue: 5,
                color: 'green'
            }, {
                startValue: 5.2,
                endValue: 8,
                color: 'orange'
            }, {
                startValue: 8.2,
                endValue: 10,
                color: 'red'
            }]

        },
        markers: [{ value: 6.1 }],
        needles: [{ value: 6.1 }]
    });

});
