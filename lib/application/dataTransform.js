'use strict';
var DataPoint = require('../domain/dataPoint');

class DataTransform {
    static convertToDataPoint(oData) {
        var timestampS = oData.timestamp;
        oData.timestamp = new Date(timestampS);
        return new DataPoint(oData);
    }
}

module.exports = DataTransform;