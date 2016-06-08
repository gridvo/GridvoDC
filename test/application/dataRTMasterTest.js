var bearcat = require('bearcat');
var _ = require('underscore');
var should = require('should');
var appEvent = require('../../lib/application/appEvent');
var DataPoint = require('../../lib/domain/dataPoint');

describe('dataRTMaster use case test', function () {
    var DataRTMaster;
    before(function () {
        var contextPath = require.resolve('../../testbcontext.json');
        bearcat.createApp([contextPath]);
        bearcat.start(function () {
            DataRTMaster = bearcat.getBean('dataRTMaster');
        });
    });
    describe('#launch(stationNames, cb)', function () {
        context('when data rt master launch', function () {
            it('should load station RT data then station in data center have rTDataConfigs', function (done) {
                DataRTMaster.launch([], function (err, cBData) {
                    cBData.stationCount.should.be.eql(1);
                    cBData.rTDataCount.should.be.eql(2);
                    done();
                });
            });
        });
    });
    describe('#stationStartRTDataMonitor(stationName, cb)', function () {
        context('station start rt data monitor', function () {
            it('should false then station rt data is not open', function (done) {
                DataRTMaster.stationStartRTDataMonitor("noStation", function (err, cBData) {
                    cBData.stationName.should.be.eql("noStation");
                    cBData.startSuccess.should.be.eql(false);
                    _.keys(cBData.rTdatas).length.should.be.eql(0);
                    done();
                });
            });
            it('should return rt data then station rt data is open', function (done) {
                DataRTMaster.stationStartRTDataMonitor("inDCStation1", function (err, cBData) {
                    cBData.stationName.should.be.eql("inDCStation1");
                    cBData.startSuccess.should.be.eql(true);
                    _.keys(cBData.rTdatas).length.should.be.eql(2);
                    done();
                });
            });
        });
    });
    describe('#launchStationRDM(stationName,cb)', function () {
        context('launch station rt data monitor', function () {
            it('should relaunch if station in data center and reload rt data', function (done) {
                DataRTMaster.launchStationRDM("inDCStation1", function (err, cBData) {
                    cBData.stationName.should.be.eql("inDCStation1");
                    cBData.isLaunched.should.be.eql(true);
                    cBData.rTDataCount.should.be.eql(2);
                    DataRTMaster.__rTDataMasterCenter__.stationRTDatas["inDCStation1"].rTDatas["meter"].timeSpace.should.be.eql(1000 * 60);
                    DataRTMaster.__rTDataMasterCenter__.stationRTDatas["inDCStation1"].rTDatas["meter"].datas.length.should.be.eql(1);
                    done();
                });
            });
            it('should emit "STATION_OPEN_RTDATA" application event, if a station not open rt data monitor', function (done) {
                var currentEmitCount = 0;
                var doneMore = function () {
                    currentEmitCount++;
                    if (currentEmitCount == 2) {
                        done();
                    }
                };
                DataRTMaster.on(appEvent.application.STATION_OPEN_RTDATA, function (eventData) {
                    eventData.stationName.should.be.eql("noStation1");
                    doneMore();
                });
                DataRTMaster.launchStationRDM("noStation1", function (err, cBData) {
                    cBData.stationName.should.be.eql("noStation1");
                    cBData.isLaunched.should.be.eql(true);
                    cBData.rTDataCount.should.be.eql(2);
                    doneMore();
                });
                DataRTMaster.removeAllListeners(appEvent.application.STATION_OPEN_RTDATA);
            });
        });
    });
    describe('#receiveRTData(dataPoint)', function () {
        context('receive a rt data', function () {
            it('should update the stationRTDatas', function () {
                var oData = {};
                oData.stationName = "inDCStation1";
                oData.timestamp = new Date("2016-1-1 00:18:00");
                oData.dataName = "rain";
                oData.value = 2000;
                var dataPoint = new DataPoint(oData);
                DataRTMaster.receiveRTData(dataPoint);
                DataRTMaster.__rTDataMasterCenter__.stationRTDatas["inDCStation1"].rTDatas["rain"].datas.length.should.be.eql(4);
                DataRTMaster.__rTDataMasterCenter__.stationRTDatas["inDCStation1"].rTDatas["rain"].lastDataTimestamp.should.be.eql(new Date("2016-1-1 00:18:00"));
            });
            it('should emit "RTDATAS_PUB" domain event,when rt data can pub', function (done) {
                DataRTMaster.on(appEvent.domain.RTDATAS_PUB, function (eventData) {
                    eventData.stationName.should.be.eql("inDCStation1");
                    eventData.dataName.should.be.eql("meter");
                    eventData.timeSpace.should.be.eql(1000 * 60);
                    eventData.timeLong.should.be.eql(1000 * 60);
                    eventData.datas.length.should.be.eql(1);
                    done();
                });
                var oData = {};
                oData.stationName = "inDCStation1";
                oData.timestamp = new Date("2016-1-1 00:19:00");
                oData.dataName = "meter";
                oData.value = 2000;
                var dataPoint = new DataPoint(oData);
                DataRTMaster.receiveRTData(dataPoint);
                DataRTMaster.removeAllListeners(appEvent.domain.RTDATAS_PUB);
            });
        });
    });
    describe('#getRTData(stationName, dataName, cb)', function () {
        context('when get the RT data', function () {
            it('should return null if no rt data', function (done) {
                DataRTMaster.getRTData("inDCStation1", "YG", function (err, rTData) {
                    _.isNull(rTData).should.be.eql(true);
                    done();
                });
            });
            it('should return rt data', function (done) {
                DataRTMaster.getRTData("inDCStation1", "rain", function (err, rTData) {
                    rTData.datas.length.should.be.eql(4);
                    done();
                });
            });
        });
    });
});
