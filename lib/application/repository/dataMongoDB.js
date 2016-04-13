'use strict';
var MongoClient = require('mongodb').MongoClient;
var async = require('async');
var _ = require('underscore');

function DataRepository() {
    this.dBUrl = '';
};

DataRepository.prototype.saveDataPoint = function (dataPoint, callback) {
    var sr = this;
    var mongoDB;
    async.waterfall([function (cb) {
        MongoClient.connect(sr.dBUrl, cb);
    }, function (db, cb) {
        mongoDB = db;
        var currentYear = dataPoint.timestamp.getFullYear();
        var currentMonth = dataPoint.timestamp.getMonth();
        var currentDate = dataPoint.timestamp.getDate();
        var currentDay = new Date(`${currentYear}-${currentMonth + 1}-${currentDate} 00:00:00`);
        var updateOperations = {};
        updateOperations[`datas.${dataPoint.dataName}`] = {
            "timestamp": dataPoint.timestamp,
            "value": dataPoint.value
        };
        db.collection(dataPoint.stationName).createIndex(
            {"date": 1}
        );
        db.collection(dataPoint.stationName).updateOne({"date": currentDay},
            {
                $push: updateOperations
            },
            {
                upsert: true

            },
            cb);
    }], function (err, result) {
        if (err) {
            callback(err, null);
            mongoDB.close();
            return;
        }
        callback(null, dataPoint);
        mongoDB.close();
    });
};

module.exports = DataRepository;
