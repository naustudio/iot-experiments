/**
 * This module manage connection to SparkCloud with the follwing feature
 * - Login
 * - Get list of connecting device.
 * - Connect to device.
 * - Send command to device: restart, flash firmware, custom command
 * - Listen device for events
 */
'use strict';


var sparkSDK = require('spark');

var Spark = function _Spark() {
	this.sparkConnected = false;

	return this;
};

Spark.prototype.onInitSuccess = function(err, body) {
	this.sparkConnected = true;
	console.log('API call login completed on callback:', body);
	this._showAllConnectingDevices();
};

Spark.prototype._showAllConnectingDevices = function() {
	var devicesPr = sparkSDK.listDevices();
	var self = this;

	devicesPr.then(
		function(devices) {
			var device = devices[0];
			self.setSelectedDevice(device);
			self._bindEventToDevice(device);
			console.log('Devices: ', devices);
			console.log('Device name: ' + device.name);
			console.log('- connected?: ' + device.connected);
			console.log('- variables: ' + device.variables);
			console.log('- functions: ' + device.functions);
			console.log('- version: ' + device.version);
		},
		function(err) {
			console.log('List devices call failed: ', err);
		}
	);
};

Spark.prototype._bindEventToDevice = function(device) {
	device.subscribe('changeNumber', function(data) {
		console.log("changeNumber Event: " + data);
	});
};
Spark.prototype.setSelectedDevice = function(device) {
	this.selectedDevice = device;
};
/**
 * init spark, connect to SparkCloud
 * @param  {SparkSetting} settings SparkSetting
 * @return {[type]}          [description]
 */
Spark.prototype.init = function(settings) {
	console.log('Spark :init ');
	sparkSDK.login({
		username: settings.username(),
		password: settings.password()
	}, this.onInitSuccess.bind(this));

};

Spark.prototype.callMethod = function(method, params) {
	console.log('Spark :callMethod ' + method + params);
	this.selectedDevice.callFunction(method, params, function(err, data) {
		if (err) {
			console.log('An error occurred:', err);
		} else {
			console.log('Function called succesfully:', data);
		}
	});
};

Spark.prototype.publishEvent = function(event, params) {
	console.log('Spark :callMethod ' + event + ' - ' + params);
	var publishEventPr = sparkSDK.publishEvent(event, {});

	publishEventPr.then(
		function(data) {
			if (data.ok) {
				console.log("Event published succesfully");
			}
		},
		function(err) {
			console.log("Failed to publish event: " + err);
		}
	);
};

module.exports = new Spark();