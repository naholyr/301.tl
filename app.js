require.paths.push('./src', './node_modules');

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
