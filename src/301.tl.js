function configure(app, express, config) {
	// Global
	app.configure(function() {
		app.use(express.methodOverride())
		app.use(express.bodyDecoder())
		app.use(app.router)

		for (var i in config) {
			if (i == 'initConfig') {
				continue
			}
			app.set(i, config[i])
		}

		// Try to start application (if we already called "start()" and it was not ready yet)
		app.ready = true
		start(app, express)
	})

	// Dev : nice Express error handler
	app.configure('development', function(){
		app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
	})
}

function start(app, express) {
	if (!app.ready || !app.started) {
		// Configuration not loaded yet, let's wait for it to load
		return;
	}
	var host = app.set('host'), 
	    port = app.set('port'), 
	    statics = app.set('static_paths') || []

	// Static providers
	for (var i=0; i<statics.length; i++) {
		app.use(express.staticProvider(statics[i]))
	}

	// Start server
	app.listen(port, host)
	console.log('Server running at http://' + host + ':' + port)
}

exports.app = function(express, config, callback) {

	var app = express.createServer()

	app.ready = false    // Configuration loaded ?
	app.started = false  // Called "start()" ?

	app.start = function() {
		app.started = true
		start(app, express)
	}

	// Configuration using node-config
	if (typeof config.initConfig == 'function') {
		config.initConfig(function(err) {
			if (err) {
				throw err
			}

			configure(app, express, config || {})

			if (callback) {
				callback(app, express, config)
			}
		})
	}
}
