Dependencies
------------

* [Node.JS](https://github.com/ry/node)
* [npm](https://github.com/isaacs/npm)
* [Redis](https://github.com/antirez/redis)

Installation
------------

    # Checkout
    git clone git@github.com:naholyr/301.tl.git
    cd 301.tl
    
    # Resolve dependencies
    npm bundle

Configuration
-------------

301.tl uses "node-config" for its configuration.

    vi conf/$(hostname).js

Then add configuration options specific to your host with this format :

    exports.conf = {
      option: value,
    }

Available options
=================

These are the common options you may want to customize:

* port (default 3000)
* host to listen (default '127.0.0.1')

The other ones are not supposed to be changed, unless you want to really want to run your own instance. Then you'd better fork, don't you think ? ;)

Run
---

During development:

    # Server will automatically be restarted whenever a source file is changed
    node server/run_dev.js &> app.log &

In production:

    # Installation as a service
    sudo cp server/init_script /etc/init.d/301.tl
    sudo update-rc.d 301.tl defaults
    # Start service
    sudo service 301.tl start
