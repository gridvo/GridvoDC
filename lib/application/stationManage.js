'use strict';
var _ = require('underscore');
var util = require('util');
var EventEmitter = require('events');

function stationManage() {
    EventEmitter.call(this);
    this.__stationRepository__ = null;
};

util.inherits(stationManage, EventEmitter);

stationManage.prototype.getStationDVConfig = function (stationName, callback) {
    if (!stationName) {
        callback(null, null);
    } else {
        this.__stationRepository__.getStationDVConfig(stationName, function (err, dVConfigs) {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, dVConfigs);
        });
    }
};

stationManage.prototype.getStationRDConfig = function (stationName, callback) {
    if (!stationName) {
        callback(null, null);
    } else {
        this.__stationRepository__.getStationRDConfig(stationName, function (err, rDConfigs) {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, rDConfigs);
        });
    }
};

stationManage.prototype.setStationDVConfig = function (stationDVConfig, callback) {
    if (!stationDVConfig.stationName) {
        callback(null, false);
    } else {
        this.__stationRepository__.updateStationDVConfig(stationDVConfig, function (err, dataStation) {
            if (err) {
                callback(err, false);
                return;
            }
            callback(null, !_.isNull(dataStation));
        });
    }
};

stationManage.prototype.setStationRDConfig = function (stationRDConfig, callback) {
    if (!stationRDConfig.stationName) {
        callback(null, false);
    } else {
        this.__stationRepository__.updateStationRDConfig(stationRDConfig, function (err, dataStation) {
            if (err) {
                callback(err, false);
                return;
            }
            callback(null, !_.isNull(dataStation));
        });
    }
};

module.exports = stationManage;