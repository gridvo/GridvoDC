'use strict';
var _ = require('underscore');

function StationRTData(dataStation) {
    this.stationName = dataStation.stationName;
    this.rTDatas = {};
    if (dataStation.rTDataConfigs) {
        for (let dataName of _.keys(dataStation.rTDataConfigs)) {
            if (!_.isUndefined(dataStation.rTDataConfigs[dataName].openRDM) && dataStation.rTDataConfigs[dataName].openRDM) {
                let rTdataConfig = dataStation.rTDataConfigs[dataName];
                let rTData = this.rTDatas[dataName] = {};
                rTData.dataName = rTdataConfig.dataName;
                rTData.timeSpace = rTdataConfig.timeSpace ? rTdataConfig.timeSpace : 1000 * 60;
                rTData.timeLong = rTdataConfig.timeLong ? rTdataConfig.timeLong : 1000 * 60 * 60 * 4;
                rTData.pubDataSpace = rTdataConfig.pubDataSpace ? rTdataConfig.pubDataSpace : 1000 * 60;
                rTData.lastPubDataTimestamp = null;
                rTData.isPubAllRTData = _.isUndefined(rTdataConfig.isPubAllRTData) ? false : rTdataConfig.isPubAllRTData;
                rTData.datas = [];
                rTData.lastDataTimestamp = null;
            }
        }
    }
};

StationRTData.prototype.configRTDatas = function (rTDataConfigs) {
    if (rTDataConfigs) {
        for (let dataName of _.keys(rTDataConfigs)) {
            if (!_.isUndefined(rTDataConfigs[dataName].openRDM) && rTDataConfigs[dataName].openRDM) {
                let rTdataConfig = rTDataConfigs[dataName];
                let rTData;
                if (_.has(this.rTDatas, dataName)) {
                    rTData = this.rTDatas[dataName];
                }
                else {
                    rTData = this.rTDatas[dataName] = {};
                }
                rTData.dataName = rTdataConfig.dataName ? rTdataConfig.dataName : rTData.dataName;
                rTData.timeSpace = rTdataConfig.timeSpace ? rTdataConfig.timeSpace : rTData.timeSpace;
                rTData.timeLong = rTdataConfig.timeLong ? rTdataConfig.timeLong : rTData.timeLong;
                rTData.pubDataSpace = rTdataConfig.pubDataSpace ? rTdataConfig.pubDataSpace : rTData.pubDataSpace;
                rTData.lastPubDataTimestamp = null;
                rTData.isPubAllRTData = _.isUndefined(rTdataConfig.isPubAllRTData) ? rTData.isPubAllRTData : rTdataConfig.isPubAllRTData;
                rTData.datas = [];
                rTData.lastDataTimestamp = null;
            }
            else {
                if (_.has(this.rTDatas, dataName)) {
                    delete this.rTDatas[dataName];
                }
            }
        }
    }
};

StationRTData.prototype.loadRTDatas = function (dataName, datas) {
    for (let data of datas) {
        this.addRTData(dataName, data);
    }
    this.rTDatas[dataName].lastPubDataTimestamp = this.rTDatas[dataName].lastDataTimestamp;
};

StationRTData.prototype.addRTData = function (dataName, data) {
    var datasLength = this.rTDatas[dataName].timeLong / this.rTDatas[dataName].timeSpace;
    if (_.isNull(this.rTDatas[dataName].lastDataTimestamp) && this.rTDatas[dataName].datas.length == 0) {
        this.rTDatas[dataName].datas.push(data);
        this.rTDatas[dataName].lastDataTimestamp = data.timestamp;
        return;
    }
    if (data.timestamp > this.rTDatas[dataName].lastDataTimestamp) {
        var spaceDataCount = ((data.timestamp.getTime() - this.rTDatas[dataName].lastDataTimestamp.getTime()) / this.rTDatas[dataName].timeSpace) - 1;
        var pushDatas = [];
        for (let n = 0; n < spaceDataCount; n++) {
            pushDatas.push(null);
        }
        pushDatas.push(data);
        var stationRTData = this;
        var pushData = function (data) {
            if (stationRTData.rTDatas[dataName].datas.length < datasLength) {
                stationRTData.rTDatas[dataName].datas.push(data);
            } else {
                stationRTData.rTDatas[dataName].datas.shift();
                stationRTData.rTDatas[dataName].datas.push(data);
            }
        }
        for (let data of pushDatas) {
            pushData(data);
        }
        this.rTDatas[dataName].lastDataTimestamp = data.timestamp;
    }
    else {
        var firstMS = this.rTDatas[dataName].lastDataTimestamp.getTime() - ((this.rTDatas[dataName].datas.length - 1) * this.rTDatas[dataName].timeSpace);
        var dataIndex = (data.timestamp.getTime() - firstMS) / this.rTDatas[dataName].timeSpace;
        this.rTDatas[dataName].datas[dataIndex] = data;
    }
};

module.exports = StationRTData;