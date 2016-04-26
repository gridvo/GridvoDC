var DataStation = require('../../lib/domain/dataStation');

function StationRepository() {
};

StationRepository.prototype.getAllOpenRTDataStation = function (cb) {
    cb(null, [new DataStation({
        stationName: "inDCStation1",
        rTDataConfigs: {
            rain: {
                dataName: "rain",
                timeSpace: 1000 * 60,
                timeLong: 1000 * 60 * 60 * 4
            },
            meter: {
                dataName: "meter",
                timeSpace: 1000 * 60,
                timeLong: 1000 * 60 * 60 * 4
            }
        }
    })]);
};

StationRepository.prototype.saveStation = function (stationName, cb) {
    switch (stationName) {
        case "newStation":
            cb(null, "newStation");
            break;
        case "noStation":
            cb(null, "noStation");
            break;
        case "inDCStation1":
            cb(null, "inDCStation1");
            break;
        default:
            return;
    }
};

StationRepository.prototype.updateStationRTData = function (stationRTDataConfig, cb) {
    switch (stationRTDataConfig.stationName) {
        case "noStation":
            cb(null, {stationName: "noStation"});
            break;
        case "errStation":
            cb(new Error("error"), null);
            break;
        case "inDCStation1":
            cb(null, {stationName: "inDCStation1"});
            break;
        default:
            cb(null, {});
            return;
    }
};

module.exports = StationRepository;
