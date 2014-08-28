'use strict';

/**
 * Entry point for server app. Initiates database connection and starts listening for requests on configured port.
 */

var config = require('./config/config'),
		mongo = require('./config/mongo'),
		mongoSeed = require('./config/mongo-seed'),
		koaConfig = require('./config/koa'),
		// path = require("path"),
		co = require('co'),
		koa = require('koa'),
		app = koa();
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

	// create http and websocket servers and start listening for requests
	app.server = app.listen(config.app.port);
	// ws.listen(app.server);
	if (config.app.env !== 'test') {
		console.log('Karahappy listening on port ' + config.app.port);
	}
});

// auto init if this app is not being initialized by another module (i.e. using require('./app').init();)
if (!module.parent) {
	app.init();
}
