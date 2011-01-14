exports.routes = {

	default: {
		url: '/',
		module: 'default',
		action: 'home',
	},

	redirect: {
		url: /^\/([a-zA-Z0-9]+)$/,
		module: 'default',
		action: 'redirect',
	},

	err404: {
		handler: function(req, res, next) {
			throw "toto";
		}
	},

}
