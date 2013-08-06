'use strict';

var stats = {
    devices : {},
    started : 0,
    finished : 0,
    failed: 0,
    overloaded: 0,
    lastStarted : 0,
    lastFinished : 0,
    firstStarted : 0,
    firstFinished : 0
};

function updateOnFinish(status) {

    /// Duraton
    if ((stats.lastFinished === 0) || (stats.firstStarted === 0)) {
        stats.duration = 0;
    } else if (status === 'finished') {
        stats.duration = stats.lastFinished - stats.firstStarted;
    } else {
        var now = new Date();
        stats.duration = now - stats.firstStarted;
    }
    stats.actualArrivalRate = stats.started / ((stats.lastStarted - stats.firstStarted) / 1000);
    stats.actualFinishRate = stats.finished / ((stats.lastFinished - stats.firstFinished) / 1000);
    stats.success = 100 * stats.finished / stats.started;
    stats.min = getMin(stats.devices);
    stats.max = getMax(stats.devices);
    stats.mean = getMean (stats.devices);
    stats.variance = getVariance (stats.devices, stats.mean);
   // stats.histogram = getHistogram (stats.devices);
}

function reset() {
    stats.devices = {};
    stats.started = 0;
    stats.finished = 0;
    stats.overloaded = 0;
    stats.failed = 0;
    stats.lastStarted = 0;
    stats.lastFinished = 0;
    stats.firstStarted = 0;
    stats.firstFinished = 0;
    stats.actualArrivalRate = 0;
    stats.actualFinishRate = 0;
    stats.success = 0;
    stats.min = 0;
    stats.max = 0;
    stats.mean = 0;
    stats.variance = 0;
    stats.histogram = [];
}

function roundTo2Decimals(numberToRound) {
    return Math.round(numberToRound * 100) / 100
}

module.exports.init = stats;
module.exports.reset = reset;
module.exports.updateOnFinish = updateOnFinish;


function getMin(devices) {
    var min = 500000000;
    var mac;

    for (mac in devices) {
        if (devices.hasOwnProperty(mac)) {
            if (devices[mac].progress === "finished") {
                if (devices[mac].duration < min) {
                   min =  devices[mac].count.duration;
                }
            }
        }
    }
    return min;
}

function getMax(devices) {
    var max = 0;
    var mac;

    for (mac in devices) {
        if (devices.hasOwnProperty(mac)) {
            if (devices[mac].progress === "finished") {
                if (devices[mac].duration > max) {
                    max =  devices[mac].count.duration;
                }
            }
        }
    }
    return max;

}

function getMean(devices) {
    var total = 0;
    var mac;
    var finished = 0;

    for (mac in devices) {
        if (devices.hasOwnProperty(mac)) {
            if (devices[mac].progress === "finished") {
                total += devices[mac].count.duration;
                finished++;
            }
        }
    }
    return total/finished;
}

function getVariance (devices, mean) {
    var total = 0;
    var mac;
    var finished = 0;

    for (mac in devices) {
        if (devices.hasOwnProperty(mac)) {
            if (devices[mac].progress === "finished") {
                total += Math.pow((devices[mac].count.duration-mean),2);
                finished++;
            }
        }
    }

    return Math.sqrt(total/finished);
}

function getHistogram(devices){
    var histo = [];

    var mac;
    var finished = 0;

    for (mac in devices) {
        if (devices.hasOwnProperty(mac)) {
            if (devices[mac].progress === "finished") {
                histo.push(devices[mac].count.duration);
            } else {
                histo.push(0);
            }
        }
    }
    return histo;
}