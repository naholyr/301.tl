var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(8001, "127.0.0.1");

/* Apache Bench

Concurrency Level:      50
Time taken for tests:   8.516 seconds
Complete requests:      10000
Failed requests:        0
Write errors:           0
Total transferred:      1530000 bytes
HTML transferred:       120000 bytes
Requests per second:    1174.24 [#/sec] (mean)
Time per request:       42.581 [ms] (mean)
Time per request:       0.852 [ms] (mean, across all concurrent requests)
Transfer rate:          175.45 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.7      0      10
Processing:     5   42   8.8     39     156
Waiting:        3   42   8.8     39     156
Total:         13   42   8.7     39     156

Percentage of the requests served within a certain time (ms)
  50%     39
  66%     40
  75%     43
  80%     44
  90%     51
  95%     59
  98%     73
  99%     78
 100%    156 (longest request)

*/
