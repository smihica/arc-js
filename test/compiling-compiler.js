var vm = new ArcJS.VM();
var cadr = ArcJS.cadr;

function compile(expr) {
  var asm = [
    ['frame', 8],
    ['constant', expr],
    ['argument'],
    ['constant', 1],
    ['argument'],
    ['refer-global', 'compile'],
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

function evaluate_code(code) {
  return evaluate(vm.reader.read(code));
}

var log = '';
function pr(src) {
  log += src + '<br>';
  $('#stage').html(log);
}

function compile_file(url) {
  $.ajax({
    url: url,
    type: 'GET'
  }).done(function(r){
    vm.reader.load_source(r);
    var exprs = [];
    while (true) {
      var expr = vm.reader.read();
      if (expr === ArcJS.Reader.EOF) break;
      exprs.push(expr);
    }
    var ts = new Date();
    var i = 0, l=exprs.length;
    setTimeout(function compile1() {
      function add(a, b) { return a + b; }
      if (i < l) {
        var s = new Date();
        compile(exprs[i]);
        var e = new Date();
        pr('COMPILED: ' + cadr(exprs[i]).name + ' ... passed ' + (e - s) + ' ms.');
        pr('');
        i++;
        setTimeout(compile1, 0);
      } else {
        var te = new Date();
        var hist = load() || [];
        var total = (te - ts);
        hist.push(total);
        pr('TOTAL ' + total + ' ms have passed.');
        pr('AVG: ' + (hist.reduce(add, 0) / hist.length) + ' (' + hist.length + ' times).');
        save(hist);
      }
    }, 0);
  }).error(function(r) {
    throw new Error(r.responseText);
  });
}

function save(x) {
  localStorage.setItem('savings', JSON.stringify(x));
}

function load() {
  return JSON.parse(localStorage.getItem('savings'));
}

function clear() {
  localStorage.removeItem('savings');
}

$(function run() {
  compile_file('../src/arc/compiler.arc');
  $("#clear-hist").click(clear);
});
