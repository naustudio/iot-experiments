'use strict';

var BaseCollection = require('../collection/BaseCollection');
var mongo = require('../config/mongo');
var User = require('../model/User');

var Users = BaseCollection.extend({
	model: User,

	where: function *() {
		var finding = BaseCollection.prototype.where.apply(this, arguments);
		console.log('--- where ' + finding.length);
		if (finding.length) {
			return finding;
		} else {
			console.log('finding ' + JSON.stringify(arguments[0]));
			finding = yield mongo.users.findOne(arguments[0]);
			if (typeof finding === 'object') {
				finding = [new User(finding)];
			}
			if (finding) {
				this.add(finding[0]);
			}
		}

		return finding ? finding : [];
	}
});

module.exports = Users;