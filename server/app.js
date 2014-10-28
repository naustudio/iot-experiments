'use strict';

/**
 * Entry point for server app. Initiates database connection and starts listening for requests on configured port.
 */

var config = require('./config/config');
var mongo = require('./config/mongo');
var mongoSeed = require('./config/mongo-seed');
var koaConfig = require('./config/koa');
	// path = require("path"),
var co = require('co');
var koa = require('koa');
var app = koa();
var spark = require('./middlewares/spark-cloud/spark');
var SparkSetting = require('./model/SparkSetting');
//load patch
require('./middlewares/patch');

module.exports = app;
app.keys = [config.app.secret];
app.init = co(function *() {
	// initialize mongodb and populate the database with seed data if empty
	yield mongo.connect();
	yield mongoSeed();

	// koa config
	koaConfig(app);

	//init spark module
	spark.init(new SparkSetting({
		username: config.spark.username,
		password: config.spark.password
	}));
	// create http and websocket servers and start listening for requests
	app.server = app.listen(config.app.port);
	// ws.listen(app.server);
	if (config.app.env !== 'test') {
		console.log('Web server listening on port ' + config.app.port);
	}
});

// auto init if this app is not being initialized by another module (i.e. using require('./app').init();)
if (!module.parent) {
	app.init();
}
