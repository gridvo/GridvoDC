var DataPoint = require('../../lib/domain/dataPoint');
var DataSection = require('../../lib/domain/dataSection');

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
            if (dataPoint.dataName == "rain") {
                cb(null, new DataPoint({
                    stationName: "inDCStation1",
                    timestamp: new Date("2016-1-1 00:18:00"),
                    dataName: "rain",
                    value: 2000
                }))
            }
            else {
                cb(null, new DataPoint({
                    stationName: "inDCStation1",
                    timestamp: new Date("2016-1-1 00:19:00"),
                    dataName: "meter",
                    value: 2000
                }))
            }
            break;
        default:
            return;
    }
};

DataRepository.prototype.getDataSection = function (sectionOptions, cb) {
    switch (sectionOptions.stationName) {
        case "inDCStation1":
            if (sectionOptions.dataName == "rain") {
                var dataSection = new DataSection({
                    stationName: "inDCStation1",
                    dataName: "rain",
                });
                dataSection.datas.push({
                    timestamp: new Date("2016-1-1 00:15:00"),
                    value: 2000
                });
                dataSection.datas.push({
                    timestamp: new Date("2016-1-1 00:16:00"),
                    value: 3000
                });
                cb(null, dataSection);
            }
            if (sectionOptions.dataName == "meter") {
                var dataSection = new DataSection({
                    stationName: "inDCStation1",
                    dataName: "meter",
                });
                dataSection.datas.push({
                    timestamp: new Date("2016-1-1 00:15:00"),
                    value: 2000
                });
                dataSection.datas.push({
                    timestamp: new Date("2016-1-1 00:18:00"),
                    value: 1000
                });
                cb(null, dataSection);
            }
            if (sectionOptions.dataName == "YG") {
                var dataSection = new DataSection({
                    stationName: "inDCStation1",
                    dataName: "YG",
                });
                cb(null, dataSection);
            }
            break;
        default:
            var dataSection = new DataSection({});
            cb(null, dataSection);
            return;
    }
};

module.exports = DataRepository;
