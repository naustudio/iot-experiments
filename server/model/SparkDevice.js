'use strict';
// import
var BaseModel = require('../model/BaseModel');

var SparkDevice = BaseModel.extend({
	idAttribute: '_id',
	defaults: {
		name: "",
		variables: "",
		connected: "",
		functions: ""
	},

	initialize: function() {
		BaseModel.prototype.initialize.apply(this, arguments);
	}
});

module.exports = SparkDevice;