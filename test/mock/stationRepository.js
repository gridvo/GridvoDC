var DataStation = require('../../lib/domain/dataStation');

function StationRepository() {
};

StationRepository.prototype.getAllStation = function (cb) {
    cb(null, [new DataStation({
        stationName: "inDCStation1",
        rTDataConfigs: {
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
        }
    })]);
};

StationRepository.prototype.saveStation = function (stationName, cb) {
    cb(null);
};

StationRepository.prototype.isStationExist = function (stationName, cb) {
    switch (stationName) {
        case "newStation":
            cb(null, false);
            break;
        case "noStation":
            cb(null, false);
            break;
        case "errStation":
            cb(new Error("error"), false);
            break;
        default:
            cb(null, true);
            return;
    }
};

StationRepository.prototype.updateStation = function (stationRTDataConfig, cb) {
    switch (stationRTDataConfig.stationName) {
        case "noStation":
            cb(null, {stationName: "noStation"});
            break;
        case "errStation":
            cb(new Error("error"), null);
            break;
        default:
            cb(null, {});
            return;
    }
};

module.exports = StationRepository;
