'use strict';
// import
var BaseModel = require('../model/BaseModel');
var Users = require('../collection/Users');
var BaseRoute = require('../routes/base-route');
var _ = require('lodash');

var AppData = BaseModel.extend({
	defaults: {
		users: null
	},

	users: function () {
		return this.get('users');
	},

	initialize: function () {
		BaseModel.prototype.initialize.apply(this,arguments);

		this.set('users', new Users());
		console.log('AppData users ' + JSON.stringify(this.users()));
	},

	createMockDataForUsers: function () {
		var users = new Users();

		users.add({ id: "1", username: "bob", password: "secret", name: "Bob Smith" });
		users.add({ id: "2", username: "joe", password: "password", name: "Joe Davis" });
		users.add({ id: "3", username: "testing@facebook.com", password: "abc@123", name: "David J" });
		console.log('AppData users ' + JSON.stringify(users));
		return users;
	},

	getAllRegisteredRoutes: function () {
		return BaseRoute.routes;
	},

	getRoutes: function (path, secured) {
		var routes = this.getAllRegisteredRoutes();
		var finding = [];

		if (secured !== undefined) {
			finding = routes.where({path: path, secured: secured});
		} else {
			finding = routes.where({path: path});
		}

		return finding;
	}

});

module.exports = AppData;