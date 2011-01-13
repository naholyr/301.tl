require.paths.push('./src', './node_modules');

process.chdir(__dirname);

var express = require('express'),
    config = require('node-config'),
    main = require('301.tl')

main.app(express, config, function(app, express, config) {
	app.url_provider = require('url-provider').get(config.url_provider, config[config.url_provider])
	app.url_provider.open(function(err) {
		if (err) {
			throw err
		}

		// Configure routing
		require('routing').configure(app)

		console.log('ENV', app.set('env'))

		// Start server
		app.start()
	})
})
