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
            rTData.timeSpace = rTdataConfig.timeSpace ? rTdataConfig.timeSpace : 1000 * 60;
            rTData.timeLong = rTdataConfig.timeLong ? rTdataConfig.timeLong : 1000 * 60 * 60 * 4;
            rTData.pubDataSpace = rTdataConfig.pubDataSpace ? rTdataConfig.pubDataSpace : 1000 * 60;
            rTData.lastPubDataTimestamp = null;
            rTData.isPubAllRTData = _.isUndefined(rTdataConfig.isPubAllRTData) ? false : rTdataConfig.isPubAllRTData;
            rTData.datas = [];
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
            rTData.dataName = rTdataConfig.dataName ? rTdataConfig.dataName : rTData.dataName;
            rTData.timeSpace = rTdataConfig.timeSpace ? rTdataConfig.timeSpace : rTData.timeSpace;
            rTData.timeLong = rTdataConfig.timeLong ? rTdataConfig.timeLong : rTData.timeLong;
            rTData.pubDataSpace = rTdataConfig.pubDataSpace ? rTdataConfig.pubDataSpace : rTData.pubDataSpace;
            rTData.lastPubDataTimestamp = null;
            rTData.isPubAllRTData = _.isUndefined(rTdataConfig.isPubAllRTData) ? rTData.isPubAllRTData : rTdataConfig.isPubAllRTData;
            rTData.datas = [];
            rTData.lastDataTimestamp = null;
        }
    }
};

StationRTData.prototype.loadRTDatas = function (dataName, datas) {
    for (let data of datas) {
        this.addRTData(dataName, data);
    }
    var datasLength = this.rTDatas[dataName].timeLong / this.rTDatas[dataName].timeSpace;
    if (this.rTDatas[dataName].datas.length == datasLength) {
        this.rTDatas[dataName].lastPubDataTimestamp = this.rTDatas[dataName].lastDataTimestamp;
    }
};

StationRTData.prototype.addRTData = function (dataName, data) {
    var datasLength = this.rTDatas[dataName].timeLong / this.rTDatas[dataName].timeSpace;
    if (_.isNull(this.rTDatas[dataName].lastDataTimestamp) && this.rTDatas[dataName].datas.length == 0) {
        this.rTDatas[dataName].datas.push(data);
        this.rTDatas[dataName].lastDataTimestamp = data.timestamp;
        if (this.rTDatas[dataName].datas.length == datasLength) {
            this.rTDatas[dataName].lastPubDataTimestamp = data.timestamp;
        }
        return;
    }
    if (data.timestamp > this.rTDatas[dataName].lastDataTimestamp) {
        var spaceDataCount = ((data.timestamp.getTime() - this.rTDatas[dataName].lastDataTimestamp.getTime()) / this.rTDatas[dataName].timeSpace) - 1;
        if (this.rTDatas[dataName].datas.length < datasLength) {
            for (let n = 0; n < spaceDataCount; n++) {
                if (this.rTDatas[dataName].datas.length < datasLength) {
                    this.rTDatas[dataName].datas.push(null);
                }
                else {
                    this.rTDatas[dataName].datas.shift();
                    this.rTDatas[dataName].datas.push(null);
                }
            }
            if (this.rTDatas[dataName].datas.length < datasLength) {
                this.rTDatas[dataName].datas.push(data);
            }
            else {
                this.rTDatas[dataName].datas.shift();
                this.rTDatas[dataName].datas.push(data);
            }
            if (this.rTDatas[dataName].datas.length == datasLength) {
                this.rTDatas[dataName].lastPubDataTimestamp = data.timestamp;
            }
        }
        else {
            for (let n = 0; n < spaceDataCount; n++) {
                this.rTDatas[dataName].datas.shift();
                this.rTDatas[dataName].datas.push(null);
            }
            this.rTDatas[dataName].datas.shift();
            this.rTDatas[dataName].datas.push(data);
        }
        this.rTDatas[dataName].lastDataTimestamp = data.timestamp;
    }
    else {
        var dataIndex = (data.timestamp.getTime() - this.rTDatas[dataName].datas[0].timestamp.getTime()) / this.rTDatas[dataName].timeSpace;
        this.rTDatas[dataName].datas[dataIndex] = data;
    }
};

module.exports = StationRTData;