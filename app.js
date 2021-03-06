process.chdir(__dirname);

var main = require('./lib/301.tl');

require('./lib/server')(function(server, conf, express) {
	// main.onPreConfigureRoutes = function(app, conf, express)  { /* prepend your own routes here */ }
	// main.onPostConfigureRoutes = function(app, conf, express) { /* append your own routes here */ }

	main.start(server, conf, express, function(err, url_provider) {
		if (err) {
			throw err;
		}

		// Start server
		server.start(function() {
			console.log('Environment: ' + server.set('env'));
			console.log('Server running at http://' + server.set('host') + ':' + server.set('port'));
		});
	});
});

// Make the process error proof
process.on('uncaughtException', function (err) {
	console.log('[' + new Date() + '] Uncaught exception: ', err.message || err);
	if (typeof err.stack != 'undefined') {
		console.log(err.stack);
	}
});
