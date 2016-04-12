'use strict';
var MongoClient = require('mongodb').MongoClient;
var async = require('async');
var DataStation = require('../../domain/dataStation');

function StationRepository() {
    this.dBUrl = '';
};

StationRepository.prototype.getAllStation = function (callback) {
    var sr = this;
    async.waterfall([function (cb) {
        MongoClient.connect(sr.dBUrl, cb)
    },], function (err, db) {
        if (err) {
            callback(err, null);
            return;
        }
        var cursor = db.collection('station').find();
        var dataStations = [];
        cursor.each(function (err, doc) {
            if (err) {
                callback(err, null);
                db.close();
                return;
            }
            var dataStation = new DataStation(doc);
            dataStations.push(dataStation);
        });
        callback(null, dataStations);
        db.close();
    });
};

StationRepository.prototype.saveStation = function (stationName, cb) {
    cb(null);
};

StationRepository.prototype.isStationExist = function (stationName, cb) {

};

StationRepository.prototype.updateStation = function (stationRTDataConfig, cb) {

};

module.exports = StationRepository;
