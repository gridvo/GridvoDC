'use strict';
var _ = require('underscore');
var StationRTData = require('./stationRTData');

function RTDataMasterCenter() {
    this.stationRTDatas = {};
};

RTDataMasterCenter.prototype.addStationRTData = function (dataStation) {
    this.stationRTDatas[dataStation.stationName] = new StationRTData(dataStation);
};

RTDataMasterCenter.prototype.setStationRTData = function (stationRTDataConfig) {
    this.stationRTDatas[stationRTDataConfig.stationName].againConfigRTDatas(stationRTDataConfig.rTDataConfigs);
};

RTDataMasterCenter.prototype.loadRTDatas = function (dataSection) {
    this.stationRTDatas[dataSection.stationName].loadRTDatas(dataSection.dataName, dataSection.datas);
};

RTDataMasterCenter.prototype.isHaveRTData = function (stationName, dataName) {
    if (_.isUndefined(this.stationRTDatas[stationName]) || _.isUndefined(this.stationRTDatas[stationName].rTDatas[dataName])) {
        return false;
    }
    return true;
};

RTDataMasterCenter.prototype.addRTData = function (dataPoint) {
    var data = {
        timestamp: dataPoint.timestamp,
        value: dataPoint.value
    };
    this.stationRTDatas[dataPoint.stationName].addRTData(dataPoint.dataName, data);
};

RTDataMasterCenter.prototype.isCanPubRTDatas = function (stationName, dataName) {
    var rTdata = this.stationRTDatas[stationName].rTDatas[dataName];
    if (_.isNull(rTdata.lastPubDataTimestamp)) {
        return false;
    }
    if (((rTdata.lastDataTimestamp.getTime() - rTdata.lastPubDataTimestamp.getTime()) / rTdata.pubDataSpace) >= 1) {
        return true;
    }
    return false;
};

RTDataMasterCenter.prototype.pubRTDatas = function (stationName, dataName) {
    var rTdata = this.stationRTDatas[stationName].rTDatas[dataName];
    var pubRTData = {};
    pubRTData.stationName = stationName;
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

RTDataMasterCenter.prototype.getRTDatas = function (stationName, dataName) {
    var rTdata = this.stationRTDatas[stationName].rTDatas[dataName];
    var rTData = {};
    rTData.stationName = stationName;
    rTData.dataName = dataName;
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

module.exports = RTDataMasterCenter;