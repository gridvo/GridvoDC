'use strict';
var async = require('async');
var MongoClient = require('mongodb').MongoClient;
var bearcat = require('bearcat');
var _ = require('underscore');
var should = require('should');

describe('Station repository MongoDB use case test', function () {
    var Repository;
    before(function () {
        var contextPath = require.resolve('../../testbcontext.json');
        bearcat.createApp([contextPath]);
        bearcat.start(function () {
            Repository = bearcat.getBean('stationRepository');
        });
    });
    describe('#saveStation(stationName, cb)', function () {
        context('save a station', function () {
            it('should return station name if save success', function (done) {
                Repository.saveStation("station1", function (err, stationName) {
                    stationName.should.be.eql("station1");
                    done();
                });
            });
        });
    });
    describe('#getAllStation(cb)', function () {
        context('when data dispatch launch', function () {
            it('should return [] if no station in mongodb', function (done) {
                MongoClient.connect("mongodb://localhost:27017/GDataCenter", function (err, db) {
                    if (err) {
                        return;
                    }
                    db.collection('station').deleteMany({}, function (err, results) {
                        if (err) {
                            db.close();
                            return;
                        }
                        Repository.getAllStation(function (err, stations) {
                            stations.should.be.eql([]);
                            db.close();
                            done();
                        });
                    });
                });
            });
            it('should return all stations in mongodb', function (done) {
                Repository.saveStation("station1", function (err, stationName) {
                    Repository.getAllStation(function (err, stations) {
                        stations.length.should.be.eql(1);
                        stations[0].stationName.should.be.eql("station1");
                        done();
                    });
                });
            });
        });
    });
    describe('#updateStationRTData(stationRTDataConfig, cb)', function () {
        context('update station RT data config', function () {
            it('should return null if no station in datacenter', function (done) {
                var stationRTDataConfig = {
                    stationName: "noStation",
                    rTDataConfigs: {
                        rain: {
                            dataName: "rain",
                            timeSpace: 1000,
                            timeLong: 1000 * 60 * 60 * 4
                        }
                    }
                };
                Repository.updateStationRTData(stationRTDataConfig, function (err, station) {
                    _.isNull(station).should.be.eql(true);
                    done();
                });
            });
            it('should return station if update success', function (done) {
                var stationRTDataConfig = {
                    stationName: "station1",
                    rTDataConfigs: {
                        rain: {
                            dataName: "rain",
                            timeSpace: 1000,
                            timeLong: 1000 * 60 * 60 * 4
                        }
                    }
                };
                Repository.updateStationRTData(stationRTDataConfig, function (err, station) {
                    station.stationName.should.be.eql("station1");
                    station.rTDataConfigs.rain.timeSpace.should.be.eql(1000);
                    done();
                });
            });
            it('should return station ,it will have new config,if that init is no', function (done) {
                var stationRTDataConfig = {
                    stationName: "station1",
                    rTDataConfigs: {
                        rain: {
                            dataName: "rain",
                            timeSpace: 2000,
                            timeLong: 1000 * 60 * 60 * 4
                        },
                        meter: {
                            dataName: "meter",
                            timeSpace: 1000,
                            timeLong: 1000 * 60 * 60 * 4
                        }
                    }
                };
                Repository.updateStationRTData(stationRTDataConfig, function (err, station) {
                    station.stationName.should.be.eql("station1");
                    station.rTDataConfigs.rain.timeSpace.should.be.eql(2000);
                    station.rTDataConfigs.meter.timeSpace.should.be.eql(1000);
                    done();
                });
            });
        });
    });
    after(function (done) {
        MongoClient.connect("mongodb://localhost:27017/GDataCenter", function (err, db) {
            if (err) {
                return;
            }
            db.collection('station').deleteMany({}, function (err, results) {
                if (err) {
                    db.close();
                    return;
                }
                db.close();
                done();
            });
        });
    });
});

