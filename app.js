'use strict';
var bearcat = require('bearcat');
var appEvent = require('./lib/application/appEvent');

var DataDispatch;
var DataRTMaster;
var MqttClient;
var contextPath = require.resolve('./bcontext.json');
bearcat.createApp([contextPath]);
bearcat.start(function () {
    DataDispatch = bearcat.getBean('dataDispatch');
    DataRTMaster = bearcat.getBean('dataRTMaster');
    MqttClient = bearcat.getBean('mqttClient');
    DataRTMaster.launch(function (err, cBdata) {
        if (err) {
            return;
        }
        DataRTMaster.on(appEvent.application.STATION_OPEN_RTDATA, function (eventData) {
            console.log(`station added:${JSON.stringify(eventData)}`);
        })
    });
    DataDispatch.on(appEvent.application.DATA_POINT_SAVE_SUCCESS, function (eventData) {
        console.log(`data point added:${JSON.stringify(eventData)}`);
        DataRTMaster.receiveRTData(eventData);
    });
    MqttClient.on("DataArrive", function (rTData) {
        DataDispatch.receiveData(rTData);
    });
    MqttClient.subscribeData();
});