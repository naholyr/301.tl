exports.home = function(request, response, next) {
	host = request.headers['x-forwarded-host'] || request.host
	if (host.match(/^api\./)) { // http://api.301.tl
		if (request.query.longUrl) { // http://api.301.tl?longUrl=XXX
			var custom_key
			if (request.query.customKey && request.query.customKey.match(/^[a-zA-Z0-9]+$/)) {
				custom_key = request.query.customKey
			}
			request.app.url_provider.encode(request.query.longUrl, custom_key, function(err, key) {
				if (err) {
					response.writeHead(500)
					response.end(err)
				}
				response.writeHead(200, {'Content-Type':'text/plain'})
				response.end('http://301.tl/' + key)
			})	
		} else { // http://api.301.tl/
			response.writeHead(200, {'Content-Type':'text/html'})
			response.end('Usage: <code>http://' + host + '/?longUrl=<url to encode>[&customKey=<my key>]')
		}
	} else { // http://301.tl
		server = request.headers['x-forwarded-server'] || host.replace(/^[^\/]+([^\/\.]+\.[^\/\.]+)(\/.*?)$/, '$1')
		api_url = 'http://api.' + server + '/'
		response.writeHead(200, {'Content-Type':'text/html'})
		response.end('See <a href="' + api_url + '">' + api_url + '</a>')
	}
}

exports.redirect = function(request, response, next) {
	request.app.url_provider.decode(request.params[0], function(err, url) {
		if (err) {
			response.writeHead(500)
			response.end(err)
		} else if (!url) {
			response.writeHead(404)
			response.end('Not Found')
		} else {
			response.writeHead(301, {'Location':url})
			response.end()
		}
	})
}
