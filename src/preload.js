var fasl_loader = function(preloads, preload_vals) {
  var vm = new VM();
  vm.ns = NameSpace.get('arc.compiler');
  vm.current_ns = vm.ns;
  var ops = VM.operators;
  for (var i=0,l=preloads.length; i<l; i++) {
    var preload     = preloads[i];
    var preload_val = preload_vals[i];
    var vals = preload_val;
    for (var j=0,jl=preload.length; j<jl; j++) {
      var line = preload[j];
      var asm = [];
      for (var k=0,kl=line.length; k<kl; k++) {
        var op = ops[line[k]];
        switch (op) {
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
          asm.push([op, line[++k]|0]);
          break;
        case 'exit-let':
        case 'shift':
        case 'refer-let':
        case 'assign-let':
          asm.push([op, line[++k]|0, line[++k]|0]);
          break;
        case 'close':
          asm.push([op, line[++k]|0, line[++k]|0, line[++k]|0, line[++k]|0]);
          break;
        case 'refer-global':
        case 'assign-global':
          asm.push([op, vals[line[++k]|0]]);
          break;
        case 'constant':
          asm.push([op, vm.reader.read(vals[line[++k]|0])]);
          break;
        case 'ns':
        case 'indirect':
        case 'halt':
        case 'argument':
        case 'apply':
        case 'nuate':
        case 'refer-nil':
        case 'refer-t':
        case 'enter-let':
        case 'wait':
          asm.push([op]);
          break;
        default:
        }
      }
      vm.set_asm(asm).run();
    }
  }
  delete vm.reader;
  delete vm;
};
ArcJS.fasl_loader = fasl_loader;

(function() {

  var preloads = [];
  var preload_vals = [];

  include("core.fasl");
  include("compiler.fasl");
  include("arc.fasl");
  include("unit.fasl");

  todos_after_all_initialized.push(function() {
    fasl_loader(preloads, preload_vals);
  });

})();
