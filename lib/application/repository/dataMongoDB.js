'use strict';
var MongoClient = require('mongodb').MongoClient;
var async = require('async');
var _ = require('underscore');
var DataSection = require('../../domain/dataSection');

function DataRepository() {
    this.dBUrl = '';
};

DataRepository.prototype.saveDataPoint = function (dataPoint, callback) {
    var dr = this;
    var mongoDB, currentYear, currentMonth, currentDate, currentHours, currentMinutes, currentTime;
    async.waterfall([function (cb) {
        MongoClient.connect(dr.dBUrl, cb);
    }, function (db, cb) {
        mongoDB = db;
        currentYear = dataPoint.timestamp.getFullYear();
        currentMonth = dataPoint.timestamp.getMonth();
        currentDate = dataPoint.timestamp.getDate();
        currentHours = dataPoint.timestamp.getHours();
        currentMinutes = dataPoint.timestamp.getMinutes();
        currentTime = new Date(`${currentYear}-${currentMonth + 1}-${currentDate} ${currentHours}:00:00`);
        let updateOperations = {};
        updateOperations[`DS.${currentMinutes}`] = {
            "TS": dataPoint.timestamp,
            "V": dataPoint.value
        };
        mongoDB.collection(dataPoint.stationName).createIndex(
            {
                "DN": 1,
                "DT": 1
            }
        );
        mongoDB.collection(dataPoint.stationName).updateOne({
                "DN": dataPoint.dataName,
                "DT": currentTime
            },
            {
                $set: updateOperations
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
        if (result.result.n == 0) {
            callback(new Error("no data point updated"), null);
            mongoDB.close();
            return;
        }
        callback(null, dataPoint);
        mongoDB.close();
    });
};

DataRepository.prototype.getDataSection = function (sectionOptions, callback) {
    var dr = this;
    var mongoDB;
    async.waterfall([function (cb) {
        MongoClient.connect(dr.dBUrl, cb);
    }, function (db, cb) {
        mongoDB = db;
        var hourS = new Date(`${sectionOptions.startD.getFullYear()}-${sectionOptions.startD.getMonth() + 1}-${sectionOptions.startD.getDate()} ${sectionOptions.startD.getHours()}:00:00`);
        var hourE = new Date(`${sectionOptions.endD.getFullYear()}-${sectionOptions.endD.getMonth() + 1}-${sectionOptions.endD.getDate()} ${sectionOptions.endD.getHours()}:00:00`);
        mongoDB.collection(sectionOptions.stationName).aggregate([
                {
                    $match: {
                        DN: sectionOptions.dataName,
                        DT: {$gte: hourS, $lte: hourE}
                    }
                }, {
                    $project: {
                        "DS": 1,
                        "_id": 0
                    }
                }],
            cb);
    }], function (err, result) {
        if (err) {
            callback(err, null);
            mongoDB.close();
            return;
        }
        var dataSection = new DataSection({
            stationName: sectionOptions.stationName,
            dataName: sectionOptions.dataName,
            startD: sectionOptions.startD,
            endD: sectionOptions.endD
        });
        for (var dayD of result) {
            for (var key of _.keys(dayD.DS)) {
                if (dayD.DS[key].TS >= sectionOptions.startD && dayD.DS[key].TS <= sectionOptions.endD) {
                    dataSection.datas.push(dayD.DS[key]);
                }
            }
        }
        callback(null, dataSection);
        mongoDB.close();
    });
};

DataRepository.prototype.getStationDataNames = function (stationName, callback) {
    var dr = this;
    var mongoDB;
    async.waterfall([function (cb) {
        MongoClient.connect(dr.dBUrl, cb);
    }, function (db, cb) {
        mongoDB = db;
        mongoDB.command({
            "distinct": stationName,
            "key": "DN"
        }, cb);
    }], function (err, result) {
        if (err) {
            callback(err, null);
            mongoDB.close();
            return;
        }
        callback(null, result.values);
        mongoDB.close();
    });
};

module.exports = DataRepository;
