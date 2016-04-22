'use strict';
var util = require('util');
var EventEmitter = require('events');
var mqtt = require('mqtt');

function MqttClient(mqttBrokerUrl, optionsStr) {
    EventEmitter.call(this);
    this.client = mqtt.connect(mqttBrokerUrl, JSON.parse(optionsStr));
};

util.inherits(MqttClient, EventEmitter);

MqttClient.prototype.subscribeRTData = function () {
    var mc = this;
    this.client.subscribe('rd/#')
    this.client.on('message', function (topic, message) {
        if (topic.indexOf("/rd/") == 0) {
            var rTData = {};
            var stationNameEndIndex = topic.indexOf("/", 4);
            rTData.stationName = topic.slice(4, stationNameEndIndex);
            rTData.dataName = topic.slice(stationNameEndIndex + 1);
            var m = JSON.parse(message.toString());
            rTData.value = m.val;
            rTData.timestamp = m.timestamp;
            console.log(topic);
            console.log(message);
            mc.emit("RTDataArrive", rTData);
        }
    });
};

module.exports = MqttClient;