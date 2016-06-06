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
    this.__dataRepository__ = null;
};

util.inherits(DataDispatch, EventEmitter);

DataDispatch.prototype.receiveData = function (oData) {
    var dataPoint = DataTransform.convertToDataPoint(oData);
    var dD = this;
    dD.__dataRepository__.saveDataPoint(dataPoint, function (err, dataPoint) {
        if (err) {
            return;
        }
        let appEventData = {};
        appEventData.stationName = dataPoint.stationName;
        appEventData.dataName = dataPoint.dataName;
        appEventData.timestamp = dataPoint.timestamp;
        appEventData.value = dataPoint.value;
        dD.emit(appEvent.application.DATA_POINT_SAVE_SUCCESS, appEventData);
    })
};

DataDispatch.prototype.extractDatas = function (dataOptions, callback) {
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
