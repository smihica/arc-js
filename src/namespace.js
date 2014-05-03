var NameSpace = classify('NameSpace', {
  property: {
    name:     null,
    imports: null,
    primary:  {},
    by_type:  {}
  },
  static: {
    tbl: {},
    root:  null,
    stack: [null],
    global_ns: null,
    default_ns_names: [
      '***global***',
      'arc.core.primitives',
      'arc.core.compiler',
      'arc.core'
    ],
    push: function(x) {
      console.log('*** ns-push (' + this.stack.length + ') ' + x.name);
      this.stack.push(x);
      return x;
    },
    pop: function() {
      var rt = this.stack.pop();
       console.log('*** ns-pop  (' + this.stack.length + ') ' + rt.name);
      return rt;
    },
    get: function(name, create) {
      var rt = NameSpace.tbl[name];
      if (!rt) {
        if (!create)
          throw new Error('the namespace "' + name + '" is not found.');
        else
          return new NameSpace(name, []);
      }
      return rt;
    },
    create_with_default: function(name, imports) {
      var df = NameSpace.default_ns_names;
      var default_ns = [];
      for (var i = 0, l = df.length; i < l; i++) {
        var ns = NameSpace.tbl[df[i]];
        if (ns) default_ns.push(ns);
      }
      imports = imports || [];
      return new NameSpace(name, default_ns.concat(imports));
    }
  },
  method: {
    init: function(name, imports) {
      this.name = name;
      this.imports = imports;
      NameSpace.tbl[name] = this;
    },
    _set: function(name, val, type_name) {
      var ns = (name.match(/\*\*\*.+\*\*\*/)) ? NameSpace.global_ns : this;
      ns.primary[name] = val;
      //
      var by_type = ns.by_type[type_name] || {};
      by_type[name] = val;
      ns.by_type[type_name] = by_type;
    },
    setBox: function(name, val) {
      this._set(name, new Box(val), type(val).name);
    },
    get: function(name) {
      var v = this.primary[name];
      if (v) return v;
      for (var i = this.imports.length-1; -1<i; i--) {
        v = this.imports[i].primary[name];
        if (v) return v;
      }
      throw new Error('Unbound variable ' + stringify_for_disp(Symbol.get(name)));
    },
    has: function(name) {
      if (name in this.primary) return true;
      for (var i = this.imports.length-1; -1<i; i--)
        if (name in this.imports[i].primary) return true;
      return false;
    },
    collect_bounds: function(type_name) {
      var rt = {};
      if (arguments.length < 1) {
        for (var i = 0, l = this.imports.length; i<l; i++) {
          var tbl = this.imports[i].primary;
          for (var k in tbl) {
            rt[k] = tbl[k];
          }
        }
        var tbl = this.primary;
        for (var k in tbl) {
          rt[k] = tbl[k];
        }
      } else {
        for (var i = 0, l = this.imports.length; i<l; i++) {
          var tbl = this.imports[i].by_type[type_name];
          if (tbl) {
            for (var k in tbl) {
              rt[k] = tbl[k];
            }
          }
        }
        var tbl = this.by_type[type_name];
        if (tbl) {
          for (var k in tbl) {
            rt[k] = tbl[k];
          }
        }
      }
      return rt;
    }
  }
});
ArcJS.NameSpace = NameSpace;
var global_ns     = new NameSpace('***global***', []);
NameSpace.global_ns = global_ns;
var primitives_ns = new NameSpace('arc.core.primitives', [global_ns]);
var compiler_ns   = new NameSpace('arc.core.compiler',   [global_ns, primitives_ns]);
var arc_ns        = new NameSpace('arc.core',            [global_ns, primitives_ns, compiler_ns]);

