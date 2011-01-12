exports.default = function(request, response, next) {
console.log(request);
	response.send('Coming soon', {'Content-Type':'text/plain'}, 200);
}
