'use strict';

var Backbone = require('backbone');

var BaseCollection = Backbone.Collection.extend({
	initialize: function () {
		Backbone.Collection.prototype.initialize.apply(this,arguments);
	}
});

module.exports = BaseCollection;