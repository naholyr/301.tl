exports.home = function(request, response, next) {
	response.send('Coming very soon (see http://301.tl/api)\n', {'Content-Type':'text/plain'}, 200)
}

exports.redirect = function(request, response, next) {
	request.app.url_provider.decode(request.params[0], function(err, url) {
		if (err) {
			throw err
		} else if (!url) {
			response.send('Not Found', {'Content-Type':'text/plain'}, 404)
		} else {
			response.send(null, {'Location':url}, 301)
		}
	})
}

exports.api = function(request, response, next) {
	if (request.query.longUrl) {
		var custom_key
		if (request.query.customKey && request.query.customKey.match(/^[a-zA-Z0-9]+$/)) {
			custom_key = request.query.customKey
		}
		request.app.url_provider.encode(request.query.longUrl, custom_key, function(err, key) {
			if (err) {
				response.send(err, {}, 500)
			}
			response.send('http://301.tl/' + key, {'Content-Type':'text/plain'}, 200)
		})
	} else {
		response.send('Usage: ?longUrl=<url to encode>[&customKey=<my key>]', {'Content-Type':'text/plain'}, 200)
	}
}
