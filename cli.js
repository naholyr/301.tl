//#!/usr/bin/env node

require.paths.push('./src', './node_modules');

process.chdir(__dirname);

var conf = require('node-config');

conf.initConfig(function(err) {

	if (process.argv.length < 4 || (process.argv[2] != 'encode' && process.argv[2] != 'decode')) {
		process.stdout.write("Usage :\ncli.js encode <url> [<custom key>]\ncli.js decode <key>\n");
		process.exit(1);
	}

	provider = require('url-provider').get(conf.url_provider, conf[conf.url_provider]);
	provider.open(function(err) {
		if (err) {
			throw err;
		}

		switch (process.argv[2]) {
			case 'encode':
				provider.encode(process.argv[3], process.argv[4], function(err, key) {
					if (err) {
						throw err;
					}
					process.stdout.write(key + "\n");
					provider.close();
				});
				break;
			case 'decode':
				provider.decode(process.argv[3], function(err, url) {
					if (err) {
						throw err;
					}
					process.stdout.write(url + "\n");
					provider.close();
				});
				break;
			default:
				throw "Unknown command, use 'encode' or 'decode'";
		}
	});

});
