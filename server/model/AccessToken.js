'use strict';
// import
var BaseModel = require('../model/BaseModel');

var AccessToken = BaseModel.extend({
	defaults: {
		users: null
	},
	tokens: {},

	initialize: function () {
		BaseModel.prototype.initialize.apply(this,arguments);
	},

	find: function(key, done) {
		var code = this.codes[key];
		return done(null, code);
	},

	save: function(token, userID, clientID, done) {
		this.tokens[token] = { userID: userID, clientID: clientID };
  		return done(null);
	}
});

module.exports = AccessToken;