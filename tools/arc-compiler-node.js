#!/usr/bin/env node
'use strict';

var fs = require('fs');

function main(inputs, out) {
  var ArcJS = require('../arc.min.js');
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

  function code_list_to_js_arr(code) {
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
      case 'exit-let':
      case 'conti':
        asm.push(c[1]|0);
        break;
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
        asm.push(c[1].name);
        break;
      case 'constant':
        asm.push(ArcJS.stringify(c[1]));
        break;
      default:
      }
      code = ArcJS.cdr(code);
    }
    return asm;
  }

  var i = 0, l = inputs.length;
  function processing() {
    fs.readFile(inputs[i], 'utf8', function(err, data) {
      if (err) throw new Error(err);
      vm.reader.load_source(data);
      var exprs = [];
      while (true) {
        var expr = vm.reader.read();
        if (expr === ArcJS.Reader.EOF) break;
        exprs.push(expr);
      }
      exprs.forEach(function(expr) {
        process.stderr.write("COMPILING ... " + ArcJS.stringify(expr) + "\n");
        var arr = code_list_to_js_arr(compile_with_evaluate(expr));
        out.write(JSON.stringify(arr) + ',\n');
      });
      i++;
      if (i < l) processing();
      else out.write("]);");
    });
  }

  function init_operators(after) {
    fs.readFile(require('path').dirname(require.main.filename) + '/../src/operators.js', 'utf8', function(err, data) {
      if (err) throw new Error(err);
      operators = JSON.parse(data);
      after();
    });
  }

  out.write(
    ('// This is an auto generated file.\n' +
     "// Compiled from ['/Users/smihica/code/arc-js/src/arc/compiler.arc'].\n" +
     "// DON'T EDIT !!!\n" +
     "preload.push.apply(preload, [\n"));

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
