'use strict';
// import
var fs = require('fs');
var logger = require('koa-logger');
var send = require('koa-send');
var jwt = require('koa-jwt');
var livereload = require('koa-livereload');
var config = require('./config');
var passport = require("koa-passport");
var path = require('path');
var hbs = require('koa-hbs');
var AppData = require('../model/AppData');

module.exports = function(app) {
	// middleware configuration

	app.appData = new AppData();
	var templatePath = path.resolve(__dirname, '../templates/views');

	// koa-hbs is middleware. 'use' it before you want to render a view
	app.use(hbs.middleware({
		viewPath: templatePath + ''
	}));

	// enable logger when in test | dev
	if (config.app.env !== 'test') {
		app.use(logger());
	}

	if (config.app.env === 'development') {
		app.use(livereload());
	}

	app.use(require("koa-bodyparser")());
	app.use(require("koa-session")());

	app.use(passport.initialize());
	app.use(passport.session());
	require("./auth");

	// app.use(serve(config.publicFolder));
	// serve the static files from the /client directory
	var sendOpts = {
		root: config.publicFolder,
		maxage: config.app.cacheTime
	};

	app.use(function * (next) {
		// parse cookie
		var cookieToken = this.cookies.get('token');
		var header = this.request.header;

		if (cookieToken) {
			this.request.header.authorization = 'Bearer ' + cookieToken;
		} else if (!header) {
			header = {authorization: 'Bearer'};
		}
		// skip any route that starts with /api as it doesn't have any static files
		var path = this.path.toLowerCase();
		// TODO Find a way to search route quickly. This is significant performance problem
		// Because it check every request to the server
		var route = app.appData.getRoutes(path);

		//Check if there is no static file for this path
		if (route && route.length > 0) {
			yield next;
			return;
		}

		// if the requested path matched a file and it is served successfully, exit the middleware
		if (yield send(this, this.path, sendOpts)) {
			return;
		}

		// if given path didn't match any file, just let angular handle the routing
		yield send(this, '/index.html', sendOpts);
	});

	//load and register router that does not required security
	loadAPIRoutes('./server/routes', {
		app: app,
		secured: false
	});

	//middleware below this line is only reached if jwt token is valid
	app.use(jwt({
		secret: config.app.secret,
		issuer: '/signin'
	}));
	//load and register router that does required security
	loadAPIRoutes('./server/routes', {
		app: app,
		secured: true
	});
};

function loadAPIRoutes(path, options) {
	var apiPath = path;
	var existing = fs.existsSync(apiPath);

	if (existing) {
		var stats = fs.statSync(apiPath);
		if (stats.isDirectory()) {
			fs.readdirSync(apiPath).forEach(function(file) {
				loadAPIRoutes(apiPath + '/' + file.toString(), options);
			});

			return true;
		} else if (stats.isFile()) {
			var loaded = require(process.cwd() + '/' + apiPath);
			if (loaded.initialize) {
				loaded.initialize(options);
			}
		}

	}
	return true;
}