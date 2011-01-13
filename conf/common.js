exports.conf = {
	port:         3000,                          // Server port
	host:         '127.0.0.1',                   // Listen connections from
	static_paths: [process.cwd() + '/public'],   // Static paths

	url_provider: 'redis', // URL provider engine
	redis: {
		db:     '301tl', // Redis database
	},
}
