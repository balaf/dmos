
var stats = {
    devices : {},
    started : 0,
    finished : 0,
    minDuration : 0,
    maxDuration : 5000000000,
    meanDuration : 0,
    lastStarted : 0,
    lastFinished : 0,
    firstStarted : 0,
    firstFinished : 0,
    print : printResults,
    setMeanDuration : setMean,
    setMinDuration : setMin,
    setMaxDuration : setMax

};

function printResults(targetArrivalRate, targetUsers){
    console.log('---- End of Simulation -----');
    console.log('Duration: %dsec = %dmin = %dhr:', getDurationSec(stats),getDurationMin(stats),getDurationHr(stats));
    console.log('Target Arrival Rate (req/sec):', targetArrivalRate);
    console.log('Achieved Arrival Rate (req/sec):', getArrivalRate(stats));
    console.log('Target logged-on users:', targetUsers);
    console.log('Started:', stats.started);
    console.log('Finished:', stats.finished);
}

function getDurationSec(stats){
    var now = new Date();
    var duration = (stats.lastFinished- stats.firstStarted)/1000;
    return roundTo2Decimals(duration)
}

function getDurationMin(stats){
    var now = new Date();
    var duration = (now- stats.firstStarted)/1000/60;
    return roundTo2Decimals(duration)
}

function getDurationHr(stats){
    var now = new Date();
    var duration = (now- stats.firstStarted)/1000/60/60;
    return roundTo2Decimals(duration)
}

function getArrivalRate(stats){
    return  (stats.lastStarted - stats.firstStarted)/stats.started/1000;
}

function setMin(time){
}
function setMax(time){
}
function setMean(time){
}


function roundTo2Decimals(numberToRound) {
    return Math.round(numberToRound * 100) / 100
}

module.exports = stats;

