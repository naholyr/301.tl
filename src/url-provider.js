exports.get = function(type, config) {
	p = require('url-provider-' + type)
	p.configure(config)

	return p
}
