require.paths.push('./src');
require.paths.push('./node_modules');

process.chdir(__dirname);

var express = require('express'),
    config = require('node-config'),
    main = require('301.tl'),
    app = main.app(express, config);

// Configure routing
require('routing').configure(app);

console.log('ENV', app.set('env'));

// Start server
app.start();

/* Apache Bench

Concurrency Level:      50
Time taken for tests:   43.096 seconds
Complete requests:      10000
Failed requests:        0
Write errors:           0
Total transferred:      1950000 bytes
HTML transferred:       110000 bytes
Requests per second:    232.04 [#/sec] (mean)
Time per request:       215.482 [ms] (mean)
Time per request:       4.310 [ms] (mean, across all concurrent requests)
Transfer rate:          44.19 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   1.2      0      20
Processing:    15  215  33.0    218     652
Waiting:       15  215  33.0    218     652
Total:         28  215  32.8    218     653

Percentage of the requests served within a certain time (ms)
  50%    218
  66%    221
  75%    222
  80%    224
  90%    241
  95%    257
  98%    288
  99%    323
 100%    653 (longest request)

*/
