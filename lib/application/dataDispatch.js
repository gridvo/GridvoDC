'use strict';
var async = require('async');
var _ = require('underscore');
var util = require('util');
var EventEmitter = require('events');
var appEvent = require('./appEvent');
var appError = require('./appError');
var DataTransform = require('./dataTransform');
var DispatchCenter = require('../domain/dispatchCenter');
var DataStation = require('../domain/dataStation');
var StationRTData = require('../domain/stationRTData');

function DataDispatch() {
    EventEmitter.call(this);
    this.__dispatchCenter__ = new DispatchCenter();
    this.__stationRepository__ = null;
    this.__dataRepository__ = null;
};

util.inherits(DataDispatch, EventEmitter);

DataDispatch.prototype.launch = function (callback) {
    var dD = this;
    async.waterfall([function (cb) {
        dD.__stationRepository__.getAllStation(cb);
    }], function (err, dataStations) {
        if (err) {
            callback(err, null);
            return;
        }
        if (dataStations.length == 0) {
            callback(null);
            return;
        }
        for (let dataStation of dataStations) {
            dD.__dispatchCenter__.addStationRTData(dataStation);
        }
        var currentDate = new Date();
        var rTdataFuns = [];
        for (let stationRTDataKeys of _.keys(dD.__dispatchCenter__.stationRTDatas)) {
            for (let rTDataKey of _.keys(dD.__dispatchCenter__.stationRTDatas[stationRTDataKeys].rTDatas)) {
                rTdataFuns.push(function (cb) {
                    var sectionOptions = {
                        stationName: stationRTDataKeys,
                        dataName: rTDataKey,
                        startD: currentDate.setTime(-(dD.__dispatchCenter__.stationRTDatas[stationRTDataKeys].rTDatas[rTDataKey].timeLong)),
                        endD: currentDate
                    };
                    dD.__dataRepository__.getDataSection(sectionOptions, cb);
                });
            }
        }
        async.parallel(rTdataFuns,
            function (err, results) {
                if (err) {
                    callback(err, null);
                    return;
                }
                for (let dataSection of results) {
                    dD.__dispatchCenter__.loadRTDatas(dataSection);
                }
                callback(null);
            });
    });
};

DataDispatch.prototype.setStationRTData = function (stationRTDataConfig, callback) {
    var dD = this;
    var stationName = stationRTDataConfig.stationName;
    var setStationRTData = function (stationRTDataConfig, scb) {
        async.waterfall([function (cb) {
            dD.__stationRepository__.updateStationRTData(stationRTDataConfig, cb);
        }], function (err, dataStation) {
            if (err) {
                scb(err, null);
                return;
            }
            if (_.isNull(dataStation)) {
                scb(null, null);
                return;
            }
            dD.__dispatchCenter__.setStationRTData(stationRTDataConfig);
            var currentDate = new Date();
            var rTdataFuns = [];
            for (let rTDataKey of _.keys(stationRTDataConfig.rTDataConfigs)) {
                rTdataFuns.push(function (cb) {
                    var sectionOptions = {
                        stationName: stationName,
                        dataName: rTDataKey,
                        startD: currentDate.setTime(-(dD.__dispatchCenter__.stationRTDatas[stationName].rTDatas[rTDataKey].timeLong)),
                        endD: currentDate
                    };
                    dD.__dataRepository__.getDataSection(sectionOptions, cb);
                });
            }
            async.parallel(rTdataFuns,
                function (err, results) {
                    if (err) {
                        scb(err, null);
                        return;
                    }
                    for (let dataSection of results) {
                        if (dataSection.datas.length > 0) {
                            dD.__dispatchCenter__.loadRTDatas(dataSection);
                        }
                    }
                    scb(null, stationRTDataConfig);
                });
        });
    };
    if (!_.has(dD.__dispatchCenter__.stationRTDatas, stationName)) {
        async.waterfall([function (cb) {
            dD.__stationRepository__.isStationExist(stationName, cb);
        }, function (isStationExist, cb) {
            if (isStationExist) {
                setStationRTData(stationRTDataConfig, callback);
                return;
            }
            dD.__stationRepository__.saveStation(stationName, cb);
        }], function (err) {
            if (err) {
                callback(err, null);
                return;
            }
            var stationData = {};
            stationData.stationName = stationName;
            var dataStation = new DataStation(stationData);
            dD.__dispatchCenter__.addStationRTData(new StationRTData(dataStation));
            let appEventData = {};
            appEventData.stationName = stationName;
            dD.emit(appEvent.application.NEW_STATION_ADDED, appEventData);
            setStationRTData(stationRTDataConfig, callback);
        });
    }
    else {
        setStationRTData(stationRTDataConfig, callback);
    }
};

DataDispatch.prototype.receiveData = function (oData) {
    var dataPoint = DataTransform.convertToDataPoint(oData);
    var dD = this;
    var stationName = oData.stationName;
    var saveDataPoint = function (dataPoint) {
        dD.__dataRepository__.saveDataPoint(dataPoint, function (err, dataPoint) {
            if (err) {
                return;
            }
            if (dD.__dispatchCenter__.isHaveRTData({
                    stationName: dataPoint.stationName,
                    dataName: dataPoint.dataName
                })) {
                dD.__dispatchCenter__.addRTData(dataPoint);
                var rTDataOptions = {};
                rTDataOptions.stationName = dataPoint.stationName;
                rTDataOptions.dataName = dataPoint.dataName;
                if (dD.__dispatchCenter__.isCanPubRTDatas(rTDataOptions)) {
                    var pubRTDataOptions = {};
                    pubRTDataOptions.stationName = dataPoint.stationName;
                    pubRTDataOptions.dataName = dataPoint.dataName;
                    let eventData = dD.__dispatchCenter__.pubRTDatas(pubRTDataOptions);
                    dD.emit(appEvent.domain.RTDATAS_PUB, eventData);
                }
            }
            let appEventData = {};
            appEventData.stationName = dataPoint.stationName;
            appEventData.dataName = dataPoint.dataName;
            appEventData.timestamp = dataPoint.timestamp;
            appEventData.value = dataPoint.value;
            dD.emit(appEvent.application.DATA_POINT_SAVE_SUCCESS, appEventData);
        })
    };
    if (!_.has(this.__dispatchCenter__.stationRTDatas, stationName)) {
        async.waterfall([function (cb) {
            dD.__stationRepository__.isStationExist(stationName, cb);
        }, function (isStationExist, cb) {
            if (isStationExist) {
                saveDataPoint(dataPoint);
                return;
            }
            dD.__stationRepository__.saveStation(stationName, cb);
        }], function (err, stationName) {
            if (err) {
                return;
            }
            if (!stationName) {
                return;
            }
            var stationData = {};
            stationData.stationName = stationName;
            stationData.rTDataConfigs = {};
            var dataStation = new DataStation(stationData);
            dD.__dispatchCenter__.addStationRTData(new StationRTData(dataStation));
            let appEventData = {};
            appEventData.stationName = stationName;
            dD.emit(appEvent.application.NEW_STATION_ADDED, appEventData);
            saveDataPoint(dataPoint);
        });
    }
    else {
        saveDataPoint(dataPoint);
    }
};

DataDispatch.prototype.getRTData = function (rTDataOptions, callback) {
    var dD = this;
    if (!dD.__dispatchCenter__.isHaveRTData(rTDataOptions)) {
        callback(null, null);
        return;
    }
    var rTData = dD.__dispatchCenter__.getRTDatas(rTDataOptions);
    callback(null, rTData);
};

DataDispatch.prototype.getDatas = function (dataOptions, callback) {
    var dD = this;
    var startD = new Date(dataOptions.startD);
    var endD = new Date(dataOptions.endD);
    async.waterfall([function (cb) {
        var sectionOptions = {
            stationName: dataOptions.stationName,
            dataName: dataOptions.dataName,
            startD: startD,
            endD: endD
        };
        dD.__dataRepository__.getDataSection(sectionOptions, cb);
    }], function (err, dataSection) {
        if (err) {
            callback(err, null);
            return;
        }
        let cBData = {};
        cBData.startD = startD;
        cBData.endD = endD;
        cBData.datas = dataSection.datas;
        callback(null, cBData);
    });
};

module.exports = DataDispatch;
