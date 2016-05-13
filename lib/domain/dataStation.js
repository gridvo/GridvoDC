function DataStation(dataStationData) {
    this.stationName = dataStationData.stationName;
    this.rTDataConfigs = dataStationData.rTDataConfigs;
    this.dVConfigs = dataStationData.dVConfigs;
};

module.exports = DataStation;