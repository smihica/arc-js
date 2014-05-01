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
    default_ns: ['arc.core.primitives',
                 'arc.core.compiler',
                 'arc.core'],
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
      imports = imports || [];
      var df = NameSpace.default_ns;
      for (var i = df.length-1; -1 < i; i--) {
        var ns = NameSpace.tbl[df[i]];
        if (ns) imports = imports.concat([ns]);
      }
      return new NameSpace(name, imports);
    }
  },
  method: {
    init: function(name, imports) {
      this.name = name;
      this.imports = imports;
      NameSpace.tbl[name] = this;
    },
    set: function(name, val) {
      this.primary[name] = val;
    },
    setBox: function(name, val) {
      this.primary[name] = new Box(val);
    },
    get: function(name) {
      var v = this.primary[name];
      if (v) return v;
      for (var i = 0, l = this.imports.length; i<l; i++) {
        v = this.imports[i].primary[name];
        if (v) return v;
      }
      throw new Error('Unbound variable ' + stringify_for_disp(Symbol.get(name)));
    },
    has: function(name) {
      if (name in this.primary) return true;
      for (var i = 0, l = this.imports.length; i<l; i++)
        if (name in this.imports[i].primary) return true;
      return false;
    }
  }
});
var primitives_ns = new NameSpace('arc.core.primitives', []);
var compiler_ns   = new NameSpace('arc.core.compiler', [primitives_ns]);
var arc_ns        = new NameSpace('arc.core', [compiler_ns, primitives_ns]);
ArcJS.NameSpace = NameSpace;
