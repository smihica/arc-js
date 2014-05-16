var Primitives = classify('Primitives', {
  static: {
    context: null,
    vm:      null,
    reader:  null,
    all: []
  },
  property: {
    ns:   null,
    vars: {}
  },
  method: {
    init: function(ns_name) {
      this.ns = NameSpace.get(ns_name);
      Primitives.all.push(this);
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
      return this;
    }
  }
});
ArcJS.Primitives = Primitives;

include("primitives/core.js");
include("primitives/collection.js");
include("primitives/math.js");
include("primitives/time.js");

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
    var vars = prm.vars;
    for (var p in vars) {
      prm.ns.setBox(p, vars[p]);
    }
  }

});
