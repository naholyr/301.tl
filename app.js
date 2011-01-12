require.paths.push('./src');
require.paths.push('./node_modules');

process.chdir(__dirname);

var express = require('express'),
    config = require('node-config'),
    main = require('301.tl'),
    app = main.app(express, config);

console.log('ENV', app.set('env'));

// Start server
app.start();
