'use strict';

var pathToRegexp = require('path-to-regexp');
var methods = require('methods');
var Routes = require('../collection/Routes');
var Backbone = require('backbone');

var BaseRoute = Backbone.View.extend({

	constructor: function () {
		var self = this;
		BaseRoute.count = 0;
		methods.forEach(function(method) {
			self[method] = self._create(method);
		});

		this.del = exports.delete;
		this.all = this._create();

	},

	initialize: function (options) {
		var i, route, app;
		var routes;
		options = options || {};
		this.routes = this.routes || [];
		app = options.app;
		routes = this.routes.where({secured: options.secured});

		for (i = 0; i < routes.length; i++) {
			route = routes[i];
			app.use(this[route.method()](route.path(), route.handler()));
			BaseRoute.routes.add(route);
		}
	},

	destroy: function() {
		this.remove();
	},

	_create: function(method) {
		if (method) {
			method = method.toUpperCase();
		}
		var self = this;
		return function(path, fn) {
			var re = pathToRegexp(path);

			return function * (next) {
				var m;

				// method
				if (method && method !== this.method) {
					return yield next;
				}

				// path
				m = re.exec(this.path);
				if (m) {
					var args = m.slice(1).map(self._decode);
					args.push(next);
					yield fn.apply(this, args);
					return;
				}

				// miss
				yield next;
			};
		};
	},

	_decode: function(val) {
		if (val) {
			return decodeURIComponent(val);
		}
	}
});

BaseRoute.routes = new Routes();

module.exports = BaseRoute;