// { id: "2", name: "Samplr2", clientId: "xyz123", clientSecret: "ssh-password" }
'use strict';

var BaseCollection = require('../collection/BaseCollection');
var Client = require('../model/Client');

var Clients = BaseCollection.extend({
	model: Client
});

module.exports = Clients;