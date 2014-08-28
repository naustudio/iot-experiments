'use strict';

var BaseCollection = require('../collection/BaseCollection');
var Route = require('../model/Route');
var _ = require('lodash');

var Routes = BaseCollection.extend({
	model: Route,

	where: function (criteria) {
		if (!criteria.path) {
			return BaseCollection.prototype.where.apply(this, arguments);
		} else {
			var finding = _.where(this.models, function (model) {
				var matched = model.match(criteria.path);
				if (criteria.secured !== undefined) {
					matched = (model.secured === criteria.secured);
				}
				return matched;
			});
			return finding;
		}
	}
});

module.exports = Routes;