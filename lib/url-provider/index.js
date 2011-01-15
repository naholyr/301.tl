exports.get = function(type, config) {
	p = require(__dirname + '/' + type)
	p.configure(config)

	return p
}
