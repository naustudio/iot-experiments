'use strict';
// import
var BaseModel = require('../model/BaseModel');

var Client = BaseModel.extend({
	idAttribute: '_id',
	defaults: {
		id: "",
		name: "",
		clientId: "",
		clientSecret: ""
	},

	initialize: function() {
		BaseModel.prototype.initialize.apply(this, arguments);
	}
});

module.exports = Client;