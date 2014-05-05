var NameSpace = classify('NameSpace', {
  property: {
    name:            null,
    imports:         null,
    export_names:    null,
    export_all:      false,
    exports:         {},
    exports_by_type: {},
    primary:         {},
    primary_by_type: {},
  },
  static: {
    tbl: {},
    root:  null,
    global_ns: null,
    default_ns_names: [
      '***global***',
      'arc.core.primitives',
      'arc.core.compiler',
      'arc.core'
    ],
    get: function(name, create) {
      var rt = NameSpace.tbl[name];
      if (!rt) {
        if (!create)
          throw new Error('the namespace "' + name + '" is not found.');
        else
          return new NameSpace(name, [], []);
      }
      return rt;
    },
    create: function(name, imports, exports) {
      imports = imports || [];
      for (var i = 0, l = imports.length, acc = []; i<l; i++) {
        var itm = imports[i];
        var n = ((itm instanceof Symbol) ? itm.name : ((typeof itm === 'string') ? itm : null));
        if (n === null) { throw new Error('NameSpace name must be given symbol or string.'); }
        acc[i] = NameSpace.get(n);
      }
      imports = acc;
      exports = exports || [];
      for (var i = 0, l = exports.length, acc = []; i<l; i++) {
        var itm = exports[i];
        var n = ((itm instanceof Symbol) ? itm.name : ((typeof itm === 'string') ? itm : null));
        if (n === null) { throw new Error('export name must be given symbol or string.'); }
        acc[i] = n;
      }
      exports = acc;
      return new NameSpace(name, imports, exports);
    },
    create_with_default: function(name, imports, exports) {
      imports = imports || [];
      return NameSpace.create(name, NameSpace.default_ns_names.concat(imports), exports);
    }
  },
  method: {
    init: function(name, imports, exports) {
      this.name = name;
      this.imports = imports;
      this.export_names = exports;
      this.export_all = (this.export_names.length < 1);
      if (this.export_all) {
        this.exports         = this.primary;
        this.exports_by_type = this.primary_by_type;
      }
      NameSpace.tbl[name] = this;
    },
    _set: function(name, val, type_name) {
      var ns = (name.match(/\*\*\*.+\*\*\*/)) ? NameSpace.global_ns : this;
      ns.primary[name] = val;
      var by_type = ns.primary_by_type[type_name] || {};
      by_type[name] = val;
      ns.primary_by_type[type_name] = by_type;
      if (!ns.export_all && -1 < ns.export_names.indexOf(name)) {
        ns.exports[name] = val;
        var by_type = ns.exports_by_type[type_name] || {};
        by_type[name] = val;
        ns.exports_by_type[type_name] = by_type;
      }
    },
    setBox: function(name, val) {
      this._set(name, new Box(val), type(val).name);
    },
    get: function(name) {
      var v = this.primary[name];
      if (v) return v;
      for (var i = this.imports.length-1; -1<i; i--) {
        v = this.imports[i].exports[name];
        if (v) return v;
      }
      throw new Error('Unbound variable ' + stringify_for_disp(Symbol.get(name)));
    },
    has: function(name) {
      if (name in this.primary) return true;
      for (var i = this.imports.length-1; -1<i; i--)
        if (name in this.imports[i].exports) return true;
      return false;
    },
    collect_bounds: function(type_name) {
      var rt = {};
      if (arguments.length < 1) {
        for (var i = 0, l = this.imports.length; i<l; i++) {
          var tbl = this.imports[i].exports;
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
          var tbl = this.imports[i].exports_by_type[type_name];
          if (tbl) {
            for (var k in tbl) {
              rt[k] = tbl[k];
            }
          }
        }
        var tbl = this.primary_by_type[type_name];
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
var global_ns     = new NameSpace('***global***', [], []);
NameSpace.global_ns = global_ns;
var primitives_ns = new NameSpace('arc.core.primitives', [global_ns], []);
var compiler_ns   = new NameSpace('arc.core.compiler',   [global_ns, primitives_ns], []);
var arc_ns        = new NameSpace('arc.core',            [global_ns, primitives_ns, compiler_ns], []);
