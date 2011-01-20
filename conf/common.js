exports.conf = {
	port:         3000,                          // Server port
	host:         '127.0.0.1',                   // Listen connections from

	url_provider: 'redis',                       // URL provider engine
	redis: {
		host:   '127.0.0.1',
		port:   6379,
		db:     3,                           // Redis database index
		pw:     undefined                    // Redis password
	},

	ajax_allowed_hosts: '*',                     // '*' or list of authorized hosts like "http://mysite.com"

	static_enabled: true,                        // Set it to false if static files are served by another server

	view: {
		helpers: {
			site_name:  '301 ✄ url Too Long',
			host:       '301.tl',
			api_host:   'api.301.tl',
			static_host:'static.301.tl',
                        site_title: 'shorten Too Long URLs'
                },
		dynamicHelpers: {
		}
	}
};
