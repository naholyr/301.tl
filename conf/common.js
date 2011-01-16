exports.conf = {
	port:         3000,                          // Server port
	host:         '127.0.0.1',                   // Listen connections from

	url_provider: 'redis',                       // URL provider engine
	redis: {
		host:   '127.0.0.1',
		port:   6379,
		db:     3,                           // Redis database index
		pw:     undefined,                   // Redis password
	},
}
