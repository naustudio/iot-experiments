'use strict';
var crypto = require('crypto');

module.exports.hexMD5 = function (value) {
	var hash = crypto.createHash('md5');

	hash.update(value, 'utf8');

	return hash.digest('hex');
};
