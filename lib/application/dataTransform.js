'use strict';
var DataPoint = require('../domain/dataPoint');

class DataTransform {
    static convertToDataPoint(oData) {
        var timestampS = oData.timestamp * 1000;
        oData.timestamp = new Date(timestampS);
        return new DataPoint(oData);
    }
}

module.exports = DataTransform;