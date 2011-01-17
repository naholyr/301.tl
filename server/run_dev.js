// Hint : you'd better use a dedicated binary for this, like "node-dev"
// See https://github.com/fgnass/node-dev

var app_script = 'app.js',
    child_process = require('child_process'),
    fs = require("fs"),
    sys = require("sys");

var dev_server = {

    process: null,

    files: [],

    restarting: false,

    "restart": function() {
        this.restarting = true;
        sys.debug('DEVSERVER: Stopping server for restart');
        this.process.kill();
    },

    "start": function() {
        var self = this;
        sys.debug('DEVSERVER: Starting server');
        self.watchFiles();

        this.process = child_process.spawn(process.ARGV[0], [app_script]);

        this.process.stdout.addListener('data', function (data) {
            process.stdout.write(data);
        });

        this.process.stderr.addListener('data', function (data) {
            sys.print(data);
        });

        this.process.addListener('exit', function (code) {
            sys.debug('DEVSERVER: Child process exited: ' + code);
            this.process = null;
            if (self.restarting) {
                self.restarting = true;
                self.unwatchFiles();
                self.start();
            }
        });

    },

    "watchFiles": function() {
        var self = this;

        child_process.exec('find . | grep "\.js$"', function(error, stdout, stderr) {
            var files = stdout.trim().split("\n");

            files.forEach(function(file) {
                self.files.push(file);
                fs.watchFile(file, {interval : 500}, function(curr, prev) {
                    if (curr.mtime.valueOf() != prev.mtime.valueOf() || curr.ctime.valueOf() != prev.ctime.valueOf()) {
                        sys.debug('DEVSERVER: Restarting because of changed file at ' + file);
                        dev_server.restart();
                    }
                });
            });
        });
   },

    "unwatchFiles": function() {
        this.files.forEach(function(file) {
            fs.unwatchFile(file);
        });
        this.files = [];
    }
};


dev_server.start();
