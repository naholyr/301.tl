function routing(app, express) {
	app.get('/', function(req, res) {
		res.send('Coming soon...');
	});
}

function configure(app, express) {
	// Global
	app.configure(function() {
		app.use(express.methodOverride());
		app.use(express.bodyDecoder());
		app.use(app.router);
		// Configuration variables
		app.set('host', '127.0.0.1');
		app.set('port', 3000);
		app.set('static_paths', [process.cwd() + '/public']);
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

exports.app = function(express) {
	var app = express.createServer();

	app.start = function() {
		var host = this.set('host'), 
		    port = this.set('port'), 
		    statics = this.set('static_paths') || [];

		// Static providers
		for (var i=0; i<statics.length; i++) {
			app.use(express.staticProvider(statics[i]));
		}

		// Start server
		app.listen(port, host);
		console.log('Server running at http://' + host + ':' + port);
	}

	configure(app, express);
	routing(app, express);

	return app;
}
