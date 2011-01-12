exports.conf = function(dirname) {
	var conf = require('node-config');
	if (typeof dirname != 'undefined') {
		conf.currentDirectory = __dirname;
	}
	return conf;
}

exports.start = function(conf) {

	var app = require('express').createServer();

	app.get('/', function(req, res) {
		res.send('Coming soon...');
	});

	app.listen(conf.port, conf.host);
	console.log('Server running at http://' + conf.host + ':' + conf.port);
}
