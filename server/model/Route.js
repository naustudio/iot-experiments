/*global unescape*/
'use strict';
// import
var BaseModel = require('../model/BaseModel');

var Route = BaseModel.extend({
	idAttribute: '_id',
	defaults: {
		method: "",
		path: "",
		handler: null,
		secured: false
	},

	route: null,

	initialize: function() {
		BaseModel.prototype.initialize.apply(this, arguments);
		this.route = new BaseRoute(this.path());
	},

	match: function(uri, startAt) {
		var captures, i = startAt || 0;
		var route = this.route;
		var re = route.re;
		var keys = route.keys;
		var splats = [];
		var params = {};
		var len;

		captures = uri.match(re);
		if (captures) {
			len = captures.length;
			for (var j = 1; j < len; ++j) {
				var key = keys[j - 1],
					val = typeof captures[j] === 'string' ? unescape(captures[j]) : captures[j];
				if (key) {
					params[key] = val;
				} else {
					splats.push(val);
				}
			}
			return {
				params: params,
				splats: splats,
				route: route.src,
				next: i + 1
			};
		}

		return false;
	}
});

var BaseRoute = function(path) {
	//using 'new' is optional
	var src, re, keys = [];
	if (path instanceof RegExp) {
		re = path;
		src = path.toString();
	} else {
		re = pathToRegExp(path, keys);
		src = path;
	}
	return {
		re: re,
		src: path.toString(),
		keys: keys
	};
};

/**
 * Normalize the given path string,
 * returning a regular expression.
 *
 * An empty array should be passed,
 * which will contain the placeholder
 * key names. For example "/user/:id" will
 * then contain ["id"].
 *
 * @param {String} path
 * @param {Array} keys
 * @return {RegExp}
 */
var pathToRegExp = function(path, keys) {
	path = path
		.concat('/?')
		.replace(/\/\(/g, '(?:/')
		.replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?|\*/g, function(_, slash, format, key, capture, optional) {
			if (_ === "*") {
				keys.push(undefined);
				return _;
			}
			keys.push(key);
			slash = slash || '';
			return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (format || '') + (capture || '([^/]+?)') + ')' + (optional || '');
		})
		.replace(/([\/.])/g, '\\$1')
		.replace(/\*/g, '(.*)');
	return new RegExp('^' + path + '$', 'i');
};

module.exports = Route;