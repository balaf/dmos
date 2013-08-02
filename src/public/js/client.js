var url = "ws://"+window.location.host;
var connection = new WebSocket(url);

/// knockout ehnacement
//wrapper to an observable that requires accept/cancel
ko.protectedObservable = function(initialValue) {
    //private variables
    var _tempValue = initialValue;
    var _actualValue = ko.observable(initialValue);

    var result = ko.computed({
       read: _actualValue,
       write: function(newValue) {
          _tempValue = newValue;
        }
    });

    result.commit = function() {
        if (_tempValue !== _actualValue()) {
            _actualValue(_tempValue);
        }
    };

    result.reset = function() {
        _actualValue.valueHasMutated();
        _tempValue = _actualValue();   //reset temp value
    };

    return result;
};

var simConfig = {
    serverAddress : "10.0.201.250",
    mac : "03:00:00:00:00:00",
    be164 : 30210800000,
    e164 : 4021080000,
    action: 'startup',
    users: 1,
    targetRate: 1 //(users/sec)
};

//setInterval(function(){ console.log(simConfig.users)},2000);

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
    connection.send('{"action" : "ping"}'); // Send the message 'Ping' to the server
    App.targetArrivalRate(simConfig.targetRate);
};


// Log errors
connection.onerror = function (error) {
    console.log('WebSocket Error ' + error);
};

// Log messages from the server
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
                progress = (simStats.finished / simActualConfig.users) * 100;
            }
        }

        /// Update DOM on every message from the ws ////
        App.targetArrivalRate(simConfig.targetRate);
        App.targetUsers(simConfig.users);

        /// Update DOM on every message from the ws ////
        App.actualArrivalRate(roundTo2Decimals(actualArrivalRate));
        App.actualFinishRate(roundTo2Decimals(actualFinishRate));
        App.estimatedDuration(estimatedDuration);
        App.currentDuration(currentDuration);
        App.progress(progress);
        App.finishedUsers(simStats.finished);
        App.startedUsers(simStats.started);

        // Update Queue Chart
        var tmpQueueChartData = { time: (simStats.now - simStats.startTime)/1000,
                     queue : simStats.started - simStats.finished};

        var tmpRateChartData = { time: (simStats.now - simStats.startTime)/1000,
            started: simStats.started,
            finished: simStats.finished};
        App.queueChartData.push(tmpQueueChartData);
        App.rateChartData.push(tmpRateChartData);

     /*   console.log("actualArrivalRate:", actualArrivalRate);
        console.log("actualFinishRate:", actualFinishRate);
        console.log("estimatedDuration:", estimatedDuration);
        console.log("currentDuration:", currentDuration);
        console.log("progress: %s %", progress);*/
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
    this.targetUsers = ko.observable(simConfig.users);
    this.startedUsers = ko.observable(0);
    this.finishedUsers = ko.observable(0);
    this.currentDuration = ko.observable(0);
    this.progress = ko.observable(0);
    this.estimatedDuration = ko.observable(0);
    this.queueChartData = ko.observableArray();
    this.rateChartData = ko.observableArray();
    this.config = ko.observable(simConfig);
    this.saveConfig = function() {
      //  this.config.commit();
        //simConfig = this.config();
        console.log('simConfig.user',simConfig.users)
    };
    this.cancelConfig = function(){
      //  this.config.reset();
    };



    this.arrivalVsCompletion = ko.computed(function(){
        return roundTo2Decimals(this.actualArrivalRate()/this.actualFinishRate()) || 0;
    }, this);
    this.queue = ko.computed(function(){
        return this.startedUsers() - this.finishedUsers();
    }, this);
    this.needleTarget = ko.computed(function(){
        return [{ value: this.targetArrivalRate()}];
    }, this);

    this.markerTarget = ko.computed(function(){
        return [{ value: this.targetArrivalRate()}];
    }, this);

    this.needleActual = ko.computed(function(){
        return [{ value: this.actualArrivalRate()}];
    }, this);

    this.markerActual = ko.computed(function(){
        return [{ value: this.actualArrivalRate()}];
    }, this);

    this.needleFinished = ko.computed(function(){
        return [{ value: this.actualFinishRate()}];
    }, this);

    this.markerFinished = ko.computed(function(){
        return [{ value: this.actualFinishRate()}];
    }, this);

    this.progressDisplay = ko.computed(function() {
        return roundTo2Decimals(this.progress()) + "%";
    }, this);

    this.barWidth = ko.computed(function() {
        return "width:" + this.progress() + "%";
    }, this);

    this.queueValueAxis = ko.computed(function(){
        var axis = {
            axisDivisionFactor : 20,
            //max : (this.targetUsers() + 0.1*this.targetUsers())*0.8,
            min: 0,
            title : {
                text : "Queue Size (#req)"
            },
            font : {
                size: 11
            }
        }
        return axis;
    },this);

    this.rateValueAxis = ko.computed(function(){
        var axis = {
            axisDivisionFactor : 20,
               // max :  this.targetUsers() + 0.2*this.targetUsers(),
            min: 0,
            title : {
                 text : "Number of Requests"
            },
            font : {
                size: 11
            }
        }
        console.log("target users:", this.targetUsers()) ;
        console.log('Config:',simConfig);
        console.log('ActualConfig:',simActualConfig);
        console.log('Axis',axis.max);
        return axis;

    },this);

    this.argAxis = ko.computed(function(){
      var axis = {
          hoverMode: 'allArgumentPoints',
          axisDivisionFactor : 20,
          max : this.targetUsers() / this.targetArrivalRate() + 60,
          min: 0,
          title : {
              text : "Time (sec)"
          },
          font : {
              size: 11
          }
      }
      return axis;
    },this);
}


var App = new AppViewModel();
// Activates knockout.js
ko.applyBindings(App);

$(document).ready(function () {
    /*$("#saveBt").click(function(){
        simConfig.serverAddress = $("#serverAddress").val();
        simConfig.mac = $("#mac").val()
        simConfig.e164 = $("#e164").val();
        simConfig.be164 = $("#be164").val();
        simConfig.action = $("#action").val();
        simConfig.users = $("#users").val();
        simConfig.targetRate = $("#targetRate").val();
        // The new configuration will be send to the server when the simulation starts
    });*/

   /* $("#cancelBt").click(function(){
        //console.log(simConfig);
        //App.config(simConfig);
    });*/

    $("#start").click(function () {
        //drawQueueChart();
        //drawRateChart();
        var message = {};
        message.action = "start";
        message.config = simConfig;
        // clean up charts
        App.queueChartData.removeAll();
        App.rateChartData.removeAll();

        connection.send(JSON.stringify(message));
        $('#start').attr('disabled', 'disabled');

    });
    $("#stop").click(function () {
        var message = {};
        message.action = "stop";

        connection.send(JSON.stringify(message));
        $('#stop').attr('disabled', 'disabled');

    });


    drawGauges();
    drawRateChart();
    drawQueueChart();
});

function roundTo2Decimals(numberToRound) {
    return Math.round(numberToRound * 100) / 100
}

function drawGauges(){
    $(".gauge").dxCircularGauge({
        commonNeedleSettings: {
            offset: 0,
            type: "triangle"
        },
        commonRangeBarSettings: {
            size: 50,
            offset:1,
            text: {
                font: {
                    size: 6
                }
            }
        },
        scale: {
            label: {
                indentFromTick : 2,
                font: {
                    color: "#442211",
                    size: 6
                }
            },
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
                color: 'lightgreen'
            }, {
                startValue: 2.2,
                endValue: 5,
                color: 'yellow'
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
        markers: [{ value: simStats.targetArrivalRate }],
        needles: [{ value: simStats.targetArrivalRate }]
    });
}


function drawQueueChart(){
    $("#queueChart").dxChart({
        dataSource: [],
        adjustOnZoom: true,
        animation :{
            enabled: false
        },
        argumentAxis : {
            hoverMode: 'allArgumentPoints',
            axisDivisionFactor : 20,
            max : simConfig.users / simConfig.targetRate + 60,
            min: 0,
            title : {
                text : "Time (sec)"
            },
            font : {
                size: 11
            }
        },
        valueAxis : {
            axisDivisionFactor : 20,
            //max : (simConfig.users + 0.1*simConfig.users)*0.2,
            min: 0,
            title : {
                text : "Queue Size (#req)"
            },
            font : {
                size: 11
            }
        },
        commonAxisSettings: {
            visible: true,
            color: 'black',
            width: 2,
            grid: {visible:true}
        },
        commonSeriesSettings: {
            border:{
                visible: true
            },
            argumentField: 'time',
            line: {
                hoverStyle: {
                    width: 3
                }
            },
            hoverMode: 'allArgumentPoints',
            point: {
                size: 2,
                hoverStyle: {
                    width: 2
                }
            }
        },
        series: [{
            name: 'Queue Size',
            valueField: 'queue'
        }],
        legend: {
            font : {
                size: 11
            },
            paddingLeftRight: 2,
            paddingTopBottom: 2,
            markerSize: 10,
            verticalAlignment: 'bottom',
            horizontalAlignment: 'right',
            position: 'inside'
        }
    });
}

function drawRateChart(){
    $("#ratesChart").dxChart({
        dataSource: [],
        adjustOnZoom: false,
        animation :{
            enabled: false
        },
        argumentAxis : {
            axisDivisionFactor : 20,
            max : simConfig.users / simConfig.targetRate + 60,
            min : 0,
            title : {
                text : "Time (sec)"
            }
        },
        valueAxis : {
            axisDivisionFactor : 20,
            max : simConfig.users + 0.2*simConfig.users,
            min : 0,
            title : {
                text : "Number of Requests"
            }
        },
        commonAxisSettings: {
            visible: true,
            color: 'black',
            width: 2,
            grid: {visible:true}
        },
        commonSeriesSettings: {
            border:{
                visible: true
            },
            argumentField: 'time',
            line: {
                hoverStyle: {
                    width: 3
                }
            },
            hoverMode: 'includePoints',
            point: {
                size: 2,
                hoverStyle: {
                    width: 2
                }
            }
        },
        series: [{
            name: 'Requests Started',
            valueField: 'started'
        }, {
            name: 'Requests Completed',
            valueField: 'finished'
        }],
        legend: {
            font : {
                size: 11
            },
            paddingLeftRight: 2,
            paddingTopBottom: 2,
            markerSize: 10,
            verticalAlignment: 'bottom',
            horizontalAlignment: 'right',
            position: 'inside',
            rowCount: 2,
            rowItemSpacing: 5
        }
    });
}
