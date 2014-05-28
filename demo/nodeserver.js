var http = require('http');
var ArcJS = require('../arc.js');
var arc = ArcJS.context();

arc.require(['defs.fasl', 'defs2.arc'], function() {

  console.log(arc.evaluate('Y'));
  console.log(arc.evaluate('X'));

  return;

});

