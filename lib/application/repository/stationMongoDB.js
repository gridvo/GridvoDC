'use strict';
var MongoClient = require('mongodb').MongoClient;
var async = require('async');
var _ = require('underscore');
var DataStation = require('../../domain/dataStation');

function StationRepository() {
    this.dBUrl = '';
};

StationRepository.prototype.getAllOpenRTDataStation = function (callback) {
    var sr = this;
    var mongoDB;
    async.waterfall([function (cb) {
        MongoClient.connect(sr.dBUrl, cb);
    }, function (db, cb) {
        mongoDB = db;
        var cursor = db.collection('station').find();
        cursor.toArray(cb);
    }], function (err, documents) {
        if (err) {
            callback(err, null);
            mongoDB.close();
            return;
        }
        let dataStations = [];
        for (let document of documents) {
            let dataStation = new DataStation(document);
            dataStations.push(dataStation);
        }
        callback(null, dataStations);
        mongoDB.close();
    });
};

StationRepository.prototype.saveStation = function (stationName, callback) {
    var sr = this;
    var mongoDB;
    async.waterfall([function (cb) {
        MongoClient.connect(sr.dBUrl, cb);
    }, function (db, cb) {
        mongoDB = db;
        db.collection('station').updateOne({"stationName": stationName},
            {$set: {stationName: stationName}},
            {upsert: true},
            cb);
    }], function (err, result) {
        if (err) {
            callback(err, null);
            mongoDB.close();
            return;
        }
        if (result.result.n == 1) {
            callback(null, stationName);
        }
        else {
            callback(null, "");
        }
        mongoDB.close();
    });
};

StationRepository.prototype.updateStationRTData = function (stationRTDataConfig, callback) {
    var sr = this;
    var mongoDB;
    async.waterfall([function (cb) {
        MongoClient.connect(sr.dBUrl, cb);
    }, function (db, cb) {
        mongoDB = db;
        var updateOperations = {};
        for (let dataName of _.keys(stationRTDataConfig.rTDataConfigs)) {
            updateOperations[`rTDataConfigs.${dataName}`] = stationRTDataConfig.rTDataConfigs[dataName];
        }
        db.collection('station').findOneAndUpdate({"stationName": stationRTDataConfig.stationName},
            {$set: updateOperations},
            {
                returnOriginal: false
            },
            cb);
    }], function (err, result) {
        if (err) {
            callback(err, null);
            mongoDB.close();
            return;
        }
        if (result.value) {
            callback(null, new DataStation(result.value));
        }
        else {
            callback(null, null);
        }
        mongoDB.close();
    });
};

StationRepository.prototype.updateStationDataVisualization = function (stationDVConfig, callback) {
    var sr = this;
    var mongoDB;
    async.waterfall([function (cb) {
        MongoClient.connect(sr.dBUrl, cb);
    }, function (db, cb) {
        mongoDB = db;
        var updateOperations = {};
        for (let dataName of _.keys(stationDVConfig.dVConfigs)) {
            updateOperations[`dVConfigs.${dataName}`] = stationDVConfig.dVConfigs[dataName];
        }
        db.collection('station').findOneAndUpdate({"stationName": stationDVConfig.stationName},
            {$set: updateOperations},
            {
                returnOriginal: false
            },
            cb);
    }], function (err, result) {
        if (err) {
            callback(err, null);
            mongoDB.close();
            return;
        }
        if (result.value) {
            callback(null, new DataStation(result.value));
        }
        else {
            callback(null, null);
        }
        mongoDB.close();
    });
};

StationRepository.prototype.getStationRDConfig = function (stationName, callback) {
    var sr = this;
    var mongoDB;
    async.waterfall([function (cb) {
        MongoClient.connect(sr.dBUrl, cb);
    }, function (db, cb) {
        mongoDB = db;
        var cursor = db.collection('station').find({"stationName": stationName});
        cursor.limit(1).next(cb);
    }], function (err, document) {
        if (err) {
            callback(err, null);
            mongoDB.close();
            return;
        }
        if (_.isNull(document) || _.isUndefined(document.rTDataConfigs)) {
            callback(null, null);
            mongoDB.close();
            return;
        }
        callback(null, document.rTDataConfigs);
        mongoDB.close();
    });
};

StationRepository.prototype.getStationDVConfig = function (stationName, callback) {
    var sr = this;
    var mongoDB;
    async.waterfall([function (cb) {
        MongoClient.connect(sr.dBUrl, cb);
    }, function (db, cb) {
        mongoDB = db;
        var cursor = db.collection('station').find({"stationName": stationName});
        cursor.limit(1).next(cb);
    }], function (err, document) {
        if (err) {
            callback(err, null);
            mongoDB.close();
            return;
        }
        if (_.isNull(document) || _.isUndefined(document.dVConfigs)) {
            callback(null, null);
            mongoDB.close();
            return;
        }
        callback(null, document.dVConfigs);
        mongoDB.close();
    });
};

module.exports = StationRepository;
