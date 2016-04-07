var bearcat = require('bearcat');
var _ = require('underscore');
var should = require('should');
var dataDispatch = require('../../lib/application/dataDispatch');
var appEvent = require('../../lib/application/appEvent');
var appError = require('../../lib/application/appError');

describe('dataDispatch use case test', function () {
    var DataDispatch;
    before(function () {
        var contextPath = require.resolve('../../testbcontext.json');
        bearcat.createApp([contextPath]);
        bearcat.start(function () {
            DataDispatch = bearcat.getBean('dataDispatch');
        });
    });
    describe('#launch(cb)', function () {
        context('when data dispatch launch', function () {
            it('should load station RT data then station in data center', function (done) {
                DataDispatch.launch(function (err) {
                    DataDispatch.__dispatchCenter__.stationRTDatas["inDCStation1"].stationName.should.be.eql("inDCStation1");
                    _.keys(DataDispatch.__dispatchCenter__.stationRTDatas["inDCStation1"].rTDatas).length.should.be.eql(2);
                    DataDispatch.__dispatchCenter__.stationRTDatas["inDCStation1"].rTDatas["rain"].timeSpace.should.be.eql(1000);
                    DataDispatch.__dispatchCenter__.stationRTDatas["inDCStation1"].rTDatas["rain"].timeLong.should.be.eql(1000 * 60 * 60 * 4);
                    DataDispatch.__dispatchCenter__.stationRTDatas["inDCStation1"].rTDatas["rain"].dataSection.should.be.eql([]);
                    DataDispatch.__dispatchCenter__.stationRTDatas["inDCStation1"].rTDatas["meter"].dataSection.should.be.eql([]);
                    done();
                });
            });
        });
    });
    describe('#setStationRTData(stationRTDataConfig,cb)', function () {
        context('when station client set data monitor', function () {
            it('should emit "NEW_STATION_ADDED" application event, if a station not in data center', function (done) {
                var currentEmitCount = 0;
                var doneMore = function () {
                    currentEmitCount++;
                    if (currentEmitCount == 2) {
                        done();
                    }
                };
                DataDispatch.on(appEvent.application.NEW_STATION_ADDED, function (eventData) {
                    eventData.stationName.should.be.eql("noStation");
                    _.keys(DataDispatch.__dispatchCenter__.stationRTDatas["noStation"].rTDatas).length.should.be.eql(0);
                    doneMore();
                });
                var stationRTDataConfig = {};
                stationRTDataConfig.stationName = "noStation";
                stationRTDataConfig.rTDataConfigs = {
                    rain: {
                        dataName: "rain",
                        timeSpace: 1000,
                        timeLong: 1000 * 60 * 60 * 4
                    },
                    meter: {
                        dataName: "meter",
                        timeSpace: 1000,
                        timeLong: 1000 * 60 * 60 * 4
                    }
                };
                DataDispatch.setStationRTData(stationRTDataConfig, function (err, cbData) {
                    _.keys(DataDispatch.__dispatchCenter__.stationRTDatas["noStation"].rTDatas).length.should.be.eql(2);
                    cbData.stationName.should.be.eql("noStation");
                    doneMore();
                });
                DataDispatch.removeAllListeners(appEvent.application.NEW_STATION_ADDED);
            });
            it('should success if station in data center', function (done) {
                var stationRTDataConfig = {};
                stationRTDataConfig.stationName = "noStation";
                stationRTDataConfig.rTDataConfigs = {
                    rain: {
                        dataName: "rain",
                        timeSpace: 2000,
                        timeLong: 1000 * 60 * 60 * 4
                    },
                    meter: {
                        dataName: "meter",
                        timeSpace: 1000,
                        timeLong: 3000 * 60 * 60 * 4
                    }
                };
                DataDispatch.setStationRTData(stationRTDataConfig, function (err, cbData) {
                    cbData.stationName.should.be.eql("noStation");
                    DataDispatch.__dispatchCenter__.stationRTDatas["noStation"].rTDatas["rain"].timeSpace.should.be.eql(2000);
                    DataDispatch.__dispatchCenter__.stationRTDatas["noStation"].rTDatas["meter"].timeLong.should.be.eql(3000 * 60 * 60 * 4);
                    done();
                });
            });
        });
    });
    describe('#receiveData(oData)', function () {
        context('when a data arrive, receive this data', function () {
            it('should emit "NEW_STATION_ADDED" "DATA_POINT_SAVE_SUCCESS" application event,' +
                'when the station data first receive', function (done) {
                var currentEmitCount = 0;
                var doneMore = function () {
                    currentEmitCount++;
                    if (currentEmitCount == 2) {
                        done();
                    }
                };
                DataDispatch.on(appEvent.application.NEW_STATION_ADDED, function (eventData) {
                    eventData.stationName.should.be.eql("newStation");
                    _.keys(DataDispatch.__dispatchCenter__.stationRTDatas["newStation"].rTDatas).length.should.be.eql(0);
                    doneMore();
                });
                DataDispatch.on(appEvent.application.DATA_POINT_SAVE_SUCCESS, function (eventData) {
                    eventData.stationName.should.be.eql("newStation");
                    eventData.timestamp.should.be.eql(new Date("2016-1-1 00:15:00"));
                    eventData.dataName.should.be.eql("rain");
                    eventData.value.should.be.eql(2000);
                    doneMore();
                });
                var oData = {};
                oData.stationName = "newStation";
                oData.timestamp = new Date("2016-1-1 00:15:00");
                oData.dataName = "rain";
                oData.value = 2000;
                DataDispatch.receiveData(oData);
                DataDispatch.removeAllListeners(appEvent.application.NEW_STATION_ADDED);
                DataDispatch.removeAllListeners(appEvent.application.DATA_POINT_SAVE_SUCCESS);
            });
            it('should emit "DATA_POINT_SAVE_SUCCESS" application event,when saved', function (done) {
                DataDispatch.on(appEvent.application.DATA_POINT_SAVE_SUCCESS, function (eventData) {
                    eventData.stationName.should.be.eql("inDCStation1");
                    eventData.timestamp.should.be.eql(new Date("2016-1-1 00:15:00"));
                    eventData.dataName.should.be.eql("rain");
                    eventData.value.should.be.eql(2000);
                    DataDispatch.__dispatchCenter__.stationRTDatas["inDCStation1"].rTDatas["rain"].dataSection.length.should.be.eql(1);
                    DataDispatch.__dispatchCenter__.stationRTDatas["inDCStation1"].rTDatas["rain"].lastDataTimestamp.should.be.eql(new Date("2016-1-1 00:15:00"));
                    done();
                });
                var oData = {};
                oData.stationName = "inDCStation1";
                oData.timestamp = new Date("2016-1-1 00:15:00");
                oData.dataName = "rain";
                oData.value = 2000;
                DataDispatch.receiveData(oData);
                DataDispatch.removeAllListeners(appEvent.application.DATA_POINT_SAVE_SUCCESS);
            });
        });
    });
});