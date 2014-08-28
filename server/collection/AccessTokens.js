// { id: "2", name: "Samplr2", clientId: "xyz123", clientSecret: "ssh-password" }
'use strict';

var BaseCollection = require('../collection/BaseCollection');
var AccessToken = require('../model/AccessToken');

var AccessTokens = BaseCollection.extend({
	model: AccessToken
});

module.exports = AccessTokens;