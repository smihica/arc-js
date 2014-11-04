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
        ['refer-global', 'compile'],
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
    evaluate: function(str, ns_name) {
      if (ns_name) {
        var ns = this.vm.ns;
        var current_ns = this.vm.current_ns;
        this.set_ns(ns_name);
      }
      var expr = this.read(str);
      var result = nil;
      while (expr !== Reader.EOF) {
        result = this.eval_expr(expr);
        expr = this.read();
      }
      if (ns_name) {
        this.vm.ns = ns;
        this.vm.current_ns = current_ns;
      }
      return result;
    },
    set_ns: function(name) {
      var ns = NameSpace.get(name);
      this.vm.ns = ns;
      this.vm.current_ns = ns;
      return ns;
    },
    require: function(paths, after) {

      var self          = this;
      var is_nodejs     = (typeof module !== 'undefined' && module.exports);
      var jquery_loaded = (typeof jQuery !== 'undefined');

      var loader;
      if (is_nodejs) {

        var fs = require('fs');
        loader = function(path, succ, fail) {
          fs.readFile(path, {encoding: 'utf-8'}, function(err, data){
            if (err) return fail(err);
            succ(data);
          });
        }

      } else if (jquery_loaded) {
        loader = function(path, succ, fail) {
          jQuery.ajax({
            url: path,
            dataType: 'text'
          }).done(succ).error(fail);
        }
      } else {
        throw new Error('ArcJS.context.require() must be used in Node.js or a WebPage where jQuery is loaded.');
      }

      (function iter(paths, i) {
        if (i < paths.length) {
          var path = paths[i];
          loader(path, function(data) {
            if (path.match(/\.arc$/)) {
              self.evaluate(data);
            } else if (path.match(/\.fasl$/)) {
#ifdef NO_EVAL
              throw new Error('noeval mode ArcJS cannot load fasl file.');
#else
              eval('var fasl = (function() {\nvar preloads = [], preload_vals = [];\n' +
                   data +
                   'return {preloads: preloads, preload_vals: preload_vals};\n})();');
              ArcJS.fasl_loader(self.vm.ns, fasl.preloads, fasl.preload_vals);
#endif
            } else {
              throw new Error('ArcJS.context.require() supports only files that have .arc or .fasl as its suffix.');
            }
            iter(paths, i+1);
          }, function(e) { throw e; });
        } else {
          if (after) after();
        }
      })(paths, 0);

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
