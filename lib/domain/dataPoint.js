function DataPoint(dataPointData) {
    this.stationName = dataPointData.stationName;
    this.timestamp = dataPointData.timestamp;
    this.dataName = dataPointData.dataName;
    this.value = dataPointData.value;
};

module.exports = DataPoint;