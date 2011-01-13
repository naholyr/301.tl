redis = require('redis')
conv = require('base-converter')

client = null
config = {}

key_long2short = config.key_long2short_callback || function(url) {
	return "url:" + url + ":short"
}

key_short2long = config.key_short2long_callback || function(key) {
	return "url:" + key + ":long"
}

Provider = {

	configure: function(options) {
		config = options
	},

	open: function(callback) {
		client = redis.createClient();
		client.on("connect", function(err) {
			if (typeof config.redis_db != 'undefined') {
				client.select(config.db)
			}
			if (callback) {
				callback(err)
			}
		})
	},

	close: function(callback) {
		client.quit(callback);
	},

	encode: function(url, custom_key, callback) {
		if (typeof callback == 'undefined' && typeof custom_key == 'function') {
			callback = custom_key
			custom_key = undefined
		}
		l2s = key_long2short(url)
		if (custom_key) {
			// Check if key is already used, or register it
			s2l = key_short2long(custom_key)
			client.get(s2l, function(err, old_url) {
				if (old_url) {
					// There is already a url encoded with this key
					if (old_url != url) {
						// This is a problem
						callback("Already used for " + old_url, custom_key, url, false)
					} else {
						// Nothing to do
						callback(err, custom_key, url, false)
					}
				} else {
					// do encode
					client.mset(s2l, url, l2s, custom_key, function(err) {
						callback(err, custom_key, url, true)
					})
				}
			})
		} else {
			// Check if URL is already shortened, or create a new key
			client.get(l2s, function(err, key) {
				if (key != null) {
					// Already shortened : return found key
					callback(err, key, url, false)
				} else {
					// Shorten url : generate unique key and register it
					client.incr(config.incr_key || "url:count", function(err, x) {
						if (err) {
							callback(err)
						} else {
							key = conv.decTo62(x)
							s2l = key_short2long(key)
							client.mset(s2l, url, l2s, key, function(err) {
								callback(err, key, url, true)
							})
						}
					})
				}
			})
		}
	},

	decode: function(key, callback) {
		client.get("url:" + key + ":long", callback)
	}

}

module.exports = Provider
