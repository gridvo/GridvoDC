function DispatchCenter() {
    this.stationRTDatas = {};
};

DispatchCenter.prototype.receiveData = function (dataPoint) {
    this.stationRTDatas[dataPoint.stationName].addRTData(dataPoint);
};

DispatchCenter.prototype.addStationRTData = function (stationRTData) {
    this.stationRTDatas[stationRTData.stationName] = stationRTData;
};

module.exports = DispatchCenter;