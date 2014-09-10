/* require "express", "shelljs", "body-parser", "underscore" */

var express    = require('express');
var app        = express();
var shell      = require('shelljs');
var bodyParser = require('body-parser');
var _          = require('underscore');

var ArcJS = require('./arc.js');
var arc = ArcJS.context();

var json_to_arctbl = function(d) {
  if ( d instanceof Array) {
    return "(list " + d.map(json_to_arctbl).join(' ') + ")";
  } else if ( d instanceof Object ) {
    var tmp = [], i = 0;
    for (var k in d) {
      tmp[i] = (ArcJS.stringify(k) + ' ' + json_to_arctbl(d[k]));
      i++;
    }
    return "{" + tmp.join(' ') + "}";
  } else if (d === false || d === null) {
    return "nil";
  } else if (d === true) {
    return "t";
  } else {
    return ArcJS.stringify(d);
  }
  throw new Error('Invalid json');
};

var create_arc_method_func = function(method) {
  return function(request, response) {

    var path    = '/' + request.params[0];
    var query   = request.query;
    var body    = request.body;
    var data    = _.extend(query, body);
    var headers = request.headers;

    console.log('----------------------------------------');
    console.log('path: ' + method + ' ' + path);
    console.log('data: ' + JSON.stringify(data));
    console.log('head: ' + JSON.stringify(headers));
    console.log('');

    try {
      var arc_code = '(exec-url "' + path + '" \'' + method + ' ' + json_to_arctbl(data) + ' ' + json_to_arctbl(headers) + ')';
      var arc_alist = arc.evaluate(arc_code, 'user.server');
      var res = {};
      ArcJS.list_to_javascript_arr(arc_alist, true).forEach(function(itm) {
        res[itm[0]] = itm[1];
      });
      var code = res["code"];
      var body = res["body"];
      delete res["code"];
      delete res["body"];
      response.status(code).set(res).send(body).end();
    } catch (err) {
      err = '500: Internal server error.\n' + err + '\n';
      response.status(500).set({"Content-Type": "text/plain"}).send(err).end();
    }
  };
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/*',  create_arc_method_func('GET'));
app.post('/*', create_arc_method_func('POST'));
app.put('/*',  create_arc_method_func('PUT'));
app.delete('/*',  create_arc_method_func('DELETE'));

arc.require(['web_defs.arc'], function onload() {

  ArcJS.Primitives('user.server').define({
    'exec-command': [{dot: -1}, function(cmd) {
      var rt = shell.exec(cmd);
      return ArcJS.Table().load_from_js_hash(rt);
    }]
  });

  var port = 8090;
  app.listen(port);
  console.log("Server running at http://localhost:" + port );

});


