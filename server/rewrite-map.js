//#!/usr/bin/env node

ready = false;

// Key decoding
var provider;
function decode(key) {
	if (ready) {
		provider.decode(key, function(err, url) {
			if (err || !url) {
				process.stdout.write("NULL\n");
			} else {
				process.stdout.write(url + "\n");
			}
		});
	} else {
		// wait to be ready...
		setTimeout(function() { decode(key); }, 100);
	}
}

// Read keys from stdin
stdin = process.openStdin();
stdin.setEncoding('utf8');
stdin.on('data', function (data) {
	data = data.replace(/\n$/, '');
	decode(data);
});

// Load URL provider
require.paths.push('./src', './node_modules');
process.chdir(__dirname + '/..');
conf = require('node-config');
conf.initConfig(function(err) {
	if (err) {
		throw err;
	}
	provider = require('url-provider').get(conf.url_provider, conf[conf.url_provider]);
	provider.open(function(err) {
		ready = true;
	});
});

