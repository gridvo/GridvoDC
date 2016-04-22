function DataSection(dataSectionData) {
    this.stationName = dataSectionData.stationName;
    this.dataName = dataSectionData.dataName;
    this.startD = dataSectionData.startD;
    this.endD = dataSectionData.endD;
    this.timeSpace = 1000 * 60;
    this.datas = [];
};

module.exports = DataSection;