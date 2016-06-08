'use strict';
var _ = require('underscore');
var bearcat = require('bearcat');
var should = require('should');

describe('stationManage use case test', function () {
    var stationManage;
    before(function () {
        var contextPath = require.resolve('../../testbcontext.json');
        bearcat.createApp([contextPath]);
        bearcat.start(function () {
            stationManage = bearcat.getBean('stationManage');
        });
    });
    describe('#getStationRDConfig(stationName, cb)', function () {
        context('get station rt data config', function () {
            it('should return null if no station in datacenter', function (done) {
                stationManage.getStationRDConfig("noStation", function (err, rDConfigs) {
                    _.isNull(rDConfigs).should.be.eql(true);
                    done();
                });
            });
            it('should return rt data config if station in datacenter', function (done) {
                stationManage.getStationRDConfig("inDCStation1", function (err, rDConfigs) {
                    _.isNull(rDConfigs).should.be.eql(false);
                    done();
                });
            });
        });
    });
    describe('#getStationDVConfig(stationName, cb)', function () {
        context('get station data visualization config', function () {
            it('should return null if no station in datacenter', function (done) {
                stationManage.getStationDVConfig("noStation", function (err, dVConfigs) {
                    _.isNull(dVConfigs).should.be.eql(true);
                    done();
                });
            });
            it('should return station data visualization config if station in datacenter', function (done) {
                stationManage.getStationDVConfig("inDCStation1", function (err, dVConfigs) {
                    _.isNull(dVConfigs).should.be.eql(false);
                    done();
                });
            });
        });
    });
    context('set station DV config #setStationDVConfig(stationDVConfig,callback)', function () {
        it('set fail if no station in datacenter', function (done) {
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
            stationManage.setStationDVConfig(stationDVConfig, function (err, isSuccess) {
                isSuccess.should.be.eql(false);
                done();
            });
        });
        it('set success', function (done) {
            var stationDVConfig = {
                stationName: "inDCStation1",
                dVConfigs: {
                    rain: {
                        visualName: "雨量",
                        maxV: 3000,
                        minV: 2900
                    }
                }
            };
            stationManage.setStationDVConfig(stationDVConfig, function (err, isSuccess) {
                isSuccess.should.be.eql(true);
                done();
            });
        });
    });
    context('set station RD config #setStationRDConfig(stationRDConfig,callback)', function () {
        it('set fail if no station in datacenter', function (done) {
            var StationRDConfig = {
                stationName: "noStation1",
                rTDataConfigs: {
                    rain: {
                        dataName: "rain",
                        timeSpace: 1000,
                        timeLong: 1000 * 60 * 60 * 4
                    }
                }
            };
            stationManage.setStationRDConfig(StationRDConfig, function (err, isSuccess) {
                isSuccess.should.be.eql(false);
                done();
            });
        });
        it('set success', function (done) {
            var StationRDConfig = {
                stationName: "station1",
                rTDataConfigs: {
                    rain: {
                        dataName: "rain",
                        timeSpace: 1000,
                        timeLong: 1000 * 60 * 60 * 4
                    }
                }
            };
            stationManage.setStationRDConfig(StationRDConfig, function (err, isSuccess) {
                isSuccess.should.be.eql(true);
                done();
            });
        });
    })
});