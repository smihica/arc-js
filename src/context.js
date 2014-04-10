var Context = classify("Context", {
  property: {
    vm: null
  },
  method: {
    init: function() {
      this.vm = new VM();
    },
    compile: function(expr) {
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
      this.vm.cleanup();
      this.vm.set_asm(asm);
      return this.vm.run();
    },
    eval_asm:  function(asm) {
      this.vm.cleanup();
      this.vm.load(asm);
      return this.vm.run();
    },
    eval_expr: function(expr) {
      var asm = this.compile(expr);
      return this.eval_asm(asm);
    },
    read: function(str) {
      return this.vm.reader.read(str);
    },
    evaluate: function(str) {
      var expr = this.read(str);
      var result = nil;
      while (expr !== Reader.EOF) {
        result = this.eval_expr(expr);
        expr = this.read();
      }
      return result;
    }
  }
});
ArcJS.Context = Context;
var default_context = null;
var context = function context() {
  if (default_context) return default_context;
  default_context = new Context();
  return default_context;
}
ArcJS.context = context;
