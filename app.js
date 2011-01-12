require.paths.push('./src');
require.paths.push('./node_modules');

process.chdir(__dirname);

var express = require('express');
    main = require('301.tl'),
    app = main.app(express);

app.set('port', '8001');

// Start server
app.start();
