'use strict';
/**
 * Password based signin and OAuth signin functions.
 */

// var jwt = require('koa-jwt');
// var config = require('../config/config');
var mongo = require('../config/mongo');
var BaseRoute = require('../routes/base-route');
var Routes = require('../collection/Routes');

var MotionDetector = BaseRoute.extend({
	initialize: function (options) {
		this.routes = new Routes([
			{
				method: 'get',
				path: '/api/motion-detector',
				handler: this._motionDetector,
				secured: false
			}
		]);
		BaseRoute.prototype.initialize.apply(this, [options]);
	},

	_motionDetector: function * motionDetector() {
		var motion = '';

		motion = yield mongo.motion.findOne({});

		var resData = {
			status: "200",
			token: "",
			motion: JSON.stringify(motion)
		};

		yield this.render('rest-motion', resData);
	}
});

//Create a Singleton.
module.exports = new MotionDetector();