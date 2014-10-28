'use strict';
// import
var BaseModel = require('../model/BaseModel');

var User = BaseModel.extend({
	idAttribute: '_id',
	defaults: {
		username: "",
		password: "",
		accessToken: ""
	},

	initialize: function() {
		BaseModel.prototype.initialize.apply(this, arguments);
	}
});

module.exports = User;