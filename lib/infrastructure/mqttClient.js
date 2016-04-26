'use strict';
var util = require('util');
var EventEmitter = require('events');
var mqtt = require('mqtt');

function MqttClient(mqttBrokerUrl, optionsStr) {
    EventEmitter.call(this);
    this.client = mqtt.connect(mqttBrokerUrl, JSON.parse(optionsStr));
};

util.inherits(MqttClient, EventEmitter);

MqttClient.prototype.subscribeData = function () {
    var mc = this;
    this.client.subscribe('rd/#')
    this.client.on('message', function (topic, message) {
        if (topic.indexOf("rd/") == 0) {
            var data = {};
            var stationNameEndIndex = topic.indexOf("/", 3);
            data.stationName = topic.slice(3, stationNameEndIndex);
            var dataName2StartIndex = topic.lastIndexOf("/") + 1;
            var dataName2 = topic.slice(dataName2StartIndex);
            var dataName1StartIndex = topic.indexOf("/", stationNameEndIndex + 1) + 1;
            var dataName1 = topic.slice(dataName1StartIndex, dataName2StartIndex - 1);
            data.dataName = `${dataName1}-${dataName2}`;
            var m = JSON.parse(message.toString());
            data.value = m.vl;
            data.timestamp = m.ts;
            mc.emit("DataArrive", data);
        }
    });
};

module.exports = MqttClient;