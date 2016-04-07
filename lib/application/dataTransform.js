'use strict';
var DataPoint = require('../domain/dataPoint');

class DataTransform {
    static convertToDataPoint(oData) {
        return new DataPoint(oData);
    }
}

module.exports = DataTransform;