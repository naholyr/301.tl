/**
 * Usage:
 *
 * // Initialize server instance
 * main = require('301.tl')
 *
 * // prepend or append your own routes
 * main.routes.unshift(['all', '/hello', function(req, res, next) { res.send('hello world') }])
 *
 * // configure the specific routes
 * main.routes.err500 = function(err, req, res, next) { ... }
 * main.routes.err404 = function(err, req, res, next) { ... }
 *
 * // Start server
 * main.start(app, conf, express, function(err, url_provider) { ...execute when ready... })
 *
 * // When you use asynchronous calls, you won't want it to throw an exception as it could crash your server and won't be cought by server
 * main.error(error, req, res, next)
 */


/** Module **/


// Routing

exports.routes = [

	// Default = home
	['get',  '/', home],

	// POST = encode
	['post', '/', encodeLongUrl],

	// Other methods = options
	['all', '/', home],

	// Redirection from short to long
	['get',  /^\/([a-zA-Z0-9]+)$/, redirect],

]

exports.statics = [

	__dirname + '/../public',

]


// URL provider
var url_provider
var url_provider_loader = require('url-provider')

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
	app.configure(function() {

		// Static paths
		for (var i=0; i<exports.statics.length; i++) {
			app.use(express.staticProvider(exports.statics[i]))
		}

		// Main configuration : routes of 301.tl
		for (var i=0; i<exports.routes.length; i++) {
			app[exports.routes[i][0]](exports.routes[i][1], exports.routes[i][2])
		}

		// Views
		app.set('view engine', 'ejs')

		// Handle errors (404 or 500)
		app.error(exports.error)

		// Load URL provider
		url_provider_loader.load(conf, function(err, provider) {
			provider.open(function(err) {
				if (err) {
					provider.onError(err)
				} else {
					url_provider = provider
					onReady(err, provider)
				}
			})
		})

	})
}

// Special routes
exports.routes.err404 = function(err, req, res, next) {
	console.log(err + ' - ' + req.method + ' ' + req.url)
	var message = err.message || ('' + err)
	if (req.is('text')) {
		res.send('404 - page not found\n' + message, {'Content-Type':'text/plain'}, 404)
	} else if (req.is('json')) {
		res.send(JSON.stringify({"error":404,"message":message}), {'Content-Type':'application/json'}, 404)
	} else { // default html
		res.send('<h1>404 - page not found</h1><p>' + message + '</p>', {'Content-Type':'text/html'}, 404)
	}
	next()
}
exports.routes.err500 = function(err, req, res, next) {
	var message = err.message || ('' + err)
	if (req.is('text')) {
		res.send('500 - server error\n' + message, {'Content-Type': 'text/plain'}, 500)
	} else if (req.is('json')) {
		res.send(JSON.stringify({"error":500,"message":message}), {'Content-Type':'application/json'}, 500)
	} else { // default html
		res.send('<h1>500 - server error</h1><p>' + message + '</p>', {'Content-Type':'text/html'}, 404)		
	}
}


/** Route actions **/


// Encode long URL
// GET  : api.301.tl?longUrl=XXX[&custom=YYY][&private=0|1]
// POST : curl -d 'longUrl=<my url>&custom=<my key>...' 'http://301.tl'
// JSON : curl -d '{"longUrl":"<my url>","custom":"<my key>"...}' -H 'Content-Type: application/json'
function encodeLongUrl(req, res, next) {
	var host = req.header('x-forwarded-host') || req.host
	var params = (req.method == 'POST' ? req.body : req.query) || {}
	if (params.longUrl) {
		if (req.header('Origin')) {
			sendCORSHeaders(req, res)
		}
		var custom_key = (params.custom && params.custom.match(/^[a-zA-Z0-9]+$/)) ? params.custom : null
		var private = custom_key || params.private == '1'
		url_provider.encode(params.longUrl, {"key":custom_key, "private":private}, function(err, key, url, _new) {
			if (err) {
				exports.error(err, req, res)
			}
			var shortUrl = 'http://' + host + '/' + key
			var status = _new ? 201 : 200
			if (req.is('text')) {
				res.send('shortUrl=' + shortUrl + '\nlongUrl=' + url, {'Content-Type':'text/plain'}, status)
			} else if (req.is('json')) {
				res.send(JSON.stringify({"shortUrl":shortUrl,"longUrl":url}), {'Content-Type':'application/json'}, status)
			} else { // default = html
				res.send('<a href="' + shortUrl +'" title="' + url + '">' + host + '/<strong>' + key + '</strong></a>', {'Content-Type':'text/html'}, status)
			}
		})
	}
	// This is not a shortening request
	else {
		next(new Error('Expected parameter "longUrl"'))
	}
}

// Homepage
function home(req, res, next) {
	if (req.method == 'OPTIONS') {
		sendCORSHeaders(req, res)
		res.send('', {}, 200)
		return;
	}
	var host = req.headers['x-forwarded-host'] || req.host
	// Host "api.301.tl"
	if (host.match(/^api\./)) {
		if (req.query.longUrl) {
			res.header('Access-Control-Allow-Origin', '*')
			res.header('Access-Control-Allow-Methods', 'GET, POST')
			encodeLongUrl(req, res, function(err) {
				req.params.error = err
				homeAPI(req, res, next)
			})
		} else {
			homeAPI(req, res, next)
		}
	} 
	// Other hosts "301.tl" or "www.301.tl" -> main homepage
	else {
		server = req.headers['x-forwarded-server'] || host.replace(/^[^\/]+([^\/\.]+\.[^\/\.]+)(\/.*?)$/, '$1')
		res.render('home', {locals: {host: server}})
	}
}

// API homepage
function homeAPI(req, res, next) {
	var host = req.headers['x-forwarded-host'] || req.host,
            server = req.headers['x-forwarded-server'] || host.replace(/^[^\/]+([^\/\.]+\.[^\/\.]+)(\/.*?)$/, '$1')
	res.render('home-api', {locals: {
		host: server,
		error: (req.params && req.params.error) ? (req.params.error.message || req.params.error) : false,
	}})
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

// Support for CORS
function sendCORSHeaders(req, res) {
	res.header('Access-Control-Allow-Origin', req.header('Origin') || '*')
	res.header('Access-Control-Allow-Methods', 'GET, POST')
	res.header('Access-Control-Allow-Headers', 'Content-Type')
}
