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
    describe('#getAllOpenRTDataStation(cb)', function () {
        context('get all have open the rt data station', function () {
            it('should return [] if no station have rTDataConfigs', function (done) {
                MongoClient.connect("mongodb://localhost:27017/TestGDataCenter", function (err, db) {
                    if (err) {
                        return;
                    }
                    db.collection('station').deleteMany({}, function (err, results) {
                        if (err) {
                            db.close();
                            return;
                        }
                        Repository.getAllOpenRTDataStation(function (err, stations) {
                            stations.should.be.eql([]);
                            db.close();
                            done();
                        });
                    });
                });
            });
            it('should return all stations in mongodb', function (done) {
                Repository.saveStation("station1", function (err, stationName) {
                    Repository.getAllOpenRTDataStation(function (err, stations) {
                        stations.length.should.be.eql(1);
                        stations[0].stationName.should.be.eql("station1");
                        done();
                    });
                });
            });
        });
    });
    describe('#getOpenRTDataStationForNames(stationNames, cb)', function () {
        context('get have open the rt data station for station names', function () {
            it('should return [] if no station in this names', function (done) {
                Repository.getOpenRTDataStationForNames(["noName"], function (err, stations) {
                    stations.should.be.eql([]);
                    done();
                });
            });
            it('should return station if station in this names', function (done) {
                Repository.getOpenRTDataStationForNames(["station1"], function (err, stations) {
                    stations.length.should.be.eql(1);
                    stations[0].stationName.should.be.eql("station1");
                    done();
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
    describe('#updateStationDataVisualization(stationDVConfig, cb)', function () {
        context('update station data visualization config', function () {
            it('should return null if no station in datacenter', function (done) {
                var stationDVConfig = {
                    stationName: "noStation",
                    dVConfigs: {
                        rain: {
                            visualName: "雨量",
                            maxV: 3000,
                            minV: 2900
                        }
                    }
                };
                Repository.updateStationDataVisualization(stationDVConfig, function (err, station) {
                    _.isNull(station).should.be.eql(true);
                    done();
                });
            });
            it('should return station if update success', function (done) {
                var stationDVConfig = {
                    stationName: "station1",
                    dVConfigs: {
                        rain: {
                            visualName: "雨量",
                            maxV: 3000,
                            minV: 2900
                        }
                    }
                };
                Repository.updateStationDataVisualization(stationDVConfig, function (err, station) {
                    station.stationName.should.be.eql("station1");
                    station.dVConfigs.rain.visualName.should.be.eql("雨量");
                    done();
                });
            });
        });
    });
    describe('#getStationRDConfig(stationName, cb)', function () {
        context('get station rt data config', function () {
            it('should return null if no station in datacenter', function (done) {
                Repository.getStationRDConfig("noStation", function (err, rDConfigs) {
                    _.isNull(rDConfigs).should.be.eql(true);
                    done();
                });
            });
            it('should return rt data config if station in datacenter', function (done) {
                Repository.getStationRDConfig("station1", function (err, rDConfigs) {
                    rDConfigs.rain.timeSpace.should.be.eql(2000);
                    rDConfigs.rain.timeLong.should.be.eql(1000 * 60 * 60 * 4);
                    done();
                });
            });
        });
    });
    describe('#getStationDVConfig(stationName, cb)', function () {
        context('get station data visualization config', function () {
            it('should return null if no station in datacenter', function (done) {
                Repository.getStationDVConfig("noStation", function (err, dVConfigs) {
                    _.isNull(dVConfigs).should.be.eql(true);
                    done();
                });
            });
            it('should return station data visualization config if station in datacenter', function (done) {
                Repository.getStationDVConfig("station1", function (err, dVConfigs) {
                    dVConfigs.rain.visualName.should.be.eql("雨量");
                    dVConfigs.rain.maxV.should.be.eql(3000);
                    dVConfigs.rain.minV.should.be.eql(2900);
                    done();
                });
            });
        });
    });
    after(function (done) {
        MongoClient.connect("mongodb://localhost:27017/TestGDataCenter", function (err, db) {
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

