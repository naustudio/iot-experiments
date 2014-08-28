'use strict';

/**
 * Password based signin and OAuth signin functions.
 */
var BaseRoute = require('../routes/base-route');
var Routes = require('../collection/Routes');
// private variables

var AboutMe = BaseRoute.extend({
	initialize: function(options) {
		this.routes = new Routes([{
			method: 'get',
			path: '/aboutme',
			handler: this._aboutMe,
			secured: false
		}]);
		BaseRoute.prototype.initialize.apply(this, [options]);
	},

	_aboutMe: function * aboutMe() {
		yield this.render('about-me', {
			title: 'About me'
		});
	}
});

module.exports = new AboutMe();