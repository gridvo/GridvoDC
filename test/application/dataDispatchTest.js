var bearcat = require('bearcat');
var _ = require('underscore');
var should = require('should');
var appEvent = require('../../lib/application/appEvent');

describe('dataDispatch use case test', function () {
    var DataDispatch;
    before(function () {
        var contextPath = require.resolve('../../testbcontext.json');
        bearcat.createApp([contextPath]);
        bearcat.start(function () {
            DataDispatch = bearcat.getBean('dataDispatch');
        });
    });
    describe('#receiveData(oData)', function () {
        context('when a data arrive, receive this data', function () {
            it('should emit "DATA_POINT_SAVE_SUCCESS" application event,when saved', function (done) {
                DataDispatch.on(appEvent.application.DATA_POINT_SAVE_SUCCESS, function (eventData) {
                    eventData.stationName.should.be.eql("inDCStation1");
                    eventData.timestamp.should.be.eql(new Date("2016-1-1 00:18:00"));
                    eventData.dataName.should.be.eql("rain");
                    eventData.value.should.be.eql(2000);
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
        });
    });
    describe('#extractDatas(dataOptions, cb)', function () {
        context('when get the data', function () {
            it('should return [] datas if no data in data center', function (done) {
                var dataOptions = {};
                dataOptions.stationName = "inDCStation1";
                dataOptions.dataName = "YG";
                dataOptions.startD = "2016-1-1 00:05:00";
                dataOptions.endD = "2016-1-1 00:15:00";
                DataDispatch.extractDatas(dataOptions, function (err, cBData) {
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
                DataDispatch.extractDatas(dataOptions, function (err, cBData) {
                    cBData.datas.length.should.be.eql(2);
                    done();
                });
            });
        });
    });
});