'use strict';
var _ = require('underscore');
var DataPoint = require('../domain/dataPoint');

class DataTransform {
    static convertToDataPoint(oData) {
        var timestampS = (typeof oData.timestamp) == "string" ? oData.timestamp : oData.timestamp * 1000;
        var date = new Date(timestampS);
        var year, month, day, hours, minutes;
        year = date.getFullYear();
        month = date.getMonth();
        day = date.getDate();
        hours = date.getHours();
        minutes = date.getMinutes();
        oData.timestamp = new Date(`${year}-${month + 1}-${day} ${hours}:${minutes}:00`);
        return new DataPoint(oData);
    }
}

module.exports = DataTransform;