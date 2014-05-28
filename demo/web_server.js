var ArcJS = require('../arc.js');
var arc = ArcJS.context();

var http = require("http");
var url  = require("url");
var path = require("path");
var fs   = require("fs");
var port = process.argv[2] || '8080';

arc.require(['web_defs.arc'], function onload() {

  http.createServer(function(request, response) {

    var uri = url.parse(request.url).pathname;

    try {
      var arc_alist = arc.evaluate('(exec-url ' + JSON.stringify(uri) + ')', 'user.server');
      var res = {};
      ArcJS.list_to_javascript_arr(arc_alist, true).forEach(function(itm) {
        res[itm[0]] = itm[1];
      });
      var code = res["code"];
      var body = res["body"];
      delete res["code"];
      delete res["body"];
      response.writeHead(code, res);
      response.end(body);
    } catch (err) {
      response.writeHead(500, {"Content-Type": "text/plain"});
      response.write(err + "\n");
      response.end();
    }

  }).listen(parseInt(port, 10));

});

console.log("Server running at http://localhost:" + port );

