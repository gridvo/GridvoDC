var DataStation = require('../../lib/domain/dataStation');

function StationRepository() {
};

StationRepository.prototype.getAllOpenRTDataStation = function (cb) {
    cb(null, [new DataStation({
        stationName: "inDCStation1",
        rTDataConfigs: {
            rain: {
                dataName: "rain",
                openRDM: true,
                timeSpace: 1000 * 60,
                timeLong: 1000 * 60 * 60 * 4
            },
            meter: {
                dataName: "meter",
                openRDM: true,
                timeSpace: 1000 * 60,
                timeLong: 1000 * 60 * 60 * 4
            },
            KWh: {
                dataName: "KWh",
                openRDM: false,
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

StationRepository.prototype.getStationRDConfig = function (stationName, cb) {
    switch (stationName) {
        case "noStation":
            cb(null, null);
            break;
        case "noStation1":
            cb(null, {
                rain: {
                    dataName: "rain",
                    openRDM: true,
                    timeSpace: 1000 * 60,
                    timeLong: 1000 * 60 * 60 * 4
                },
                meter: {
                    dataName: "meter",
                    openRDM: true,
                    timeSpace: 1000 * 60,
                    timeLong: 1000 * 60 * 60 * 4
                }
            });
            break;
        case "inDCStation1":
            cb(null, {
                rain: {
                    dataName: "rain",
                    openRDM: true,
                    timeSpace: 1000 * 60,
                    timeLong: 1000 * 60 * 60 * 4
                },
                meter: {
                    dataName: "meter",
                    openRDM: true,
                    timeSpace: 1000 * 60,
                    timeLong: 1000 * 60
                }
            });
            break;
        default:
            cb(null, {});
            return;
    }
};

StationRepository.prototype.getStationDVConfig = function (stationName, cb) {
    switch (stationName) {
        case "noStation":
            cb(null, null);
            break;
        case "inDCStation1":
            cb(null, {});
            break;
        default:
            cb(null, null);
            return;
    }
};

StationRepository.prototype.updateStationRDConfig = function (stationRDConfig, cb) {
    switch (stationRDConfig.stationName) {
        case "noStation":
            cb(null, {stationName: "noStation"});
            break;
        case "noStation1":
            cb(null, null);
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

StationRepository.prototype.updateStationDVConfig = function (stationDVConfig, cb) {
    switch (stationDVConfig.stationName) {
        case "noStation":
            cb(null, null);
            break;
        case "inDCStation1":
            cb(null, {
                stationName: "inDCStation1",
                dVConfigs: {
                    rain: {
                        visualName: "雨量",
                        maxV: 3000,
                        minV: 2900
                    }
                }
            });
            break;
        default:
            cb(null, null);
            return;
    }
};

module.exports = StationRepository;
