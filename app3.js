var app = require('./node_modules/express').createServer();

app.get('/', function(req, res){
    res.send('Hello World', {'Content-Type':'text/plain'}, 200);
});

app.listen(8001);

/* Apache Bench

Concurrency Level:      50
Time taken for tests:   9.298 seconds
Complete requests:      10000
Failed requests:        0
Write errors:           0
Total transferred:      1950000 bytes
HTML transferred:       110000 bytes
Requests per second:    1075.53 [#/sec] (mean)
Time per request:       46.489 [ms] (mean)
Time per request:       0.930 [ms] (mean, across all concurrent requests)
Transfer rate:          204.81 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   1.1      0      23
Processing:     8   46   4.9     46     113
Waiting:        7   46   4.9     46     113
Total:          8   46   4.8     46     113

Percentage of the requests served within a certain time (ms)
  50%     46
  66%     46
  75%     47
  80%     47
  90%     48
  95%     51
  98%     59
  99%     62
 100%    113 (longest request)

*/
