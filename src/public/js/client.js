var url = "ws://"+window.location.host;
var connection = new WebSocket(url);

var simConfig = {
    serverAddress : "10.1.3.4",
    mac : "03:00:00:00:00:00",
    be164 : 30210800000,
    e164 : 4021080000,
    action: 'logon',
    users: 100,
    targetRate: 6 //(users/sec)
};

var simStats = {};
var simActualConfig = {};
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

    // Update DOM on connection
    App.targetArrivalRate(simActualConfig.targetRate);
    App.targetUsers(simActualConfig.users);

    // update buttons based on status
    if (simStatus.status === "finished") {
        $('#stop').attr('disabled', 'disabled');
        $('#start').removeAttr('disabled');
        $('#saveBt').removeAttr('disabled');

    } else {
        $('#stop').removeAttr('disabled');
        $('#saveBt').attr('disabled', 'disabled');
        $('#start').attr('disabled', 'disabled');
    }

    //// configuration pop-up buttons
    $('#save').click(function(){
        console.log("Saving form");
    });

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
        progress = 0;

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
                progress = 100;
            } else {
                currentDuration = (simStats.now - simStats.startTime)/1000;
                progress = (simStats.finished / simStats.started) * 100;
            }
        }

        /// Update DOM on every message from the ws ////
        App.actualArrivalRate(roundTo2Decimals(actualArrivalRate));
        App.actualFinishRate(roundTo2Decimals(actualFinishRate));
        App.estimatedDuration(estimatedDuration);
        App.currentDuration(currentDuration);
        App.progress(progress);
        App.finishedUsers(simStats.finished);
        App.startedUsers(simStats.started);




        console.log("actualArrivalRate:", actualArrivalRate);
        console.log("actualFinishRate:", actualFinishRate);
        console.log("estimatedDuration:", estimatedDuration);
        console.log("currentDuration:", currentDuration);
        console.log("progress: %s %", progress);
    }

    function calculateStats(devices){
        /// calculate min/max/mean
        var min = 100000; //(sec)
        var result = {
            max : 0,
            mean: 0,
            min: 0,
            variance: 0
        };
        var max = 0; //(sec)
        var mean;
        var variance = 0;
        var i;
        var currentDevice;

        var totalDuration = 0;
        var finishedDevices = 0;

        for (i=0;i<devices.length;i++) {
            currentDevice = devices[i];
            if (currentDevice.finished) {
                finishedDevices ++;
                currentDevice.duration = currentDevice.endTime - currentDevice.startTime;
                if (currentDevice.duration < min) {
                    min = currentDevice.duration;
                }
                if (currentDevice.duration > max) {
                    max = currentDevice.duration;
                }
                totalDuration += currentDevice.duration;
            }
        }
        mean = (totalDuration/finishedDevices);

        for (i=0;i<finishedDevices;i++){
            variance += Math.pow((currentDevice.duration - mean),2)
        }
        result.min = Math.round(min/10)/100;
        result.max = Math.round(max/10)/100;
        result.mean = Math.round(mean/10)/100;

        return result;
    }
};


///////////////  Simulator GUI Model ///////////////

function AppViewModel() {
    this.targetArrivalRate = ko.observable(simConfig.targetRate);
    this.actualArrivalRate = ko.observable(0);
    this.actualFinishRate = ko.observable(0);
    this.targetUsers = ko.observable(simActualConfig.users);
    this.startedUsers = ko.observable(0);
    this.finishedUsers = ko.observable(0);
    this.currentDuration = ko.observable(0);
    this.progress = ko.observable(0);
    this.estimatedDuration = ko.observable(0);


    this.progressDisplay = ko.computed(function() {
        return this.progress() + "%";
    }, this)

    this.barWidth = ko.computed(function() {
        return "width:" + this.progress() + "%";
    }, this)
}

var App = new AppViewModel();
// Activates knockout.js
ko.applyBindings(App);



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

// Arrival Rate Gauges
    $(".gauge").dxCircularGauge({
        scale: {
            startValue: 0,
            endValue: 10,
            majorTick: {
                showCalculatedTicks: false,
                customTickValues: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
            },
            label : {
                font :{
                    size:11
                }
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

function roundTo2Decimals(numberToRound) {
    return Math.round(numberToRound * 100) / 100
}