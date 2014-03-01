#!/usr/bin/env node
'use strict';

var script_dir = require('path').dirname(require.main.filename);

var fs = require('fs');

function main(inputs, out) {
  var ArcJS = require(script_dir + '/../arc.js');
  var vm = new ArcJS.VM();
  var operators = [];

  function compile(expr) {
    var asm = [
      ['frame', 8],
      ['constant', expr],
      ['argument'],
      ['constant', 1],
      ['argument'],
      ['refer-global', 'do-compile'],
      ['indirect'],
      ['apply'],
      ['halt']
    ];
    vm.cleanup();
    vm.set_asm(asm);
    return vm.run();
  }

  function evaluate(expr) {
    var compiled = compile(expr);
    vm.cleanup();
    vm.load(compiled);
    return vm.run();
  }

  function compile_with_evaluate(expr) {
    var compiled = compile(expr);
    vm.cleanup();
    vm.load(compiled);
    vm.run();
    return compiled;
  }

  function evaluate_code(code) {
    return evaluate(vm.reader.read(code));
  }

  function compile_code(code) {
    return compile(vm.reader.read(code));
  }

  function make_vals_tbl() {
    var tbl = {};
    var lis = [];
    return {
      indexing: function(str) {
        var res = tbl[str];
        if (typeof res === 'undefined') {
          lis.push(str);
          res = lis.length - 1;
          tbl[str] = res;
        }
        return res;
      },
      get_list: function() {
        return lis;
      }
    };
  }

  function code_list_to_js_arr(code, tbl) {
    var asm = [];
    while(code !== ArcJS.nil) {
      var c = ArcJS.list_to_javascript_arr(ArcJS.car(code));
      var op = c[0];
      var op_pos = operators.indexOf(op.name);
      if (op_pos < 0) throw new Error('Unknown op ' + op.name);
      asm.push(op_pos);
      switch (op.name) {
      case 'refer-local':
      case 'refer-free':
      case 'box':
      case 'test':
      case 'jump':
      case 'assign-local':
      case 'assign-free':
      case 'frame':
      case 'return':
      case 'continue-return':
      case 'conti':
        asm.push(c[1]|0);
        break;
      case 'exit-let':
      case 'shift':
      case 'refer-let':
      case 'assign-let':
        asm.push(c[1]|0);
        asm.push(c[2]|0);
        break;
      case 'close':
        asm.push(c[1]|0);
        asm.push(c[2]|0);
        asm.push(c[3]|0);
        asm.push(c[4]|0);
        break;
      case 'refer-global':
      case 'assign-global':
        asm.push(tbl.indexing(c[1].name)|0);
        break;
      case 'constant':
        asm.push(tbl.indexing(ArcJS.stringify(c[1]))|0);
        break;
      default:
      }
      code = ArcJS.cdr(code);
    }
    return asm;
  }

  var i = 0, l = inputs.length, tbl;
  function processing() {
    fs.readFile(inputs[i], 'utf8', function(err, data) {
      if (err) throw new Error(err);
      if (i === 0) {
        tbl = make_vals_tbl();
        out.write("preloads.push([\n");
      }
      vm.reader.load_source(data);
      var exprs = [];
      while (true) {
        var expr = vm.reader.read();
        if (expr === ArcJS.Reader.EOF) break;
        exprs.push(expr);
      }
      exprs.forEach(function(expr) {
        process.stderr.write("COMPILING ... " + ArcJS.stringify(expr) + "\n");
        var arr = code_list_to_js_arr(compile_with_evaluate(expr), tbl);
        out.write(JSON.stringify(arr) + ',\n');
      });
      i++;
      if (i < l) processing();
      else {
        out.write("]);\n");
        out.write("preload_vals.push(" + JSON.stringify(tbl.get_list()) + ");\n");
      }
    });
  }

  function init_operators(after) {
    fs.readFile(script_dir + '/../src/operators.js', 'utf8', function(err, data) {
      if (err) throw new Error(err);
      operators = JSON.parse(data);
      after();
    });
  }

  out.write(
    ('// This is an auto generated file.\n' +
     "// Compiled from ['" + inputs.join("','") + "'].\n" +
     "// DON'T EDIT !!!\n" ));

  init_operators(processing);

}

var argv = process.argv.slice(2);
var inputs = [], output = '';
for (var i=0,l=argv.length; i<l; i++) {
  if (argv[i] === '-o') { i++; output = argv[i]; continue; }
  inputs.push(argv[i]);
}

if (inputs.length === 0 || -1 < inputs.indexOf('-h')) {
  console.log('Usage: arc-compilter-node.js input-file [input-files ... ] [ -o output-file | stdout ]');
  console.log('');
  console.log('Example');
  console.log('$ arc-compilter-node.js code.arc -o code.fasl.js');
  process.exit();
}

var out = process.stdout;
if (output !== '') {
  out = fs.createWriteStream(output, { flags: 'w' });
}

main(inputs, out);
