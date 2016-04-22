var bearcat = require('bearcat');
var _ = require('underscore');
var should = require('should');
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
                    DataDispatch.__dispatchCenter__.stationRTDatas["inDCStation1"].rTDatas["rain"].timeSpace.should.be.eql(1000 * 60);
                    DataDispatch.__dispatchCenter__.stationRTDatas["inDCStation1"].rTDatas["rain"].timeLong.should.be.eql(1000 * 60 * 60 * 4);
                    DataDispatch.__dispatchCenter__.stationRTDatas["inDCStation1"].rTDatas["rain"].datas.length.should.be.eql(2);
                    DataDispatch.__dispatchCenter__.stationRTDatas["inDCStation1"].rTDatas["meter"].datas.length.should.be.eql(4);
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
                stationRTDataConfig.stationName = "inDCStation1";
                stationRTDataConfig.rTDataConfigs = {
                    meter: {
                        dataName: "meter",
                        timeSpace: 1000 * 30,
                        timeLong: 1000 * 60 * 60 * 4
                    }
                };
                DataDispatch.setStationRTData(stationRTDataConfig, function (err, cbData) {
                    cbData.stationName.should.be.eql("inDCStation1");
                    DataDispatch.__dispatchCenter__.stationRTDatas["inDCStation1"].rTDatas["meter"].timeSpace.should.be.eql(1000 * 30);
                    DataDispatch.__dispatchCenter__.stationRTDatas["inDCStation1"].rTDatas["meter"].datas.length.should.be.eql(7);
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
                    eventData.timestamp.should.be.eql(new Date("2016-1-1 00:18:00"));
                    eventData.dataName.should.be.eql("rain");
                    eventData.value.should.be.eql(2000);
                    DataDispatch.__dispatchCenter__.stationRTDatas["inDCStation1"].rTDatas["rain"].datas.length.should.be.eql(4);
                    DataDispatch.__dispatchCenter__.stationRTDatas["inDCStation1"].rTDatas["rain"].lastDataTimestamp.should.be.eql(new Date("2016-1-1 00:18:00"));
                    done();
                });
                var oData = {};
                oData.stationName = "inDCStation1";
                oData.timestamp = "2016-1-1 00:18:00";
                oData.dataName = "rain";
                oData.value = 2000;
                DataDispatch.receiveData(oData);
                DataDispatch.removeAllListeners(appEvent.application.DATA_POINT_SAVE_SUCCESS);
            });
            it('should emit "RTDATAS_PUB" domain event,when rt data can pub', function (done) {
                DataDispatch.on(appEvent.domain.RTDATAS_PUB, function (eventData) {
                    eventData.stationName.should.be.eql("inDCStation1");
                    eventData.dataName.should.be.eql("meter");
                    eventData.timeSpace.should.be.eql(1000 * 60);
                    eventData.timeLong.should.be.eql(1000 * 60);
                    eventData.datas.length.should.be.eql(1);
                    done();
                });
                var stationRTDataConfig = {};
                stationRTDataConfig.stationName = "inDCStation1";
                stationRTDataConfig.rTDataConfigs = {
                    meter: {
                        dataName: "meter",
                        timeSpace: 1000 * 60,
                        timeLong: 1000 * 60
                    }
                };
                DataDispatch.setStationRTData(stationRTDataConfig, function (err, cbData) {
                });
                var oData = {};
                oData.stationName = "inDCStation1";
                oData.timestamp = "2016-1-1 00:19:00";
                oData.dataName = "meter";
                oData.value = 2000;
                DataDispatch.receiveData(oData);
                DataDispatch.removeAllListeners(appEvent.domain.RTDATAS_PUB);
            });
        });
    });
    describe('#getRTData(rTDataOptions, cb)', function () {
        context('when get the RT data', function () {
            it('should return null if no rt data', function (done) {
                var rTDataOptions = {};
                rTDataOptions.stationName = "inDCStation1";
                rTDataOptions.dataName = "YG";
                DataDispatch.getRTData(rTDataOptions, function (err, rTData) {
                    _.isNull(rTData).should.be.eql(true);
                    done();
                });
            });
            it('should return rt data', function (done) {
                var rTDatacbOptions = {};
                rTDatacbOptions.stationName = "inDCStation1";
                rTDatacbOptions.dataName = "rain";
                DataDispatch.getRTData(rTDatacbOptions, function (err, rTData) {
                    rTData.datas.length.should.be.eql(3);
                    done();
                });
            });
        });
    });
    describe('#getDatas(dataOptions, cb)', function () {
        context('when get the data', function () {
            it('should return [] datas if no data in data center', function (done) {
                var dataOptions = {};
                dataOptions.stationName = "inDCStation1";
                dataOptions.dataName = "YG";
                dataOptions.startD = "2016-1-1 00:05:00";
                dataOptions.endD = "2016-1-1 00:15:00";
                DataDispatch.getDatas(dataOptions, function (err, cBData) {
                    cBData.datas.should.be.eql([]);
                    done();
                });
            });
            it('should return data', function (done) {
                var dataOptions = {};
                dataOptions.stationName = "inDCStation1";
                dataOptions.dataName = "rain";
                dataOptions.startD = "2016-1-1 00:15:00";
                dataOptions.endD = "2016-1-1 00:16:00";
                DataDispatch.getDatas(dataOptions, function (err, cBData) {
                    cBData.datas.length.should.be.eql(2);
                    done();
                });
            });
        });
    });
});