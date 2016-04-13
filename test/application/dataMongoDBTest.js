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
            db.collection('testStation').drop(function (err, response) {
                db.close();
                done();
            });
        });
    });
});

