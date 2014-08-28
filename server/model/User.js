'use strict';
// import
var BaseModel = require('../model/BaseModel');

var User = BaseModel.extend({
	idAttribute: '_id',
	defaults: {
		id: "",
		name: "",
		password: "",
		dob: null,
		picture: null
	},

	initialize: function() {
		BaseModel.prototype.initialize.apply(this, arguments);
	}
});

module.exports = User;