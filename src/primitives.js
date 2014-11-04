var Primitives = classify('Primitives', {
  static: {
    context:           null,
    contexts_for_eval: [],
    vm:                null,
    reader:            null,
    all:               [],
  },
  property: {
    installed: false,
    ns:        null,
    vars:      {}
  },
  method: {
    init: function(ns_name, create) {
      try {
        this.ns = NameSpace.get(ns_name);
      } catch (e) {
        if (create) {
          this.ns = NameSpace.create_with_default(ns_name);
        } else throw e;
      }
      Primitives.all.push(this);
    },
    install_vm: function() {
      if (Primitives.context) {
        if (!this.installed) {
          var vars = this.vars;
          for (var p in vars) {
            this.ns.setBox(p, vars[p]);
          }
          this.installed = true;
        }
      }
    },
    define: function(def) {
      for (var n in def) {
        var f = def[n];
        if (f instanceof Array && typeof f[1] === 'function') {
          var options = f[0];
          f = f[1];
          f.dotpos = options['dot'];
          f.toString().match(/^function.*?\((.*?)\)/);
          var args = RegExp.$1;
          if (args === '') {
            f.arglen = 0;
          } else {
            var vs = args.split(/\s*,\s*/g);
            f.arglen = vs.length;
          }
          f.prim_name = n;
          this.vars[n] = f;
        }
      }
      this.install_vm();
      return this;
    }
  }
});
ArcJS.Primitives = Primitives;

#include "primitives/core.js"
#include "primitives/collection.js"
#include "primitives/math.js"
#include "primitives/time.js"

todos_after_all_initialized.push(function() {

  var context                  = new Context();
  Primitives.context           = context;
  Primitives.contexts_for_eval = [context];
  var vm                       = context.vm;
  Primitives.vm                = vm
  Primitives.reader            = vm.reader;

  // initializing primitives.
  var prim_all = Primitives.all;
  for (var i = 0, l = prim_all.length; i<l; i++) {
    var prm = prim_all[i];
    prm.install_vm();
  }

});
