'use strict';
/**
 * Password based signin and OAuth signin functions.
 */

var jwt = require('koa-jwt');
var config = require('../config/config');
var mongo = require('../config/mongo');
var signin = require('../routes/signin');
var BaseRoute = require('../routes/base-route');
var Routes = require('../collection/Routes');

var User = BaseRoute.extend({
	initialize: function (options) {
		this.routes = new Routes([
			{
				method: 'get',
				path: '/api/user/profile',
				handler: this._profile,
				secured: true
			}, {
				method: 'get',
				path: '/api/user/:id/picture',
				handler: this._getPicture,
				secured: true
			}
		]);
		BaseRoute.prototype.initialize.apply(this, [options]);
	},

	_profile: function *profile() {
		var user;
		var token = signin.getTokenFromHeader(this.request);
		var data = yield jwt.verify(token, config.app.secret);

		user = yield mongo.users.findOne({_id: data._id}, {picture: 1});
		yield this.render('profile', {user:user});
	},

	_getPicture: function *getPicture() {
		var user;
		var token = signin.getTokenFromHeader(this.request);
		var data = yield jwt.verify(token, config.app.secret);

		if (data) {
			user = yield mongo.users.findOne({email: data.email}, {picture: 1});
			this.body = user.picture ? user.picture : '';
		} else {
			this.throw(401, 'Unauthorized');
		}
	}
});

//Create a Singleton.
module.exports = new User();