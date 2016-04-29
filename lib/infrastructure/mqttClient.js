'use strict';
var util = require('util');
var EventEmitter = require('events');
var mqtt = require('mqtt');

function MqttClient(mqttBrokerUrl, optionsStr) {
    EventEmitter.call(this);
    this.client = mqtt.connect(mqttBrokerUrl, JSON.parse(optionsStr));
    var mc = this;
    this.client.on('connect', function () {
        mc.client.on('message', function (topic, message) {
            console.log(topic);
            if (topic.indexOf("rd/") == 0) {
                var data = {};
                var stationNameEndIndex = topic.indexOf("/", 3);
                data.stationName = topic.slice(3, stationNameEndIndex);
                var dataName2StartIndex = topic.lastIndexOf("/") + 1;
                var dataName2 = topic.slice(dataName2StartIndex);
                var dataName1StartIndex = topic.indexOf("/", stationNameEndIndex + 1) + 1;
                var dataName1 = topic.slice(dataName1StartIndex, dataName2StartIndex - 1);
                data.dataName = `${dataName1}_${dataName2}`;
                var m = JSON.parse(message.toString());
                data.value = m.vl;
                data.timestamp = m.ts;
                mc.emit("DataArrive", data);
            }
            if (topic.indexOf("startRTDataMonitor/") == 0) {
                var stationName;
                var stationNameStartIndex = topic.indexOf("/", 0);
                stationName = topic.slice(stationNameStartIndex + 1);
                mc.emit("StationStartRTDataMonitor", stationName);
            }
            if (topic.indexOf("setStationRTData/") == 0) {
                var stationName;
                var stationNameStartIndex = topic.indexOf("/", 0);
                stationName = topic.slice(stationNameStartIndex + 1);
                var stationRTDataConfig = JSON.parse(message.toString());
                mc.emit("StationSetStationRTData", stationRTDataConfig);
            }
        });
    });
};

util.inherits(MqttClient, EventEmitter);

MqttClient.prototype.subscribeData = function () {
    this.client.subscribe('rd/#');
};

MqttClient.prototype.subscribeStationStartRTDataMonitor = function () {
    this.client.subscribe('startRTDataMonitor/#');
};

MqttClient.prototype.subscribeStationSetStationRTData = function () {
    this.client.subscribe('setStationRTData/#');
};

MqttClient.prototype.publishStationStartRTDataMonitorResult = function (result) {
    this.client.publish(`${result.stationName}/startRTDataMonitor`, JSON.stringify(result));
};

module.exports = MqttClient;