var NameSpace = (function() {

function _copy(o, depth) {
  var i, rt;
  if (depth === void(0)) depth = 1;
  if (depth <= 0) return o;
  if (o instanceof Array) {
    // this is an array.
    rt = [];
    for (i = o.length-1; -1<i; i--) {
      rt[i] = _copy(o[i], depth - 1);
    }
  } else if (typeof o === 'object') {
    // this is a object.
    rt = {};
    for (i in o) {
      rt[i] = _copy(o[i], depth - 1);
    }
  } else {
    // this is a simple value.
    return o;
  }
  return rt;
}

function _normalize(arr, filter, err_msg) {
  arr = arr || [];
  for (var i = 0, l = arr.length, acc = []; i<l; i++) {
    var itm = arr[i];
    var n = ((itm instanceof Symbol) ? itm.name : ((typeof itm === 'string') ? itm : null));
    if (n === null) { throw new Error(err_msg + ' must be given symbol or string.'); }
    acc[i] = filter ? filter(n) : n;
  }
  return acc;
}

var NameSpace = classify('NameSpace', {
  property: {
    name:            null,
    imports:         null,
    export_names:    null,
    export_all:      false,
    exports:         null,
    exports_by_type: null,
    primary:         {},
    primary_by_type: {},
    parent:          null
  },
  static: {
    tbl: {},
    root:  null,
    global_ns: null,
    default_ns: null,
    get: function(name) {
      var rt = NameSpace.tbl[name];
      if (!rt) throw new Error('the namespace "' + name + '" is not found.');
      return rt;
    },
    create: function(name, extend, imports, exports) {
      var extend_name = ((extend instanceof Symbol) ? extend.name :
                         ((typeof extend === 'string') ? extend : null));
      extend = (extend_name !== null ? NameSpace.get(extend_name) : null);
      return new NameSpace(name, extend, imports, exports);
    },
    create_with_default: function(name, extend, imports, exports) {
      extend = extend || NameSpace.default_ns.name;
      return NameSpace.create(name, extend, imports, exports);
    }
  },
  method: {
    init: function(name, extend, imports, exports) {
      this.name = name;
      if (extend !== null) {
        this.parent            = extend;
        this.primary           = _copy(extend.primary);
        this.primary_by_type   = _copy(extend.primary_by_type, 2);
        this.imports           = _copy(extend.imports);
        this.export_names      = _copy(extend.export_names);
        this.export_all        = extend.export_all;
        if (this.export_all) { // all
          this.exports         = this.primary;
          this.exports_by_type = this.primary_by_type;
        } else { // not-all
          this.exports         = _copy(extend.exports);
          this.exports_by_type = _copy(extend.exports_by_type, 2);
        }
      } else {
        this.imports           = [];
        this.export_names      = [];
        this.export_all        = (exports.length < 1);
        if (this.export_all) { // all
          this.exports         = this.primary;
          this.exports_by_type = this.primary_by_type;
        } else { // not-all
          this.exports         = {};
          this.exports_by_type = {};
        }
      }
      this.add_imports(imports);
      this.add_exports(exports);
      NameSpace.tbl[name] = this;
    },
    add_imports: function(imports) {
      imports = _normalize(imports, function(n) { return NameSpace.get(n); }, 'NameSpace name');
      this.imports = this.imports.concat(imports);
    },
    add_exports: function(exports) {
      exports = _normalize(exports, null, 'export name');
      this.export_names = this.export_names.concat(exports);
      var export_all = (exports.length < 1);
      if (this.export_all !== export_all) {
        this.export_all = export_all;
        if (this.export_all) {
          // not-all -> all (nothing to do)
        } else {
          // all     -> not-all
          this.exports         = _copy(this.primary);
          this.exports_by_type = _copy(this.primary_by_type, 2);
        }
      } else {
        // all -> all or not-all -> not-all (nothing to do)
      }
    },
    _set: function(name, val, type_name) {
      var ns = (name.match(/\*\*\*.+\*\*\*/)) ? NameSpace.global_ns : this;
      ns.primary[name] = val;
      var by_type = ns.primary_by_type[type_name] || {};
      by_type[name] = val;
      ns.primary_by_type[type_name] = by_type;
      if (ns.export_all || -1 < ns.export_names.indexOf(name)) {
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

var global_ns = new NameSpace('***global***', null, [], []);
NameSpace.global_ns = global_ns;

// creating objects that reference each other.
var core_ns     = new NameSpace('arc.core',     null, ['***global***'],             []);
var compiler_ns = new NameSpace('arc.compiler', null, ['***global***', 'arc.core'], []);
core_ns.add_imports(['arc.compiler']);

new NameSpace('arc',          null, ['***global***', 'arc.core', 'arc.compiler'], []);

var default_ns    = new NameSpace('arc.user_default',    null, ['***global***', 'arc.core', 'arc.compiler', 'arc'], []);
NameSpace.default_ns = default_ns;

return NameSpace;

})();

ArcJS.NameSpace = NameSpace;
