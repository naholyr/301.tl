/**
 * require('301.tl') will return a function(callback), where
 * - callback is a function(app, conf, express), called as soon as conf is loaded, where
 *   - app is an modified Express server
 *   - conf is the loaded node-config module
 *   - express is the loaded Express module
 *
 * The 'app' variable is a full Express server, with a new method "start(callback)", where
 * - callback is a function(app, conf, express), called as soon as app starts listening
 *
 * Example:
 * require('301.tl')(function(app, conf, express){
 *   app.start(function(){
 *     console.log('Server running at http://' + app.set('host') + ':' + app.set('port'))
 *   })
 * })
 */

express = require('express')
app = express.createServer()
conf = require('node-config')
routing = require('routing')

module.exports = function(onConfigure) {
	ready = false    // Configuration loaded ?
	started = false  // Called "start()" ?
	onStartCallback = null

	if (typeof onConfigure != 'function') {
		onConfigure = function() { app.start() }
	}

	function start() {
		if (ready && started) {
			// Configuration loaded AND we called "start()"
			host = app.set('host')
			port = app.set('port')
			statics = app.set('static_paths') || []

			// Static providers
			for (var i=0; i<statics.length; i++) {
				app.use(express.staticProvider(statics[i]))
			}

			// Start server
			app.listen(port, host)

			// Callback on started server
			if (typeof onStartCallback == 'function') {
				onStartCallback(app, conf, express)
			}
		}
	}

	// Add a method "run()" on the created
	app.start = function(onStart) {
		started = true
		onStartCallback = onStart
		start()
	}

	// Configuration using node-config
	conf.initConfig(function(err) {
		if (err) {
			throw err
		}

		// Global
		app.configure(function() {
			app.use(express.methodOverride())
			app.use(express.bodyDecoder())
			app.use(app.router)
			for (var i in conf) {
				if (i == 'initConfig') {
					continue
				}
				app.set(i, conf[i])
			}

			// Try to start application (if we already called "start()" and it was not ready yet)
			ready = true
			start()
		})

		// Dev : nice Express error handler
		app.configure('development', function() {
			app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
		})

		// Callback on loaded configuration
		onConfigure(app, conf, express)
	})
}
