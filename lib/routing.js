/**
 * ! IMPORTANT NOTE ABOUT PERFORMANCES !
 * "require()" is a costing operation, executing a "require()" on each request could break your perfs down, that's why you should ABSOLUTELY AVOID
 * using ":module" in your URLs. Still, it's possible, but seriously, don't use it :)
 * tested with "ab -n 10000 -c 50" -> with a require() in the request handler median ~= 300, without median ~= 45.
 * If you explicitely declare the module used by your route in options, it will be loaded and cached once for all when server starts, which explains
 * the gain.
 * 
 * in conf/routes.js:
 *
 * exports.routes = {
 *   // "/my/url/hello/world" will execute "require('my_module').my_action(req, res, next)"
 *   route1: {
 *     url: '/my/url/:param1/:param2',
 *     module: 'my_module', 
 *     action: 'my_action',
 *     params: { param3: 'hello' }
 *   }
 * }
 *
 * Everything is optional except "url".
 * 
 * You can use ":module" and ":action" in URL to let them be entered in URL.
 *
 * Instead of using module/action you can directly define an option "handler" in your route, which will be a function(req, res, next){...}
 *
 * Special routes :
 *  - 'err404' and 'err500' are special routes that can omit "url" option. They'll be used in case of uncatched exception, or page not found.
 *    note that in development mode, you won't see these routes used as the error is handled by standard Express error handler.
 */
module.exports = function(app, controllers_dir) {
	// Default routes, catch-all
	var routes = {
		homepage: { url: '/',  module:'default' },
		default:  { url: '/:module(/:action)?'  },
	}

	// Load routes from "routes.js"
	try {
		conf = require(process.cwd() + '/conf/routes')
		routes = conf.routes
	} catch (e) {
		console.warn('Warning : Cannot load routes from "routes" module. Using defaults.')
	}

	// Override with "routes-NODE_ENV.js"
	try {
		conf = require(process.cwd() + '/conf/routes-'+app.set('env'))
		for (var r in conf.routes) {
			routes[r] = conf.routes[r]
		}
	} catch (e) {
		console.info('Info : No dedicated routes for environment "' + app.set('env') + '"')
	}

	// Default controllers dir = "controllers"
	if (typeof controllers_dir == 'undefined') {
		controllers_dir = 'controllers'
	}
	if (controllers_dir != '' && controllers_dir.charAt(controllers_dir.length-1) != '/') {
		controllers_dir += '/'
	}

	/**
	 * Generates request handler for given route
	 */
	function getRouteHandler(route) {
		var params = route.params || {}
		return function(req, res, next) {
			if (typeof req.params.module == 'undefined') {
				req.params.module = route.module || 'default'
			}
			if (typeof req.params.action == 'undefined') {
				req.params.action = route.action || 'default'
			}
			for (var p in params) {
				if (typeof req.params[p] == 'undefined') {
					req.params[p] = params[p]
				}
			}
			(route.handler || (cached_controller_modules[req.params.module] || require(controllers_dir + req.params.module))[req.params.action])(req, res, next)
		}
	}

	// Load routes and listen to given methods
	for (var routeName in routes) {
		var route = routes[routeName]
		if (typeof route.url == 'undefined') {
			if (routeName == 'err404' || routeName == 'err500') {
				continue
			}
			throw "ConfigErrorRouteUrlIsMandatory"
		}
		var methods = route.method || ['all'];
		if (!(methods instanceof Array)) {
			methods = [methods]
		}
		if (typeof route.module != 'undefined') {
			try {
				mod = require(controllers_dir + route.module)
				cached_controller_modules[route.module] = mod
			} catch (e) {
				// skip
			}
		}
		for (var i=0; i<methods.length; i++) {
			app[methods[i]](route.url, getRouteHandler(route))
		}
	}

	// Basic error handler
	function Error404(msg) {
		this.name = 'Error404'
		Error.call(this, msg)
		Error.captureStackTrace(this, arguments.callee)
	}
	require('sys').inherits(Error404, Error)

	app.all(/.* /, function(req, res, next) {
		throw new Error404()
	})
	app.error(function(err, req, res, next) {
		if (err instanceof Error404) {
			if (typeof routes.err404 != 'undefined') {
				req.params.err = err
				getRouteHandler(routes.err404)(req, res, next)
			} else {
				res.send('404 - Not Found', {'Content-Type': 'text/plain'}, 404)
			}
		} else {
			if (typeof routes.err500 != 'undefined') {
				req.params.err = err
				getRouteHandler(routes.err500)(req, res, next)
			} else {
				next(err)
			}
		}		
	})
}

var cached_controller_modules = {}
