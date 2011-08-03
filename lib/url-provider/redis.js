var redis = require('redis'),
    conv = require('base-converter'),
    client = null,
    config = {};

key_long2short = config.key_long2short_callback || function(url) {
	return "url:" + url + ":short";
};

key_short2long = config.key_short2long_callback || function(key) {
	return "url:" + key + ":long";
};

key_short2stats = config.key_short2stats_callback || function(key) {
	return "url:" + key + ":hits";
};

function dateToString(date) {
	if (typeof date == 'undefined') {
		date = new Date();
	}
	var pad = function(s) {
		s = '' + s; // Convert to string
		while (s.length < 2) {
			s = '0' + s;
		}
		return s;
	};
	var yyyy = date.getFullYear(),
	    mm = pad(date.getMonth() + 1),
	    dd = pad(date.getDate()),
	    HH = pad(date.getHours()),
	    MM = pad(date.getMinutes()),
	    SS = pad(date.getSeconds());

	return yyyy+'-'+mm+'-'+dd+' '+HH+':'+MM+':'+SS;
}

Provider = {

	"onError": function(err) {
		if (err.message.match(/ECONNREFUSED/)) {
			// Let Redis client automatically reconnect
		} else if (err.message.match(/Server already opened/)) {
			// This shit happens after client reconnected, maybe a bug with redis client, I couldn't find out :/
			// Quick 'n dirty fix, very incompatible with high-concurrency access : regenerate client
			console.log('RECONNECTION ERROR ! Recreating client');
			client.end();
			client = null;
			this.open(function(err) {
				console.log('CLIENT RECREATED');
			});
		} else {
			console.log(err);
		}
	},

	"configure": function(options, callback) {
		config = options;
		callback();
	},

	"open": function(callback) {
		client = redis.createClient();
		client.on("connect", function(err) {
			function conn(err) {
				if (!err && typeof config.db != 'undefined') {
					client.select(config.db, callback);
				} else if (callback) {
					callback(err);
				} else if (err) {
					throw err;
				}
			}
			if (typeof config.pw != 'undefined') {
				client.auth(config.pw, conn);
			} else {
				conn(err);
			}
		});
		client.on("error", function(err) {
			Provider.onError(err);
		});
	},

	"close": function(callback) {
		client.quit(callback);
	},

	"encode": function(url, options, callback) {
		if (typeof callback == 'undefined' && typeof options == 'function') {
			callback = options;
			options = {"new":false};
		}
		if (typeof options == 'string' || typeof options == 'undefined') {
			options = {"key":options, "new":false};
		}
		var self = this;
		self.checkUrl(url, function(err, url) {
			if (err) {
				callback(err, null, url, false);
				return;
			}
			var l2s = key_long2short(url);
			if (options.key) {
				// Encode using custom key
				var s2l = key_short2long(options.key);
				client.get(s2l, function(err, old_url) {
					if (err) {
						callback(err, options.key, url, false);
					} else if (old_url) {
						// There is already a url encoded with this key
						if (old_url != url) {
							// This is a problem
							callback(new Error('Key "' + options.key + '" already used for "' + old_url + '"'), options.key, url, false);
						} else {
							// Nothing to do
							callback(err, options.key, url, false);
						}
					} else {
						self.checkKey(options.key, function(err, key) {
							if (err) {
								// Invalid custom key
								callback(err, key, url, false);
							} else {
								// do encode
								client.setnx(s2l, url, function(err, added) {
									if (err) {
										// Failed storing short key -> long url
										callback(err, options.key, url, false);
									} else if (added) {
										// Added short key -> long url, do not store long url -> short key as it's private
										callback(err, options.key, url, true);
									} else {
										// Key already used, this can happen only in case of concurrent access
										client.get(s2l, function(err, old_url) {
											if (err) {
												callback(err, options.key, url, false);
											} else {
												callback(new Error('Key "' + options.key + '" already used for "' + old_url + '"'), options.key, old_url, false);
											}
										});
									}
								});
							}
						});
					}
				});
			} else {
				// Encode using a generated key
				var shorten = function(storeCallback) {
					// Shorten url : generate unique key and register it
					client.incr(config.incr_key || "url:count", function(err, x) {
						if (err) {
							callback(err);
						} else {
							key = conv.decTo62(x);
							s2l = key_short2long(key);
							storeCallback(s2l, url, l2s, key, callback);
						}
					});
				};
				if (!options.private) {
					// Check if URL is already shortened, or create a new key
					client.get(l2s, function(err, key) {
						if (err) {
							callback(err, key, url, false);
						} else if (key != null) {
							// Already shortened : return found key
							callback(err, key, url, false);
						} else {
							shorten(function(s2l, url, l2s, key, callback) {
								// Public shortening : store bilateral relation
								client.msetnx(s2l, url, l2s, key, function(err, added) {
									callback(err, key, url, added);
								});
							});
						}
					});
				} else {
					// Force a new generated key for this URL, without checking if it's already shortened
					shorten(function(s2l, url, l2s, key, callback) {
						// Private shortening : store only short -> long relation
						client.setnx(s2l, url, function(err, added) {
							callback(err, key, url, added);
						});
					});
				}
			}
		});
	},

	"decode": function(key, callback) {
		client.get(key_short2long(key), callback);
	},

	"stats": {

		"hit": function(key, callback) {
			if (!callback) {
				callback = function(err) {
					if (err) {
						console.log(err);
					}
				};
			}
			client.rpush(key_short2stats(key), dateToString(new Date()), callback);
		},

		"get": function(key, callback) {
			Provider.decode(key, function(err, url) {
				if (err || !url) {
					callback(err);
				} else {
					client.llen(key_short2stats(key), function(err, len) {
						callback(err, len, url);
					});
				}
			});
		},

		"getDates": function(key, callback) {
			Provider.decode(key, function(err, url) {
				if (err || !url) {
					callback(err);
				} else {
					client.lrange(key_short2stats(key), 0, -1, function(err, dates) {
						callback(err, dates, url);
					});
				}
			});
		}

	}

};

module.exports = Provider;
