npm = require('npm')

npm.load({}, function (err) {
	console.log(err)
	npm.commands.bundle([], function (err, data) {
		console.log(err, data)
	})
})
