require.paths.push(__dirname+'/src');

#var bc = require('base-converter');
#console.log(bc.decTo62(1236876123));

var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Coming soon...');
}).listen(8001, "127.0.0.1");
console.log('Server running at http://127.0.0.1:8001/');
