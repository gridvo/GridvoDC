'use strict';
var bearcat = require('bearcat');
var appEvent = require('./lib/application/appEvent');

var DataDispatch;
var MqttClient;
var contextPath = require.resolve('./bcontext.json');
bearcat.createApp([contextPath]);
bearcat.start(function () {
    DataDispatch = bearcat.getBean('dataDispatch');
    MqttClient = bearcat.getBean('mqttClient');
    DataDispatch.on(appEvent.application.NEW_STATION_ADDED, function (eventData) {
        console.log(`station added:${JSON.stringify(eventData)}`);
    });
    DataDispatch.on(appEvent.application.DATA_POINT_SAVE_SUCCESS, function (eventData) {
        console.log(`data point added:${JSON.stringify(eventData)}`);
    });
    DataDispatch.launch(function (err) {
        if (err) {
            return;
        }
        MqttClient.on("RTDataArrive", function (rTData) {
            DataDispatch.receiveData(rTData);
        });
        MqttClient.subscribeRTData();
    });
});