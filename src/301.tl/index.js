function routing(app, express) {

	app.get('/', function(req, res) {
		res.send('Coming soon...');
	});

}

function configure(app, express, config) {
	// Global
	app.configure(function() {
		app.use(express.methodOverride());
		app.use(express.bodyDecoder());
		app.use(app.router);

		// Configuration using node-config
		if (typeof config.initConfig == 'function') {
			config.initConfig(function(err) {
				if (err) {
					throw err;
				}
				for (var i in config) {
					if (i == 'initConfig') {
						continue;
					}
					app.set(i, config[i]);
				}
				// Try to start application (if we already called "start()" and it was not ready yet)
				app.ready = true;
				handler.emit("start", app, express);
			});
		}
	});

	// Dev
	app.configure('development', function(){
		app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	});

	// Prod
	app.configure('production', function(){
		app.use(express.errorHandler());
	});
}

var events = require('events');
var handler = new events.EventEmitter();
handler.addListener("start", function(app, express) {
	if (!app.ready || !app.started) {
		// Configuration not loaded yet, let's wait for it to load
		return;
	}
	var host = app.set('host'), 
	    port = app.set('port'), 
	    statics = app.set('static_paths') || [];

	// Static providers
	for (var i=0; i<statics.length; i++) {
		app.use(express.staticProvider(statics[i]));
	}

	// Start server
	app.listen(port, host);
	console.log('Server running at http://' + host + ':' + port);
});

exports.app = function(express, config) {

	var app = express.createServer();

	app.ready = false;   // Configuration loaded ?
	app.started = false; // Called "start()" ?

	app.start = function() {
		app.started = true;
		handler.emit("start", app, express);
	}

	configure(app, express, config || {});
	routing(app, express);

	return app;
}
