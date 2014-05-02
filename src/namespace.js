var NameSpace = classify('NameSpace', {
  property: {
    name:     null,
    imports: null,
    primary:  {}
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
      this.stack.push(x);
      return x;
    },
    pop: function() {
      return this.stack.pop();
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
    create_default: function(name, imports) {
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
    set: function(name, val) {
      if (name.match(/\*\*\*.+\*\*\*/)) {
        NameSpace.global_ns.primary[name] = val;
      } else {
        this.primary[name] = val;
      }
    },
    setBox: function(name, val) {
      this.set(name, new Box(val));
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
    }
  }
});
ArcJS.NameSpace = NameSpace;
var global_ns     = new NameSpace('***global***', []);
NameSpace.global_ns = global_ns;
var primitives_ns = new NameSpace('arc.core.primitives', [global_ns]);
var compiler_ns   = new NameSpace('arc.core.compiler',   [global_ns, primitives_ns]);
var arc_ns        = new NameSpace('arc.core',            [global_ns, primitives_ns, compiler_ns]);

