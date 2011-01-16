// Usages :
// require('url-provider').load({url_provider:'redis', redis:{db: 'mydb'}}, function(err, provider) { ... })
// require('url-provider').load('redis', {db: 'mydb'}, function(err, provider) { ... })
exports.load = function(type, config, callback) {
	if (typeof type == 'object' && typeof config == 'function' && typeof callback == 'undefined') {
		callback = config
		config = type
		type = config.url_provider
		config = config[type] || {}
	}

	// Load provider
	p = require(__dirname + '/' + type)

	// Copy methods from base class
	for (var m in Provider) {
		if (typeof p[m] == 'undefined') {
			p[m] = Provider[m]
		}
	}

	// Configure provider and execute callback when configuration ended
	p.configure(config, function(err) {
		callback(err, p)
	})
}

// Base providers methods
var StatsProvider = {
	hit: function(key, callback) { if (callback) callback(new Error('Not implemented')) /* callback(err, hits) */ },
	get: function(key, callback) { callback(new Error('Not implemented'))               /* callback(err, hits as int, longUrl) */ },
	getDates: function(key, callback) { callback(new Error('Not implemented'))          /* callback(err, hits as object date => int, longUrl) */ },
}
var Provider = {
	stats:     StatsProvider,
	onError:   function(err) { console.log(err.message) },
	configure: function(options, callback) { callback() },
	open:      function(callback) { callback() },
	close:     function(callback) { callback() },
	encode:    function(url, options, callback) { callback(new Error('Not implemented'), undefined, url, false) },
	decode:    function(key, callback) { callback(new Error('Not implemented'), undefined) },
	check:     function(url, callback) {
		if (!url.match(/:\/\//)) {
			url = "http://" + url
		}
		if (!url.match(/^[a-zA-Z0-9]+:\/\/\w+(\.\w+)+/)) {
			callback(new Error('Invalid URL'), url)
			return;
		}
		callback(undefined, url)
	},
}
