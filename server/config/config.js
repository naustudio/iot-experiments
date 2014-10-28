'use strict';

/**
 * Environment variables and application configuration.
 */

var path = require('path'),
		_ = require('lodash');

var baseConfig = {
	app: {
		root: path.normalize(__dirname + '/../..'),
		env: process.env.NODE_ENV,
		secret: 'secret key' /* used in signing the jwt tokens */
	}
};

var platformConfig = {
	development: {
		app: {
			port: 3000
		},
		publicFolder: './client/',
		mongo: {
			url: 'mongodb://localhost:27017/iot-experiment',//'mongodb://192.168.0.199:27017/iot-experiment'
			dbUser: 'siteadmin',
			password: 'nau@123'
		},
		oauth: {
			facebook: {
				clientId: '273079049543244',
				clientSecret: '38c50c65ac065db468d118c1aa92bcdf',
				callbackUrl: 'http://localhost:3000/signin/facebook/callback'
			},
			google: {
				clientId: '554545289813-0c1hvu2g1dncf6ajpc48nvghog40095i.apps.googleusercontent.com',
				clientSecret: 'cccv0t6x2jaQst0buQ5jmJYC',
				callbackUrl: 'http://localhost:3000/signin/google/callback'
			}
		},
		spark: {
			username: 'device@naustud.io',
			password: 'nau110114',//credential information should be kept secret
		}
	},

	test: {
		app: {
			port: 3001
		},
		publicFolder: './~build/public/',
		mongo: {
			url: 'mongodb://localhost:27017/iot-experiment',
			dbUser: 'siteadmin',
			password: 'nau@123'
		}
	},

	production: {
		app: {
			port: process.env.PORT || 3000,
			cacheTime: 7 * 24 * 60 * 60 * 1000 /* default caching time (7 days) for static files, calculated in milliseconds */
		},
		publicFolder: './public/',
		mongo: {
			url: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://localhost:27017/iot-experiment',
			dbUser: 'admin',
			password: 'abc'
		},
		oauth: {
			facebook: {
				clientId: '231235687068678',
				clientSecret: '4a90381c6bfa738bb18fb7d6046c14b8',
				callbackUrl: 'http://karahappy.com/signin/facebook/callback'
			},
			google: {
				clientId: '147832090796-ckhu1ehvsc8vv9nso7iefvu5fi7jrsou.apps.googleusercontent.com',
				clientSecret: 'MGOwKgcLPEfCsLjcJJSPeFYu',
				callbackUrl: 'http://karahappy.com/signin/google/callback'
			}
		}
	}
};

// override the base configuration with the platform specific values
module.exports = _.merge(baseConfig, platformConfig[baseConfig.app.env || (baseConfig.app.env = 'development')]);
