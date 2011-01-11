exports.start = function(conf) {
	require('http').createServer(function (req, res) {
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('Coming soon !');
	}).listen(conf.port, conf.host);
	console.log('Server running at http://127.0.0.1:8001/');
}
