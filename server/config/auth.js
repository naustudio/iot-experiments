'use strict';
/**
 * Module dependencies.
 */
var passport = require("koa-passport"),
	LocalStrategy = require("passport-local").Strategy,
	BasicStrategy = require("passport-http").BasicStrategy,
	ClientPasswordStrategy = require("passport-oauth2-client-password").Strategy,
	BearerStrategy = require("passport-http-bearer").Strategy;

var app = require('../app');
var co = require('co');
var cryptoUtil = require('../middlewares/crypto-util');
/**
 * LocalStrategy
 *
 * This strategy is used to authenticate users based on a username and password.
 * Anytime a request is made to authorize an application, we must ensure that
 * a user is logged in before asking them to approve the request.
 */
function createVerify(verify) {
  	var _callback = verify;
    verify = function callback(username, password, done) {
      co(function*() {
        yield _callback(username, password, _done);
        function _done (err, user) {
        	return done(err, user);
        }
      })();
    };
    return verify;
}

function *localVerify(username, password, done) {
	var appData = app.appData;
	var users = appData.get('users');

	var finding = yield users.where({'email': username, 'password': cryptoUtil.hexMD5(password)});
	if (finding && finding.length) {
		return done(null, finding[0].toJSON());
	} else {
		return done(null, false);
	}

}
passport.use(new LocalStrategy(
	createVerify(localVerify)
));

passport.serializeUser(function(user, done) {
	done(null, user._id);
});

passport.deserializeUser(function(id, done) {
	// console.log('deserializeUser ' + id);
	var appData = app.appData;
	var users = appData.get('users');
	var finding = users.where({'_id': id});

	if (finding.length) {
		return done(null, finding[0].toJSON());
	} else {
		return done(null, false);
	}
});


/**
 * BasicStrategy & ClientPasswordStrategy
 *
 * These strategies are used to authenticate registered OAuth clients.  They are
 * employed to protect the `token` endpoint, which consumers use to obtain
 * access tokens.  The OAuth 2.0 specification suggests that clients use the
 * HTTP Basic scheme to authenticate.  Use of the client password strategy
 * allows clients to send the same credentials in the request body (as opposed
 * to the `Authorization` header).  While this approach is not recommended by
 * the specification, in practice it is quite common.
 */
passport.use(new BasicStrategy(
	createVerify(basicVerify)
));

function *basicVerify(username, password, done) {
	var appData = app.appData;
	var users = appData.get('users');

	var finding = yield users.where({'email': username, 'password': cryptoUtil.hexMD5(password)});
	if (finding && finding.length) {
		return done(null, finding[0].toJSON());
	} else {
		return done(null, false);
	}

}

passport.use(new ClientPasswordStrategy(
	function(clientId, clientSecret, done) {
		/*db.clients.findByClientId(clientId, function(err, client) {
			if (err) {
				return done(err);
			}
			if (!client) {
				return done(null, false);
			}
			if (client.clientSecret !== clientSecret) {
				return done(null, false);
			}
			return done(null, client);
		});*/
	}
));

/**
 * BearerStrategy
 *
 * This strategy is used to authenticate either users or clients based on an access token
 * (aka a bearer token).  If a user, they must have previously authorized a client
 * application, which is issued an access token to make requests on behalf of
 * the authorizing user.
 */
passport.use(new BearerStrategy(
	function(accessToken, done) {
		/*db.accessTokens.find(accessToken, function(err, token) {
			if (err) {
				return done(err);
			}
			if (!token) {
				return done(null, false);
			}

			if (token.userID !== null) {
				db.users.find(token.userID, function(err, user) {
					if (err) {
						return done(err);
					}
					if (!user) {
						return done(null, false);
					}
					// to keep this example simple, restricted scopes are not implemented,
					// and this is just for illustrative purposes
					var info = {
						scope: "*"
					};
					done(null, user, info);
				});
			} else {
				//The request came from a client only since userID is null
				//therefore the client is passed back instead of a user
				db.clients.findByClientId(token.clientID, function(err, client) {
					if (err) {
						return done(err);
					}
					if (!client) {
						return done(null, false);
					}
					// to keep this example simple, restricted scopes are not implemented,
					// and this is just for illustrative purposes
					var info = {
						scope: "*"
					};
					done(null, client, info);
				});
			}
		});*/
	}
));