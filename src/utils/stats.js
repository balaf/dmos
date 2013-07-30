'use strict';

var stats = {
    devices : [],
    started : 0,
    finished : 0,
    minDuration : 0,
    maxDuration : 5000000000,
    meanDuration : 0,
    lastStarted : 1,
    lastFinished : 0,
    firstStarted : 0,
    firstFinished : 0
};

function updateOnFinish(targetArrivalRate, targetUsers, status){

    /// Duraiton
    if ((stats.lastFinished === 0) || (stats.firstStarted === 0)) {
        stats.duration = 0;
    } else if (status === 'finished') {
        stats.duration = stats.lastFinished - stats.firstStarted;
    } else {
        var now = new Date();
        stats.duration = now - stats.firstStarted;
    }
}

function reset(){
    stats.devices = [];
    stats.started = 0;
    stats.finished = 0;
    stats.minDuration = 0;
    stats.maxDuration = 5000000000;
    stats.meanDuration = 0;
    stats.lastStarted = 1;
    stats.lastFinished = 0;
    stats.firstStarted = 0;
    stats.firstFinished = 0;
}

function roundTo2Decimals(numberToRound) {
    return Math.round(numberToRound * 100) / 100
}

module.exports.init = stats;
module.exports.reset = reset;
module.exports.update = updateOnFinish;

