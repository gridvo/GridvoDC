'use strict';
var _ = require('underscore');

function StationRTData(dataStation) {
    this.stationName = dataStation.stationName;
    this.rTDatas = {};
    if (dataStation.rTDataConfigs) {
        for (let rTdataConfigKey of _.keys(dataStation.rTDataConfigs)) {
            let rTdataConfig = dataStation.rTDataConfigs[rTdataConfigKey];
            let rTData = this.rTDatas[rTdataConfigKey] = {};
            rTData.dataName = rTdataConfig.dataName;
            rTData.timeSpace = rTdataConfig.timeSpace;
            rTData.timeLong = rTdataConfig.timeLong;
            rTData.dataSection = [];
            rTData.lastDataTimestamp = null;
        }
    }
};

StationRTData.prototype.againConfigRTDatas = function (rTDataConfigs) {
    if (rTDataConfigs) {
        for (let rTdataConfigKey of _.keys(rTDataConfigs)) {
            let rTdataConfig = rTDataConfigs[rTdataConfigKey];
            let rTData;
            if (_.has(this.rTDatas, rTdataConfigKey)) {
                rTData = this.rTDatas[rTdataConfigKey];
            }
            else {
                rTData = this.rTDatas[rTdataConfigKey] = {};
            }
            rTData.dataName = rTdataConfig.dataName;
            rTData.timeSpace = rTdataConfig.timeSpace;
            rTData.timeLong = rTdataConfig.timeLong;
            rTData.dataSection = [];
            rTData.lastDataTimestamp = null;
        }
    }
};

StationRTData.prototype.loadRTDatas = function (dataSection) {
    var dataName = dataSection.dataName;
    if (!this.rTDatas[dataName]) {
        return;
    }
};

StationRTData.prototype.addRTData = function (dataPoint) {
    var dataName = dataPoint.dataName;
    if (!this.rTDatas[dataName]) {
        return;
    }
    var data = {
        timestamp: dataPoint.timestamp,
        value: dataPoint.value
    };
    if (dataPoint.timestamp > this.rTDatas[dataName].lastDataTimestamp) {
        var dataSectionLength = this.rTDatas[dataName].timeLong / this.rTDatas[dataName].timeSpace;
        if (this.rTDatas[dataName].dataSection.length >= dataSectionLength) {
            this.rTDatas[dataName].dataSection.splice(0, 1, data);
        }
        else {
            this.rTDatas[dataName].dataSection.push(data);
        }
        this.rTDatas[dataName].lastDataTimestamp = dataPoint.timestamp;
    }
};

module.exports = StationRTData;