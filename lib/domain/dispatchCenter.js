'use strict';
var _ = require('underscore');
var StationRTData = require('./stationRTData');

function DispatchCenter() {
    this.stationRTDatas = {};
};

DispatchCenter.prototype.addStationRTData = function (dataStation) {
    this.stationRTDatas[dataStation.stationName] = new StationRTData(dataStation);
};

DispatchCenter.prototype.setStationRTData = function (stationRTDataConfig) {
    this.stationRTDatas[stationRTDataConfig.stationName].configRTDatas(stationRTDataConfig.rTDataConfigs);
};

DispatchCenter.prototype.loadRTDatas = function (dataSection) {
    this.stationRTDatas[dataSection.stationName].loadRTDatas(dataSection.dataName, dataSection.datas);
};

DispatchCenter.prototype.isHaveRTData = function (rTDataOptions) {
    if (_.isUndefined(this.stationRTDatas[rTDataOptions.stationName]) || _.isUndefined(this.stationRTDatas[rTDataOptions.stationName].rTDatas[rTDataOptions.dataName])) {
        return false;
    }
    return true;
};

DispatchCenter.prototype.addRTData = function (dataPoint) {
    var data = {
        timestamp: dataPoint.timestamp,
        value: dataPoint.value
    };
    this.stationRTDatas[dataPoint.stationName].addRTData(dataPoint.dataName, data);
};

DispatchCenter.prototype.isCanPubRTDatas = function (rTDataOptions) {
    var rTdata = this.stationRTDatas[rTDataOptions.stationName].rTDatas[rTDataOptions.dataName];
    if (_.isNull(rTdata.lastPubDataTimestamp)) {
        return false;
    }
    if (((rTdata.lastDataTimestamp.getTime() - rTdata.lastPubDataTimestamp.getTime()) / rTdata.pubDataSpace) >= 1) {
        return true;
    }
    return false;
};

DispatchCenter.prototype.pubRTDatas = function (pubRTDataOptions) {
    var rTdata = this.stationRTDatas[pubRTDataOptions.stationName].rTDatas[pubRTDataOptions.dataName];
    var pubRTData = {};
    pubRTData.stationName = pubRTDataOptions.stationName;
    pubRTData.dataName = rTdata.dataName;
    pubRTData.timeSpace = rTdata.timeSpace;
    pubRTData.datas = [];
    if (rTdata.isPubAllRTData) {
        for (let data of rTdata.datas) {
            if (!_.isNull(data)) {
                pubRTData.datas.push(data);
            }
        }
        pubRTData.timeLong = rTdata.timeLong;
    } else {
        pubRTData.timeLong = rTdata.pubDataSpace;
        var pubCount = (rTdata.lastDataTimestamp.getTime() - rTdata.lastPubDataTimestamp.getTime()) / rTdata.timeSpace;
        var startIndex = rTdata.datas.length - pubCount;
        for (let data of rTdata.datas.slice(startIndex)) {
            if (!_.isNull(data)) {
                pubRTData.datas.push(data);
            }
        }
    }
    rTdata.lastPubDataTimestamp = rTdata.lastDataTimestamp;
    return pubRTData;
};

DispatchCenter.prototype.getRTDatas = function (rTDataOptions) {
    var rTdata = this.stationRTDatas[rTDataOptions.stationName].rTDatas[rTDataOptions.dataName];
    var rTData = {};
    rTData.stationName = rTDataOptions.stationName;
    rTData.dataName = rTDataOptions.dataName;
    rTData.timeSpace = rTdata.timeSpace;
    rTData.timeLong = rTdata.timeLong;
    rTData.datas = [];
    for (let data of rTdata.datas) {
        if (!_.isNull(data)) {
            rTData.datas.push(data);
        }
    }
    return rTData;
};

module.exports = DispatchCenter;