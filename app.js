require.paths.push(__dirname+'/src');

var conf = require('node-config');
conf.currentDirectory = __dirname;

conf.initConfig(function(err) {
	if (err) {
		require('sys').log('Unable to init config: ' + err);
		return;
	}

	require('301tl').start(conf);
});
