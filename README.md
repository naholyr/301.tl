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

Available options :

* port (default 3000)
* host to listen (default '127.0.0.1')
* static_paths (default ['./public'])
* url_provider (default 'redis') engine for encoding/decoding URLs
  * redis.db (default '301tl) Redis database used to store encoded/decoded URLs

Run
---

    node app.js
