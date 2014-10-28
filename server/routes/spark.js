'use strict';
/**
 * Password based signin and OAuth signin functions.
 */

var BaseRoute = require('../routes/base-route');
var Routes = require('../collection/Routes');
var spark = require('../middlewares/spark-cloud/spark');
var config = require('../config/config');
var send = require('koa-send');
var Spark = BaseRoute.extend({
	initialize: function (options) {
		this.routes = new Routes([
			{
				method: 'get',
				path: '/api/spark/call/:method/:param',
				handler: this._callMethod,
				secured: false
			},
			{
				method: 'get',
				path: '/api/spark/publish/:event/:param',
				handler: this._publishEvent,
				secured: false
			}
		]);
		BaseRoute.prototype.initialize.apply(this, [options]);
	},

	_callMethod: function *callMethod(method, param) {
		var sendOpts = {
			root: config.publicFolder,
			maxage: config.app.cacheTime
		};
		yield send(this, '/index.html', sendOpts);
		console.log('Spark :_callMethod ' + method + ' ' + param);
		spark.callMethod(method, param);
	},

	_publishEvent: function *publishEvent(event, param) {
		var sendOpts = {
			root: config.publicFolder,
			maxage: config.app.cacheTime
		};
		yield send(this, '/index.html', sendOpts);
		console.log('Spark :publishEvent ' + event + ' ' + param);
		spark.publishEvent(event, param);
	}
});

//Create a Singleton.
module.exports = new Spark();