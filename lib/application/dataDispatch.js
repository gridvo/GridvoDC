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

DataDispatch.prototype.launch = function (cb) {
    var dD = this;
    async.waterfall([function (acb) {
        dD.__stationRepository__.getAllStation(acb);
    }], function (err, dataStations) {
        if (err) {
            cb(err, null);
            return;
        }
        if (dataStations) {
            for (let dataStation of dataStations) {
                let stationRTData = new StationRTData(dataStation);
                dD.__dispatchCenter__.addStationRTData(stationRTData);
            }
        }
        cb(null);
    });
};

DataDispatch.prototype.setStationRTData = function (stationRTDataConfig, cb) {
    var dD = this;
    var stationName = stationRTDataConfig.stationName;
    var setStationRTData = function (stationRTDataConfig, cb) {
        async.waterfall([function (acb) {
            dD.__stationRepository__.updateStation(stationRTDataConfig, acb);
        }], function (err, dataStation) {
            if (err) {
                cb(err, null);
                return;
            }
            dD.__dispatchCenter__.stationRTDatas[stationRTDataConfig.stationName].againConfigRTDatas(stationRTDataConfig.rTDataConfigs);
            cb(null, dataStation);
        });
    };
    if (!_.has(dD.__dispatchCenter__.stationRTDatas, stationName)) {
        async.waterfall([function (acb) {
            dD.__stationRepository__.isStationExist(stationName, acb);
        }, function (isStationExist, acb) {
            if (isStationExist) {
                setStationRTData(stationRTDataConfig, cb);
                return;
            }
            dD.__stationRepository__.saveStation(stationName, acb);
        }], function (err) {
            if (err) {
                return;
            }
            var stationData = {};
            stationData.stationName = stationName;
            var dataStation = new DataStation(stationData);
            dD.__dispatchCenter__.addStationRTData(new StationRTData(dataStation));
            let appEventData = {};
            appEventData.stationName = stationName;
            dD.emit(appEvent.application.NEW_STATION_ADDED, appEventData);
            setStationRTData(stationRTDataConfig, cb);
        });
    }
    else {
        setStationRTData(stationRTDataConfig, cb);
    }
};

DataDispatch.prototype.receiveData = function (oData) {
    var dataPoint = DataTransform.convertToDataPoint(oData);
    var dD = this;
    var stationName = oData.stationName;
    var saveDataPoint = function (dataPoint) {
        dD.__dataRepository__.saveDataPoint(dataPoint, function (err) {
            if (err) {
                return;
            }
            dD.__dispatchCenter__.receiveData(dataPoint);
            let appEventData = {};
            appEventData.stationName = dataPoint.stationName;
            appEventData.timestamp = dataPoint.timestamp;
            appEventData.dataName = dataPoint.dataName;
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
        }], function (err) {
            if (err) {
                return;
            }
            var stationData = {};
            stationData.stationName = stationName;
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

module.exports = DataDispatch;
