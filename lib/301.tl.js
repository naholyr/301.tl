/**
 * Usage:
 *
 * // Initialize server instance
 * main = require('301.tl')
 *
 * // prepend or append your own routes
 * main.routes.unshift(['all', '/hello', function(req, res, next) { res.send('hello world') })
 *
 * // configure the specific routes
 * main.routes.err500 = function(err, req, res, next) { ... }
 * main.routes.err404 = function(err, req, res, next) { ... }
 *
 * // Start server
 * main.start(app, conf, express, function(err, url_provider) { ...execute when ready... })
 *
 * // When you use asynchronous calls, you won't want it to throw an exception as it could crash your server and won't be
 * // cought by server
 * main.error(error, req, res, next)
 */

// URL provider
var url_provider

// Error 404 exception (other exceptions are 500)
sys = require('sys')
Error404 = exports.Error404 = function(message) {
	this.name = 'Error404'
	this.message = message // Seems not to be affected with Error.call(...), strange :/
	Error.call(this, message)
	Error.captureStackTrace(this, arguments.callee)
}
sys.inherits(Error404, Error)

// Error handler
exports.error = function(err, req, res, next) {
	if (err instanceof Error404) {
		exports.routes.err404(err, req, res, next)
	} else {
		exports.routes.err500(err, req, res, next)
	}
}

// Method to start server
exports.start = function(app, conf, express, onReady) {

	// Main configuration : routes of 301.tl
	for (var i=0; i<exports.routes.length; i++) {
		app[exports.routes[i][0]](exports.routes[i][1], exports.routes[i][2])
	}

	// Catch-all -> 404
	app.all(/^.*$/, function(req, res, next) {
		throw new Error404()
	})

	// Handle errors (404 or 500)
	app.error(exports.error)

	// Load URL provider
	url_provider = require('url-provider').get(conf.url_provider, conf[conf.url_provider])
	url_provider.open(function(err, provider) {
		onReady(err, provider)
	})
}

// Predefined routes
exports.routes = [
	['all', '/', home],
	['get', /^\/([a-zA-Z0-9]+)$/, redirect],
]

// Special routes
exports.routes.err404 = function(err, req, res, next) {
	res.send('404 - page not found\n' + err.message, {'Content-Type':'text/plain'}, 404)
}
exports.routes.err500 = function(err, req, res, next) {
	res.send(err.message || err, {'Content-Type': 'text/plain'}, 500)
}

// Predefined actions

// Homepage
function home(req, res, next) {
	host = req.headers['x-forwarded-host'] || req.host
	// Host "api.301.tl"
	if (host.match(/^api\./)) {
		// api.301.tl?longURL=XXX[&customKey=YYY] -> shorten URL
		if (req.query.longUrl) { // http://api.301.tl?longUrl=XXX
			var custom_key
			if (req.query.customKey && req.query.customKey.match(/^[a-zA-Z0-9]+$/)) {
				custom_key = req.query.customKey
			}
			url_provider.encode(req.query.longUrl, custom_key, function(err, key) {
				if (err) {
					throw err
				}
				res.send('http://301.tl/' + key, {'Content-Type':'text/plain'})
			})
		}
		// api.301.tl -> API homepage
		else {
			res.send('Usage: <code>http://' + host + '/?longUrl=<url to encode>[&customKey=<my key>]', {'Content-Type':'text/html'})
		}
	} 
	// 301.tl -> main homepage
	else {
		server = req.headers['x-forwarded-server'] || host.replace(/^[^\/]+([^\/\.]+\.[^\/\.]+)(\/.*?)$/, '$1')
		api_url = 'http://api.' + server + '/'
		res.send('See <a href="' + api_url + '">' + api_url + '</a>', {'Content-Type':'text/html'})
	}
}

// Decode URL and redirect
function redirect(req, res, next) {
	key = req.params[0]
	if (!key) {
		throw new Error404('Short URL key required')
	} else {
		url_provider.decode(key, function(err, url) {
			if (err) {
				exports.error(err, req, res, next)
			} else if (!url) {
				exports.error(new Error404('No long URL for key "' + key + '"'), req, res, next)
			} else {
				res.send('', {'Location':url}, 301)
			}
		})
	}
}
