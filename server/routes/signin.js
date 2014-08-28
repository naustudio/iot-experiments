/*//global */
'use strict';

/**
 * Password based signin and OAuth signin functions.
 */

var qs = require('querystring'),
	// parse = require('co-body'),
	jwt = require('koa-jwt'),
	request = require('co-request'),
	config = require('../config/config'),
	mongo = require('../config/mongo');
var send = require('koa-send');
var passport = require('koa-passport');
var BaseRoute = require('../routes/base-route');
var Routes = require('../collection/Routes');

// private
var Signin = BaseRoute.extend({
	initialize: function(options) {
		this.routes = new Routes([{
			method: 'get',
			path: '/signin',
			handler: this._getSignin,
			secured: false
		}, {
			method: 'post',
			path: '/signin',
			handler: this._signin,
			secured: false
		}, {
			method: 'get',
			path: '/signout',
			handler: this._signout,
			secured: false
		}, {
			method: 'get',
			path: '/signin/facebook',
			handler: this._facebooksignin,
			secured: false
		}, {
			method: 'get',
			path: '/signin/facebook/callback',
			handler: this._facebookCallback,
			secured: false
		}, {
			method: 'get',
			path: '/signin/google',
			handler: this._googlesignin,
			secured: false
		}, {
			method: 'get',
			path: '/signin/google/callback',
			handler: this._googleCallback,
			secured: false
		}]);
		BaseRoute.prototype.initialize.apply(this, [options]);
	},

	getTokenFromHeader: function(req) {
		var authorization = req.header.authorization;
		var rg = /^bearer /ig;
		var token = authorization ? authorization.replace(rg, '') : '';

		return token;
	},

	_getSignin: function * getSignin() {
		var sendOpts = {
			root: config.publicFolder,
			maxage: config.app.cacheTime
		};
		console.log(console.DEBUG, JSON.stringify(this.cookies.get('token')));
		yield send(this, '/signin.html', sendOpts);
	},

	_signin: function * signin() {
		var returnedUser;

		yield passport.authenticate('local', function * (err, user) {
			returnedUser = user;
			yield {};
		});

		if (!returnedUser) {
			this.redirect('/signin');
		} else {
			//Create token and redirect to profile page if any
			var token = jwt.sign({
				_id: returnedUser._id,
				email: returnedUser.email
			}, config.app.secret, {
				expiresInMinutes: 90 * 24 * 60
			});
			var resData = {
				status: "200",
				token: token,
				user: JSON.stringify(returnedUser)
			};

			yield this.render('rest-sign', resData);
		}
	},

	_signout: function * signout() {
		this.req.logout();
		this.redirect('/');
		yield {};
	},

	_facebooksignin: function * facebooksignin() {
		this.redirect(
			'https://www.facebook.com/dialog/oauth?client_id=' + config.oauth.facebook.clientId +
			'&redirect_uri=' + config.oauth.facebook.callbackUrl + '&response_type=code&scope=email');
		yield {};
	},

	_facebookCallback: function * facebookCallback() {
		if (this.query.error) {
			this.redirect('/signin');
			return;
		}

		// get an access token from facebook in exchange for oauth code
		var tokenResponse = yield request.get(
			'https://graph.facebook.com/oauth/access_token?client_id=' + config.oauth.facebook.clientId +
			'&redirect_uri=' + config.oauth.facebook.callbackUrl +
			'&client_secret=' + config.oauth.facebook.clientSecret +
			'&code=' + this.query.code);
		var token = qs.parse(tokenResponse.body);
		if (!token.access_token) {
			this.redirect('/signin');
			return;
		}

		// get user profile (including email address) from facebook and save user data in our database if necessary
		var profileResponse = yield request.get('https://graph.facebook.com/me?fields=name,email,picture&access_token=' + token.access_token);
		var profile = JSON.parse(profileResponse.body);
		var user = yield mongo.users.findOne({
			email: profile.email
		}, {
			email: 1,
			name: 1
		});
		if (!user) {

			user = {
				_id: (yield mongo.getNextSequence('userId')),
				email: profile.email,
				name: profile.name,
				picture: (yield request.get(profile.picture.data.url, {
					encoding: 'base64'
				})).body
			};
			yield mongo.users.insert(user);
		}

		// redirect the user to index page along with user profile object as query string
		user.id = user._id;
		delete user._id;
		user.picture = 'api/users/' + user.id + '/picture';
		token = jwt.sign(user.id, config.app.secret, {
			expiresInMinutes: 90 * 24 * 60 /* 90 days */
		});
		this.redirect('/sns-signin-callback.html?token=' + encodeURIComponent(token));
	},

	_googlesignin: function * googlesignin() {
		this.redirect('https://accounts.google.com/o/oauth2/auth?client_id=' + config.oauth.google.clientId +
			'&redirect_uri=' + config.oauth.google.callbackUrl + '&response_type=code&scope=profile%20email');
		yield {};
	},

	_googleCallback: function * googleCallback() {
		if (this.query.error) {
			this.redirect('/signin');
			return;
		}
		// get an access token from google in exchange for oauth code
		var tokenResponse = yield request.post('https://accounts.google.com/o/oauth2/token', {
			form: {
				code: this.query.code,
				client_id: config.oauth.google.clientId,
				client_secret: config.oauth.google.clientSecret,
				redirect_uri: config.oauth.google.callbackUrl,
				grant_type: 'authorization_code'
			}
		});
		var token = JSON.parse(tokenResponse.body);
		if (!token.access_token) {
			this.redirect('/signin');
			return;
		}
		// get user profile (including email address) from facebook and save user data in our database if necessary
		var profileResponse = yield request.get('https://www.googleapis.com/plus/v1/people/me?access_token=' + token.access_token);
		var profile = JSON.parse(profileResponse.body);
		console.log('Retrieved profile ' + JSON.stringify(profile));
		var user = yield mongo.users.findOne({
			email: profile.emails[0].value
		}, {
			email: 1,
			name: 1
		});
		if (!user) {

			user = {
				_id: (yield mongo.getNextSequence('userId')),
				email: profile.emails[0].value,
				name: profile.displayName,
				picture: (yield request.get(profile.image.url, {
					encoding: 'base64'
				})).body
			};
			yield mongo.users.insert(user);
		}

		// redirect the user to index page along with user profile object as query string
		user.id = user._id;
		delete user._id;
		user.picture = 'api/users/' + user.id + '/picture';
		token = jwt.sign(user, config.app.secret, {
			expiresInMinutes: 90 * 24 * 60 /* 90 days */
		});
		this.redirect('/sns-signin-callback.html?token=' + encodeURIComponent(token));

	}
});

// export as a single instance.
module.exports = new Signin();