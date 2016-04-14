'use strict';
var util = require('util');
var EventEmitter = require('events');
var mqtt = require('mqtt');

function MqttClient(mqttBrokerUrl) {
    EventEmitter.call(this);
    this.client = mqtt.connect(mqttBrokerUrl);
};

util.inherits(MqttClient, EventEmitter);

MqttClient.prototype.subscribeRTData = function () {
    var mc = this;
    this.client.subscribe('/RTData')
    this.client.on('message', function (topic, message) {
        if (topic == "/RTData") {
            mc.emit("RTDataArrive", message);
        }
    });
};

module.exports = MqttClient;