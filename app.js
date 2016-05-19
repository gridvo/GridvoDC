'use strict';
var async = require('async');
var bearcat = require('bearcat');
var appEvent = require('./lib/application/appEvent');

var DataDispatch;
var DataRTMaster;
var StationRepository;
var DataRepository;
var MqttClient;
var contextPath = require.resolve('./bcontext.json');
bearcat.createApp([contextPath]);
bearcat.start(function () {
    DataDispatch = bearcat.getBean('dataDispatch');
    DataRTMaster = bearcat.getBean('dataRTMaster');
    StationRepository = bearcat.getBean('stationRepository');
    DataRepository = bearcat.getBean('dataRepository');
    MqttClient = bearcat.getBean('mqttClient');
    DataRTMaster.launch(function (err, cBData) {
        if (err) {
            return;
        }
        DataRTMaster.on(appEvent.application.STATION_OPEN_RTDATA, function (eventData) {
            MqttClient.publishStationStartRTDataMonitorResult(eventData);
            console.log(`station added:${JSON.stringify(eventData)}`);
        });
        DataRTMaster.on(appEvent.domain.RTDATAS_PUB, function (eventData) {
            MqttClient.publishStationPubRTData(eventData);
            console.log(`station pub rt data:${JSON.stringify(eventData)}`);
        });
    });
    DataDispatch.on(appEvent.application.DATA_POINT_SAVE_SUCCESS, function (eventData) {
        console.log(`data point added:${JSON.stringify(eventData)}`);
        DataRTMaster.receiveRTData(eventData);
    });
    MqttClient.on("DataArrive", function (data) {
        DataDispatch.receiveData(data);
    });
    MqttClient.on("StationStartRTDataMonitor", function (stationName) {
        DataRTMaster.stationStartRTDataMonitor(stationName, function (err, cBData) {
            if (err) {
                return;
            }
            MqttClient.publishStationStartRTDataMonitorResult(cBData);
        })
    });
    MqttClient.on("StationRDConfig", function (stationName) {
        StationRepository.getStationRDConfig(stationName, function (err, cBData) {
            if (err) {
                return;
            }
            async.waterfall([function (cb) {
                DataRepository.getStationDataNames(stationName, cb);
            }], function (err, dataNames) {
                if (err) {
                    return;
                }
                var rDConfigs = {};
                for (let dataName of dataNames) {
                    rDConfigs[dataName] = {};
                    rDConfigs[dataName].dataName = dataName;
                    rDConfigs[dataName].timeSpace = cBData[dataName] && cBData[dataName].timeSpace ? cBData[dataName].timeSpace : 1000 * 60;
                    rDConfigs[dataName].timeLong = cBData[dataName] && cBData[dataName].timeLong ? cBData[dataName].timeLong : 1000 * 60 * 60 * 4;
                    rDConfigs[dataName].pubDataSpace = cBData[dataName] && cBData[dataName].pubDataSpace ? cBData[dataName].pubDataSpace : 1000 * 60;
                    rDConfigs[dataName].isPubAllRTData = cBData[dataName] && cBData[dataName].isPubAllRTData ? cBData[dataName].isPubAllRTData : false;
                    rDConfigs[dataName].openRDM = cBData[dataName] && cBData[dataName].openRDM ? cBData[dataName].openRDM : false;
                }
                var stationRDConfig = {};
                stationRDConfig.stationName = stationName;
                stationRDConfig.rDConfigs = rDConfigs;
                MqttClient.publishStationRDConfig(stationRDConfig);
            });
        })
    });
    MqttClient.on("StationSetStationRTData", function (stationRTDataConfig) {
        DataRTMaster.setStationRTData(stationRTDataConfig, function (err, cBData) {
            if (err) {
                return;
            }
            DataRTMaster.stationStartRTDataMonitor(cBData.stationName, function (err, cBData) {
                if (err) {
                    return;
                }
                MqttClient.publishStationStartRTDataMonitorResult(cBData);
            })
        })
    });
    MqttClient.on("StationDVConfig", function (stationName) {
        StationRepository.getStationDVConfig(stationName, function (err, cBData) {
            if (err) {
                return;
            }
            async.waterfall([function (cb) {
                DataRepository.getStationDataNames(stationName, cb);
            }], function (err, dataNames) {
                if (err) {
                    return;
                }
                var dVConfigs = {};
                for (let dataName of dataNames) {
                    dVConfigs[dataName] = {};
                    dVConfigs[dataName].dataName = dataName;
                    dVConfigs[dataName].visualName = cBData && cBData[dataName] && cBData[dataName].visualName ? cBData[dataName].visualName : dataName;
                    dVConfigs[dataName].maxV = cBData && cBData[dataName] && cBData[dataName].maxV ? cBData[dataName].maxV : null;
                    dVConfigs[dataName].minV = cBData && cBData[dataName] && cBData[dataName].minV ? cBData[dataName].minV : null;
                }
                var stationDVConfig = {};
                stationDVConfig.stationName = stationName;
                stationDVConfig.dVConfigs = dVConfigs;
                MqttClient.publishStationDVConfig(stationDVConfig);
            });
        })
    });
    MqttClient.on("StationSetDVConfig", function (stationDVConfig) {
        StationRepository.updateStationDataVisualization(stationDVConfig, function (err, cBData) {
            if (err) {
                return;
            }
        })
    });
    MqttClient.subscribeData();
    MqttClient.subscribeStationStartRTDataMonitor();
    MqttClient.subscribeStationRDConfig();
    MqttClient.subscribeStationSetStationRTData();
    MqttClient.subscribeStationDVConfig();
    MqttClient.subscribeStationSetStationDVConfig();
});