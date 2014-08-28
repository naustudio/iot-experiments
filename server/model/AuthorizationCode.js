'use strict';
// import
var BaseModel = require('../model/BaseModel');

var AuthorizationCode = BaseModel.extend({
	defaults: {
		users: null
	},

	codes: {},

	initialize: function() {
		BaseModel.prototype.initialize.apply(this, arguments);
	},

	find: function(key, done) {
		var code = this.codes[key];
		return done(null, code);
	},

	save: function(code, clientID, redirectURI, userID, done) {
	  this.codes[code] = { clientID: clientID, redirectURI: redirectURI, userID: userID };
	  return done(null);
	}
});

module.exports = AuthorizationCode;