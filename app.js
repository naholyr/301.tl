process.chdir(__dirname);

require.paths.unshift('./lib', './node_modules');

var main = require('301.tl');

require('server')(function(server, conf, express) {
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
	console.log('[' + new Date() + '] Uncaught exception: ' + err);
	if (err instanceof Error && err.message != 'Server already opened') {
		console.log(err.stack);
	}
});
