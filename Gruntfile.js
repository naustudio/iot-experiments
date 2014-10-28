/*jshint node: true*/
module.exports = function (grunt) {
	'use strict';
	// show elapsed time at the end
	require('time-grunt')(grunt);
	// automatically load grunt tasks listed in the initConfig
	require('load-grunt-tasks')(grunt);

	// var rewriteModule = require('http-rewrite-middleware');
	/********
	* Load all Grunt Dependency
	***********/
	grunt.loadNpmTasks('grunt-node-inspector');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-karma');

	/*  ========================================================================
							INIT CONFIG
	======================================================================== */
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		//set via prepare-install-files
		PACKAGE_DIR: '',
		BUILD_MODE: '',

		//directories templates
		dirs: {
			assets: '../assets',
			js: 'src/js',
			src: 'src',
			doc: '../docs',
			clientSrc: 'client',
			serverSrc: 'server',
			build: '~build',
			dist: '~dist',
			install: 'assets/install-page',
			upload: '~upload',
			ftpremote: '/iot-experiment/projects/staging',
			ftpdoc: 'iot-experiment/docs'
		},
		//banner metadata displaying copyright notice after minification
		meta: {
			banner: '/*! Karahappy Web Application - NAU Studio' +
				'<%= grunt.template.today("yyyy-mm-dd") %> */'
		},

		jshint: {
			options: {
				reporter: require('jshint-stylish'),
				jshintrc: '.jshintrc',
				globals: { /*empty*/ }
			},
			all: ['<%= dirs.js %>/**/*.js', '!<%= dirs.js %>/lib/**/*.js', '!<%= dirs.js %>/**/compiled.js']
		},

		sass: {
			compile: { // Target
				options: { // Target options
					style: 'expanded'
					// sourcemap: true //need SASS 3.3, install with: gem install sass --pre
				},

				files: [{
					expand: true,
					cwd: '<%= dirs.src %>/css',
					src: ['*.scss', '!foundation.scss'],
					dest: '<%= dirs.src %>/css',
					ext: '.css'
				}]
			}
		},

		preprocess: {
			'app': {
				src: ['<%= dirs.build %>/js/**/*.js', '!<%= dirs.build %>/js/lib/*.js'],
				options: {
					inline: true,
					context: {
						//UAT, PROD, and other flag will be set via set-env task to process.env
						RELEASE: false,
						APP_ID: '<%= pkg.id %>'
					}
				}
			}
		},

		copy: {
			'client-build': {
				expand: true,
				cwd: '<%= dirs.clientSrc %>',
				dest: '<%= dirs.build %>/public',
				src: [
					'*.html',
					'css/**/*.{css,gif,png,jpg,svg,woff,ttf,eot}',
					'js/**/*.{js,json,jsonp}',
					'data/**/*.{js,json,jsonp}',
					'mock/**/*.{js,json,jsonp}',
					'img/**/*.{gif,png,jpg,svg}'
				]
			},
			'server-build': {
				expand: true,
				cwd: '<%= dirs.serverSrc %>',
				dest: '<%= dirs.build %>/server',
				src: [
					'*.*',
					'**/*.*'
				]
			}
		},

		clean: {
			options: {
				force: true
			},

			doc: {
				src: ['<%= dirs.doc %>']
			},

			bundle: {
				src: [
					'<%= dirs.dist %>/js/app',
					'<%= dirs.dist %>/js/framework',
					'<%= dirs.dist %>/js/lib/handlebars.js'
				]
			},

			release: {
				src: ['<%= dirs.build %>']
			},

			upload: {
				src: ['<%= dirs.upload %>', '<%= dirs.dist %>']
			}
		},
		version: {
			'jenkins-build': {
				options: {
					prefix: '"version":\\s+"',
					pkg: {
						//NOTE: this will be overwritten by custom next-version task
						version: '<%= pkg.version %>'
					}
				},
				src: [
					'package.json'
				]
			},
			increment: {
				options: {
					prefix: '"version":\\s+"',
					release: 'patch' //increase the number after second dot, i.e 0.0.1 -> 0.0.2
				},
				src: [
					'package.json'
				]
			}
		},

		/**
		 * For authentication, please create a .ftppass file at this folder with content:
		 *   {
		 *       "alephuser": {
		 *           "username": "alephuser",
		 *           "password": "*********"
		 *       }
		 *   }
		 */
		ftpscript: {
			upload: {
				options: {
					host: 'dev.naustud.io',
					authKey: 'nauFTPUser'
					//, passive: true
				},
				files: [{
					expand: true,
					cwd: '<%= dirs.upload %>',
					src: [
						'**/*.html',
						'**/*.plist',
						'**/*.ipa',
						//exclude
						'!**/.DS_Store',
						'!**/Thumbs.db',
						'!**/CVS',
						'!**/.svn'
					],
					dest: '<%= dirs.ftpremote %>/'
				}]
			},
			test_upload: {
				options: {
					host: 'localhost',
					authKey: 'ftpuser'
					//, passive: true
				},
				files: [{
					expand: true,
					cwd: '<%= dirs.build %>',
					src: [
						'**/**/*.*',
						//exclude
						'!**/.DS_Store',
						'!**/Thumbs.db',
						'!**/CVS',
						'!**/.svn'
					],
					dest: 'projects/karahappy/'
				},{
					expand: true,
					cwd: './',
					src: [
						'Gruntfile.js',
						'package.json',
						'.jscrc',
						'.jshintrc',
						//exclude
						'!**/.DS_Store',
						'!**/Thumbs.db',
						'!**/CVS',
						'!**/.svn'
					],
					dest: 'projects/karahappy/'
				}]
			},
			doc: {
				options: {
					host: 'dev.naustud.io',
					authKey: 'nauFTPUser'
					//, passive: true
				},
				files: [{
					expand: true,
					cwd: '<%= dirs.doc %>',
					src: [
						'**/*',
						//exclude
						'!**/.DS_Store',
						'!**/Thumbs.db',
						'!**/CVS',
						'!**/.svn'
					],
					dest: '<%= dirs.ftpdoc %>/'
				}]
			}
		},

		connect: {
			options: {
				port: 3000,
				livereload: 35729,
				// change this to '0.0.0.0' to access the server from outside
				hostname: '0.0.0.0'
			},
			livereload: {
				options: {
					open: true,
					base: [
						'.',
						'<%= dirs.src %>'
					]
				}
			},
			dev: {
				options: {
					open: true,
					base: [
						'.',
						'<%= dirs.src %>'
					]
				}
			},
			test: {
				options: {
					base: [
						'.',
						'test',
						'<%= dirs.src %>'
					]
				}
			},

			deploy: {
				options: {
					open: true,
					base: [
						'.',
						'deploy',
						'<%= dirs.dist %>'
					]
				}
			}
		},

		watch: {
			sass: {
				files: [
					'<%= dirs.src %>/css/**/*.scss',
					'framework/css/**/*.scss'
				],
				tasks: ['sass']
			},
			livereload: {
				options: {
					livereload: '<%= connect.options.livereload %>'
				},
				files: [
					'.rebooted',
					'<%= dirs.src %>/*.html',
					'<%= dirs.src %>/css/*.css',
					'<%= dirs.src %>/js/**/*.js',
					'<%= dirs.src %>/img/**/*.{gif,jpeg,jpg,png,svg,webp}',
					'framework/js/**/*.js',
					'framework/css/*.css'
				]
			}
		},

		concurrent: {
			dev: {
				tasks: ['nodemon:dev', 'node-inspector:dev', 'watch'],
				options: {
					logConcurrentOutput: true
				}
			},
			uat: {
				tasks: ['nodemon:uat', 'node-inspector:uat', 'watch'],
			},
			'mock-test': {
				tasks: ['nodemon:mock-test', 'node-inspector:dev', 'watch'],
				options: {
					logConcurrentOutput: true
				}
			}
		},

		yuidoc: {
			compile: {
				name: '<%= pkg.name %>',
				description: '<%= pkg.description %>',
				version: '<%= VERSION %>',
				url: '<%= pkg.homepage %>',
				options: {
					exclude: 'lib',
					paths: '<%= dirs.js %>',
					outdir: '<%= dirs.doc %>'
				}
			}
		},

		jasmine: {
			test: {

			}
		},

		uglify: {

		},

		webfont: {
			icons: {
				src: '<%= dirs.assets %>/icons/*.svg', //SVG files to convert
				dest: 'style-guide/source/fonts', //folder to output icons.{svg,eot,ttf,woff} files
				destCss: 'style-guide/source/css/scss/objects/', //folder to output the _icons.scss
				options: {
					templateOptions: {
						baseClass: 'icon',
						classPrefix: 'icon--',
						mixinPrefix: 'icon-'
					},
					hashes: false, //supress hash generation
					types: 'svg,eot,ttf,woff',
					stylesheet: 'scss',
					destHtml: 'style-guide/public/'
				}
			}
		},

		/*server tasks*/
		'node-inspector': {
			dev: {
				'web-port': 8088,
				'web-host': 'localhost',
				'debug-port': 5857,
				'save-live-edit': true,
				'no-preload': true,
				'stack-trace-limit': 4,
				'hidden': ['node_modules']
			}
		},
		nodemon: {
			dev: {
				script: 'server/app.js',
				options: {
					nodeArgs: ['--debug', '--harmony'],
					env: {
						PORT: '5455'
					},
					// omit this property if you aren't serving HTML files and
					// don't want to open a browser tab on start
					callback: function (nodemon) {
						nodemon.on('log', function (event) {
							console.log(event.colour);
						});

						// opens browser on initial server start
						nodemon.on('config:update', function () {
							console.log('config:update');
							/*// Delay before server listens on port
							setTimeout(function () {
								require('open')('http://localhost:5455');
							}, 1000);*/
						});

						// refreshes browser when server reboots
						nodemon.on('restart', function () {
							// Delay before server listens on port
							setTimeout(function () {
								require('fs').writeFileSync('.rebooted', 'rebooted');
							}, 1000);
						});
					}
				}
			},
			uat: {
				script: 'server/app.js',
				options: {
					nodeArgs: ['--debug', '--harmony'],
					env: {
						PORT: '5455'
					},
					// omit this property if you aren't serving HTML files and
					// don't want to open a browser tab on start
					callback: function (nodemon) {
						nodemon.on('log', function (event) {
							console.log(event.colour);
						});

						// opens browser on initial server start
						nodemon.on('config:update', function () {
							console.log('config:update');
							/*// Delay before server listens on port
							setTimeout(function () {
								require('open')('http://localhost:5455');
							}, 1000);*/
						});

						// refreshes browser when server reboots
						nodemon.on('restart', function () {
							// Delay before server listens on port
							setTimeout(function () {
								require('fs').writeFileSync('.rebooted', 'rebooted');
							}, 1000);
						});
					}
				}
			},
			'mock-test': {
				script: 'server/app.js',
				options: {
					nodeArgs: ['--debug', '--harmony'],
					env: {
						PORT: '5455'
					},
					cwd: '<%= dirs.build %>',
					// omit this property if you aren't serving HTML files and
					// don't want to open a browser tab on start
					callback: function (nodemon) {
						nodemon.on('log', function (event) {
							console.log(event.colour);
						});

						// opens browser on initial server start
						nodemon.on('config:update', function () {
							console.log('config:update');
							/*// Delay before server listens on port
							setTimeout(function () {
								require('open')('http://localhost:5455');
							}, 1000);*/
						});

						// refreshes browser when server reboots
						nodemon.on('restart', function () {
							// Delay before server listens on port
							setTimeout(function () {
								require('fs').writeFileSync('.rebooted', 'rebooted');
							}, 1000);
						});
					}
				}
			}
		},

		mochaTest: {
		  server: {
			src: ['test/server/**/*.js'],
			options: {
				reporter: 'spec',
				ui: 'bdd'
			}
		  }
		},
		mochacli: {
		  server: {
			src: ['test/server/**/*.js'],
			options: {
				reporter: 'spec',
				ui: 'bdd',
				harmony: true,
				'harmony-generators': true,
				timeout: 4000
			}

		  }
		},
		loadtest: {

		}
	});

	/*  ========================================================================
								CUSTOM TASKS
	======================================================================== */

	/**
	 * Set main global config for preprocess instruction
	 */
	grunt.task.registerTask('set-env', 'Set global config for UAT or DEV compiler variables',
		function (buildMode) {
			if (!buildMode || buildMode === 'undefined') {
				buildMode = 'DEV';
				grunt.log.warn('Preprocess Flag Undefined, default to: ' + buildMode);
			} else {
				buildMode = buildMode.toUpperCase();
				grunt.log.ok('Preprocess Flag: ' + buildMode);
			}
			//for global grunt config
			grunt.config.set(buildMode, true);
			grunt.config.set('BUILD_MODE', buildMode);
			//for preprocess task, require process's ENV variable
			process.env[buildMode] = true;
			process.env['BUILD_MODE'] = buildMode;
			//setting the version for build-ipa.sh
			process.env['VERSION'] = grunt.config('pkg.version');
		});

	/**
	 * Write the version number to a file in deploy folder
	 */
	grunt.task.registerTask('write-version', 'Write the version number to a file in deploy folder',
		function (/*env*/) {

		});

	/*  ========================================================================
							TASK COMPOSITION (ALIASING)
	======================================================================== */

	/*******************
	 * SUBORDINATE STEPS
	 *******************/

	// Unit testing
	grunt.registerTask('test', 'Validate and unit test this project', ['jshint', 'jasmine']);

	// Validate and prepare original source
	grunt.registerTask('prepare-src', ['test', 'sass']);

	// Copy framework structure
	grunt.registerTask('copy-framework', ['copy:release-framework-lib', 'copy:release-framework-js']);

	// Bundle source for App, requires set-bundle:target
	grunt.registerTask('prepare-bundle', function (/*env*/) {

	});

	/*******************
	 * TESTING
	 *******************/

	grunt.registerTask('dev', function (target) {
		process.env.target = target;
		grunt.task.run([
			'concurrent:dev'
		]);
	});

	grunt.registerTask('mockTest', function () {
		process.env.NODE_ENV = 'test';
		grunt.task.run([
			'concurrent:mock-test'
		]);
	});
	// ### Running the test suites


	/*******************
	 * MAIN STEPS
	 *******************/

	// Increase the current build version for next build
	grunt.registerTask('next-version', 'Increase the current build version for next build', function () {
	});

	// OPTIONAL: Generate documentation
	grunt.registerTask('doc', ['clean:doc', 'yuidoc']);
	grunt.registerTask('upload-doc', ['doc', 'ftpscript:doc']);

	/*******************
	 * ALL-IN-ONE TASKS
	 *******************/
	grunt.registerTask('compile-client', function (/*env*/) {
		grunt.task.run('copy:client-build');
	});

	grunt.registerTask('compile-server', function (/*env*/) {
		grunt.task.run('copy:server-build');
	});

	grunt.registerTask('build-client', function (env) {
		if (!env) {
			env = 'dev';
		}
		grunt.task.run('set-env:' + env, 'compile-client:' + env);
	});

	grunt.registerTask('build-server', function (env) {
		if (!env) {
			env = 'dev';
		}
		grunt.task.run('set-env:' + env, 'compile-server:' + env);
	});

	grunt.registerTask('build', function (env) {
		// grunt.task.run('set-env:' + env, 'apply-version', 'compile:' + env, 'write-version:' + env);
		grunt.task.run('set-env:' + env, 'build-client:' + env);
		grunt.task.run('set-env:' + env, 'build-server:' + env);
	});

	grunt.registerTask('deploy', function (env) {
		grunt.task.run('build:' + env, 'upload');
	});

	// grunt.registerTask('test-server', ['set-env:test', 'mochaTest:server']);
	grunt.registerTask('test-server', ['set-env:test', 'mochacli:server']);
	/*******************
	 * DEFAULT TASK
	 *******************/

	grunt.registerTask('default', ['dev']);
};