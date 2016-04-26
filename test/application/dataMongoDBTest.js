'use strict';
var async = require('async');
var MongoClient = require('mongodb').MongoClient;
var bearcat = require('bearcat');
var _ = require('underscore');
var should = require('should');
var DataPoint = require('../../lib/domain/dataPoint');

describe('data repository MongoDB use case test', function () {
    var Repository;
    before(function () {
        var contextPath = require.resolve('../../testbcontext.json');
        bearcat.createApp([contextPath]);
        bearcat.start(function () {
            Repository = bearcat.getBean('dataRepository');
        });
    });
    describe('#saveDataPoint(dataPoint, cb)', function () {
        context('save a data Point', function () {
            it('should return dataPoint if save success', function (done) {
                var dataPoint = new DataPoint({
                    stationName: "testStation",
                    timestamp: new Date("2016-5-1 00:15:00"),
                    dataName: "rain",
                    value: 90
                });
                Repository.saveDataPoint(dataPoint, function (err, dataPoint) {
                    dataPoint.stationName.should.be.eql("testStation");
                    dataPoint.timestamp.should.be.eql(new Date("2016-5-1 00:15:00"));
                    done();
                });
            });
        });
    });
    describe('#getDataSection(sectionOptions, cb)', function () {
        context('get data Section', function () {
            it('Data Section should return [] if no this section data in the data center', function (done) {
                var sectionOptions = {
                    stationName: "testStation",
                    dataName: "rain",
                    startD: new Date("2016-5-1 00:00:00"),
                    endD: new Date("2016-5-1 00:14:00")
                };
                Repository.getDataSection(sectionOptions, function (err, dataSection) {
                    dataSection.datas.should.be.eql([]);
                    done();
                });
            });
            it('should return section data in the data center', function (done) {
                var sectionOptions = {
                    stationName: "testStation",
                    dataName: "rain",
                    startD: new Date("2016-5-1 00:00:00"),
                    endD: new Date("2016-5-1 00:15:00")
                };
                Repository.getDataSection(sectionOptions, function (err, dataSection) {
                    dataSection.datas.length.should.be.eql(1);
                    done();
                });
            });
        });
    });
    describe('#getStationDataNames(stationName, cb)', function () {
        context('get station all data name', function () {
            it('should return [] when no station datas in the data center', function (done) {
                Repository.getStationDataNames("noStation", function (err, dataNames) {
                    dataNames.should.be.eql([]);
                    done();
                });
            });
            it('should return data names when this datas in the data center', function (done) {
                Repository.getStationDataNames("testStation", function (err, dataNames) {
                    dataNames.length.should.be.eql(1);
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
            db.collection('testStation').drop(function (err, response) {
                db.close();
                done();
            });
        });
    });
});

