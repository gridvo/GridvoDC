var DataPoint = require('../../lib/domain/dataPoint');

function DataRepository() {
};

DataRepository.prototype.saveDataPoint = function (dataPoint, cb) {
    switch (dataPoint.stationName) {
        case "newStation":
            cb(null, new DataPoint({
                stationName: "newStation",
                timestamp: new Date("2016-1-1 00:15:00"),
                dataName: "rain",
                value: 2000
            }))
            break;
        case "inDCStation1":
            cb(null, new DataPoint({
                stationName: "inDCStation1",
                timestamp: new Date("2016-1-1 00:15:00"),
                dataName: "rain",
                value: 2000
            }))
            break;
        default:
            return;
    }
};

module.exports = DataRepository;
