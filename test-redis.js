var redis = require('redis'),
    client = redis.createClient();

redis.debug_mode = true;

client.on("connect", function() {
	this.select(2, function() { console.log("toto") });
	this.incr('toto', redis.print);
	this.quit();
});

console.log(redis.createClient);
