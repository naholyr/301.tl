require.paths.push('./modules');

    var bc = require('base-converter')
    console.log(bc.decToGeneric(359461, 'AbcGHiuRSt'));
    // Output : 'GitHub'genericToDec('GitHub', base));

var base = require('base-converter');

var n = 3598786;
var b = base.decTo62(n);
var n2 = base._62ToDec(b);
console.log(n, b, n2);
