exports.home = function(request, response, next) {
	response.send('Coming very soon', {'Content-Type':'text/plain'}, 200)
}

exports.redirect = function(request, response, next) {
	p = request.app.url_provider
	p.decode(request.params[0], function(err, url) {
		if (err) {
			throw err
		} else if (!url) {
			response.send('Not Found', {'Content-Type':'text/plain'}, 404)
		} else {
			response.send(null, {'Location':url}, 301)
		}
	})
}
