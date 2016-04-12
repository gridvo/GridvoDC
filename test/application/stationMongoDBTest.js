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
    describe('#getAllStation(cb)', function () {
        context('when data dispatch launch', function () {
            it('should return [] if no station in mongodb', function (done) {
                Repository.getAllStation(function (err, stations) {
                    stations.should.be.eql([]);
                    done();
                });
            });
        });
    });
});

