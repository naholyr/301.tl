// Base module
require.paths.push(__dirname + '/src');

// Bundled dependencies
require.paths.push(__dirname + '/src/301.tl/node_modules');

// Load configuration module
var conf = require('node-config');

// Load configuration and start server as soon as loaded
conf.initConfig(function(err) {
	if (err) {
		require('sys').log('Unable to init config: ' + err);
		return;
	}

	require('301.tl').start(conf);
});
