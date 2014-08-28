'use strict';

var Backbone = require('backbone');
var _ = require('lodash');

var BaseModel = Backbone.Model.extend({
	constructor: function () {
		if (BaseModel.prototype.defaults !== this.defaults) {
			_.defaults(_.cloneDeep(this.defaults), BaseModel.prototype.defaults);
		}
		Backbone.Model.apply(this, arguments);
	},

	initialize: function () {
		Backbone.Model.prototype.initialize.apply(this,arguments);
		this._createGetters();
	},

	_createGetters: function () {
		function createGetter(prop) {
			return function () {
				return this.get(prop);
			};
		}

		for (var name in this.attributes) {
			if (name !== 'id' && name !== this.idAttribute) {
				this[name] = createGetter(name);
			}
		}

	}
});

module.exports = BaseModel;