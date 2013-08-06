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
    serverAddress : "10.5.62.10",
    mac : "03:00:00:00:00:00",
    be164 : 3021080000,
    e164 : 4021080000,
    action: 'logon',
    users: 100,
    targetRate: 1 //(users/sec)
};

var simStats = {};
var simActualConfig = {};
var simStatus = {
    status : "unknown"
};

var actualArrivalRate;
var actualFinishRate;
var currentDuration;

// When the connection is open, send some data to the server
connection.onopen = function () {
    connection.send('{"action" : "ping"}'); // Send the message 'Ping' to the server


    /// Update DOM on every message from the ws ////
    App.targetArrivalRate(simConfig.targetRate);
    App.targetUsers(simConfig.users);
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
        $('#results').removeAttr('disabled');
        $('#results').show();

    } else if (simStatus.status === "stopped") {
        $('#stop').attr('disabled', 'disabled');
        $('#saveBt').attr('disabled', 'disabled');
        $('#start').attr('disabled', 'disabled');
        $('#results').attr('disabled', 'disabled');
        $('#results').hide();
    } else if( simStatus.status === "ready") {
        $('#stop').attr('disabled', 'disabled');
        $('#start').removeAttr('disabled');
        $('#saveBt').removeAttr('disabled');
        $('#results').hide();
    } else {
        $('#stop').removeAttr('disabled');
        $('#saveBt').attr('disabled', 'disabled');
        $('#start').attr('disabled', 'disabled');
  //      $('#results').attr('disabled', 'disabled');
//        $('#results').hide()
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


        /// edge cases:
        /// 1. none or only one has yet started
        actualArrivalRate = 0;
        actualFinishRate = 0;
        currentDuration = 0;

        /// 1. none or only one has yet finished
        if (simStats.finished <=1) {
            actualArrivalRate = simStats.started * 1000 / (simStats.lastStarted - simStats.firstStarted);
        }
        else if ((simStats.started > 1) && (simStats.finished > 1)) {
            actualArrivalRate = simStats.started * 1000 / (simStats.lastStarted - simStats.firstStarted);
            actualFinishRate = simStats.finished * 1000 / (simStats.lastFinished - simStats.firstFinished);

            if (simStatus.status === "finished") {
                currentDuration = (simStats.lastFinished - simStats.startTime)/1000;
            } else {
                currentDuration = (simStats.now - simStats.startTime)/1000;

            }
        }

        /// Update DOM on every message from the ws ////
        App.targetArrivalRate(simConfig.targetRate);
        App.targetUsers(simConfig.users);

        var displayStartTime = moment(simStats.startTime).startOf('hour').fromNow();
        App.startTime(displayStartTime);
        App.endTime(simStats.endTime);

        /// Update DOM on every message from the ws ////
        App.actualArrivalRate(roundTo2Decimals(actualArrivalRate));
        App.actualFinishRate(roundTo2Decimals(actualFinishRate));
        App.currentDuration(currentDuration);
        //

        App.finishedUsers(simStats.finished);
        App.overloadedUsers(simStats.overloaded);
        App.startedUsers(simStats.started);
        App.failedUsers(simStats.failed);

        // Update Queue Chart
        var tmpQueueChartData = { time: (simStats.now - simStats.startTime)/1000,
                     queue : simStats.started - simStats.finished};

        var tmpRateChartData = { time: (simStats.now - simStats.startTime)/1000,
            started: simStats.started,
            finished: simStats.finished};

        var tmpCountChartData = [];
        var tmpHistoChartData = []
        if (simActualConfig.mac){
            var index = macToInt(simActualConfig.mac);
        }
        for (var i=0; i<simActualConfig.users; i++){
            var sent = 0;
            var finished = 0;
            var duration = 0;
            if (simStats.devices[decToMac(index)]) {
                sent = simStats.devices[decToMac(index)].count.sent;
                finished = simStats.devices[decToMac(index)].count.finished;
                duration = roundTo2Decimals(simStats.devices[decToMac(index)].count.duration/1000);
            }
            //tmpCountChartData[i] = { id: i, count: simStats.devices[i].count.sent, completed: simStats.devices[i].count.finished}
            tmpHistoChartData[i] = { id: i, time: duration}
            tmpCountChartData[i] = { id: i, sent: sent, completed: finished}
            index++;
        }

        App.queueChartData.push(tmpQueueChartData);
        App.rateChartData.push(tmpRateChartData);
        App.countChartData(tmpCountChartData);
        App.histoChartData(tmpHistoChartData);
    }
}


///////////////  Simulator GUI Model ///////////////

function AppViewModel() {
    this.targetArrivalRate = ko.observable(simConfig.targetRate);
    this.actualArrivalRate = ko.observable(0);
    this.actualFinishRate = ko.observable(0);
    this.targetUsers = ko.observable(simConfig.users);
    this.startedUsers = ko.observable(0);
    this.currentDuration = ko.observable(0);
    this.finishedUsers = ko.observable(0);
    this.overloadedUsers = ko.observable(0);
    this.failedUsers = ko.observable(0);
    this.startTime = ko.observable(0);
    this.endTime = ko.observable(new Date());
    this.progressGreen = ko.computed(function(){
        return "width:" + roundTo2Decimals(-15+this.finishedUsers()*100/this.targetUsers()) +'%;';
    },this);
    this.progressRed = ko.computed(function(){
        return "width:" + roundTo2Decimals(15+this.failedUsers()*100/this.targetUsers()) +'%;';
    },this);

 ;
    this.queueChartData = ko.observableArray();
    this.rateChartData = ko.observableArray();
    this.countChartData = ko.observableArray();
    this.histoChartData = ko.observableArray();

    this.config = {
            serverAddress : ko.protectedObservable(simConfig.serverAddress),
            mac : ko.protectedObservable(simConfig.mac),
            be164 : ko.protectedObservable(simConfig.be164),
            e164 : ko.protectedObservable(simConfig.e164),
            action: ko.protectedObservable(simConfig.action),
            users: ko.protectedObservable(simConfig.users),
            targetRate: ko.protectedObservable(simConfig.targetRate) //(users/sec)
        };
    this.deviceStats = ko.observableArray(simStats.devices);

    this.saveConfig = function() {
        for (var key in this.config) {
            this.config[key].commit();
            this.targetArrivalRate(this.config['targetRate']());
            this.targetUsers(this.config['users']());
            simConfig[key] = this.config[key]();
        }
    };
    this.cancelConfig = function(){
        for (var key in this.config) {
            this.config[key].reset();
            simConfig[key] = this.config[key]();
        }
    };
    this.arrivalVsCompletion = ko.computed(function(){
        var result;
        if (this.actualFinishRate() == 0) {
            result = "N/A";
        } else {
            result =roundTo2Decimals(this.actualArrivalRate()/this.actualFinishRate());
        }
        return result;
    }, this);
    this.queue = ko.computed(function(){
        return this.startedUsers() - this.finishedUsers();
    }, this);

    this.progressDisplay = ko.computed(function() {
        return roundTo2Decimals((100*(this.finishedUsers()+this.failedUsers()))/this.targetUsers()) + "%";
    }, this);

    this.queueValueAxis = ko.computed(function(){
        var axis = {
            axisDivisionFactor : 20,
            //max : (this.targetUsers() + 0.2*this.targetUsers()),
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
           // max : (this.targetUsers() + 0.2*this.targetUsers()),
            min: 0,
            title : {
                 text : "Number of Requests"
            },
            font : {
                size: 11
            }
        }
        return axis;

    },this);

    this.argAxis = ko.computed(function(){
      var axis = {
          hoverMode: 'allArgumentPoints',
          axisDivisionFactor : 20,
        //  max : this.targetUsers() / this.targetArrivalRate() + 60,
          //max : simConfig.users / simConfig.targetRate + 60,
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
    $("#start").click(function () {
        //drawQueueChart();
        //drawRateChart();
        var message = {};
        message.action = "start";
        message.config = simConfig;
        // clean up charts
        App.queueChartData.removeAll();
        App.rateChartData.removeAll();
        App.countChartData.removeAll();
        App.histoChartData.removeAll();

        var tmpQueueChartData = { time: 0, queue : 0};

        var tmpRateChartData = { time: 0, started: 0, finished: 0};
        App.queueChartData.push(tmpQueueChartData);
        App.rateChartData.push(tmpRateChartData);


        connection.send(JSON.stringify(message));
        console.log("Sent to server:",message);
        $('#start').attr('disabled', 'disabled');
        progress = 0;

    });
    $("#stop").click(function () {
        var message = {};
        message.action = "stop";

        connection.send(JSON.stringify(message));
        console.log("Sent to server",message);
        $('#stop').attr('disabled', 'disabled');

    });


    drawRateChart();
    drawQueueChart();
    drawHistoChart();
    drawCountChart();
});

function roundTo2Decimals(numberToRound) {
    return Math.round(numberToRound * 100) / 100
}


function drawCountChart(){
    $("#countChart").dxChart({
        dataSource: [{ id: 0, sent: 0, completed: 0}],
        adjustOnZoom: false,
        animation :{
            enabled: false
        },
        argumentAxis : {
            hoverMode: 'allArgumentPoints',
            axisDivisionFactor : 20,
            title : {
                text : "Devices"
            },
            font : {
                size: 11
            }
        },
        valueAxis : {
            axisDivisionFactor : 20,
            max: 7,
            min: 0,
            title : {
                text : "requests sent/finished"
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
            argumentField: 'id',
            line: {
                hoverStyle: {
                    width: 3
                }
            },
            hoverMode: 'allArgumentPoints',
            point: {
                size: 1,
                hoverStyle: {
                    width: 2
                }
            },
            type: "steparea",
            steparea: {
                border: {
                    visible: true
                }
            }
        },
        series: [{name: '',valueField: 'sent', color: 'red'},
                 {name: '', valueField: 'completed', color: 'green'}],
        legend: {visible: false}
    });
}

function drawHistoChart(){
    $("#histoChart").dxChart({
        dataSource: [{ id: 0, duration: 0}],
        adjustOnZoom: true,
        animation :{
            enabled: false
        },
        argumentAxis : {
            hoverMode: 'allArgumentPoints',
            axisDivisionFactor : 20,
            title : {
                text : "Devices"
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
                text : "time(sec)"
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
            argumentField: 'id',
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
            },
            type: "bar",
            color: 'blue',
            border: {width: 1, color: 'red', visible: true}
        },
        series: [{
            name: '',
            valueField: 'time'
        }],
        legend: {visible: false}
    });
}

function drawQueueChart(){
    $("#queueChart").dxChart({
        dataSource: [{ time: 0, started: 0, finished: 0}],
        adjustOnZoom: true,
        animation :{
            enabled: false
        },
        argumentAxis : {
            hoverMode: 'allArgumentPoints',
            axisDivisionFactor : 20,
            title : {
                text : "Time (sec)"
            },
            font : {
                size: 11
            }
        },
        valueAxis : {
            axisDivisionFactor : 20,
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
            },
            type: "area",
            area: {
                border: {
                    visible: true
                }
            }
        },
        series: [{
            name: 'Queue Size',
            valueField: 'queue'
        }],
        legend: { visible: false}
    });
}

function drawRateChart(){
    $("#ratesChart").dxChart({
        dataSource: [{ time: 0, started: 0, finished: 0}],
        adjustOnZoom: true,
        animation :{
            enabled: false
        },
        argumentAxis : {
            axisDivisionFactor : 20,
           // max : simConfig.users / simConfig.targetRate + 60,
            min : 0,
            title : {
                text : "Time (sec)"
            }
        },
        valueAxis : {
            axisDivisionFactor : 20,
           // max : simConfig.users + 0.2*simConfig.users,
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
            valueField: 'started',
            color: 'red'
        }, {
            name: 'Requests Completed',
            valueField: 'finished',
            color: 'orange'
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

function macToInt (mac) {
    return parseInt(parseInt(mac.replace(/:/g,"")),16)
}

function isEven(value){
    if (value%2 == 0)
        return true;
    else
        return false;
}

function decToMac(d){
    var mac="";
    var hex = Number(d).toString(16);
    if (!isEven(hex.length))
        hex = "0" + hex;
    hex = hex.toUpperCase();
    for (var i=0;i<hex.length;i+=2){
        if (i+2 < hex.length)
            mac += hex.substring(i,i+2) + ":";
        else
            mac += hex.substring(i,i+2)
    }
    return mac;
}
