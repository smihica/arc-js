var classify = (function(ns) {

  var classify = ns;

  function __super__() {
    return this.constructor.__super__.prototype;
  }

  function inherits(_class, parent) {
    _class.__super__ = parent;
    var f = function() {};
    f.prototype = parent.prototype;
    f.prototype.constructor = parent;
    _class.prototype = new f();
    _class.prototype.__super__ = __super__;
    var iiop = _class['%%INIT_INSTANCE_ORIGIN_PROPS'];
    _class['%%INIT_INSTANCE_ORIGIN_PROPS'] = function(inst) {
      var parent_iiop = parent['%%INIT_INSTANCE_ORIGIN_PROPS'];
      if (parent_iiop) parent_iiop(inst);
      iiop(inst);
    };
    return _class;
  }

  function method(_class, name, func) {
    func.__class__ = _class;
    _class.prototype[name] = func;
  }

  // test the obj is atomic or not.
  function _atomic_p(obj, t) {
    return ( obj === null || obj === void(0) ||
             (t = typeof obj) === 'number' ||
             t === 'string' ||
             t === 'boolean' ||
             ((obj.valueOf !== Object.prototype.valueOf) &&
              !(obj instanceof Date)));
  }

  // make deep clone of the object
  function _clone(obj, target) {
    if (_atomic_p(obj)) return obj;

    // if target is given. clone obj properties into it.
    var clone, p;
    if (obj instanceof Date) {
      clone = new Date(obj.getTime());
      if (target instanceof Date) {
        for (p in target) if (target.hasOwnProperty(p)) clone[p] = _clone(target[p], clone[p]);
      }
    } else if (typeof obj === 'function') {
      clone = function(){return obj.apply(this, arguments);};
      if (typeof target === 'function') {
        for (p in target) if (target.hasOwnProperty(p)) clone[p] = _clone(target[p], clone[p]);
      }
    } else {
      clone = (!_atomic_p(target) && typeof target !== 'function') ?
        target : new obj.constructor();
    }

    for (p in obj)
      if (obj.hasOwnProperty(p))
        clone[p] = _clone(obj[p], clone[p]);

    return clone;
  }

  var genclassid = (function() {
    var id = 0;
    return function getclassid() {
      var ret = "%%ANONYMOUS_CLASS_"+id+"%%"; ++id;
      return ret;
    };
  })();

  function mixin(_class, include) {
    var incproto = include.prototype;
    for (var i in incproto) {
      if (i == 'init') {
        _class.prototype['init%%' + include['%%CLASSNAME%%']] = incproto[i];
      } else if (i !== "__super__" && i !== "constructor") {
        _class.prototype[i] = incproto[i];
      }
    }
    var iiop = _class['%%INIT_INSTANCE_ORIGIN_PROPS'];
    _class['%%INIT_INSTANCE_ORIGIN_PROPS'] = function(inst) {
      var include_iiop = include['%%INIT_INSTANCE_ORIGIN_PROPS'];
      if (include_iiop) include_iiop(inst);
      iiop(inst);
    };
  }

  function check_interface(_class, impl) {
    for (var i in impl.prototype) {
      if (impl.prototype.hasOwnProperty(i)) {
        if (!_class.prototype.hasOwnProperty(i)) {
          throw new DeclarationError(
            ('The class \'' + _class['%%CLASSNAME%%'] +
             '\' must provide property or method \'' + i +
             '\' imposed by \'' + impl['%%CLASSNAME%%'] +'".'));
        }
      }
    }
  }

  var classify = function classify(name, definition) {
    var __class__, i, j, l, c, def, type;
    var props = {};
    var statics = {};
    var methods = {};
    var parent = Object;
    var mixins = [];
    var interfaces = [];

    for (i in definition) {
      switch (i) {
      case "property":
        def = definition[i];
        for (j in def) {
          if (def.hasOwnProperty(j))
            props[j] = def[j];
        }
        break;
      case "static":
        statics = definition[i];
        break;
      case "method":
        methods = definition[i];
        break;
      case "parent":
        parent = definition[i];
        break;
      case "interfaces":
        interfaces = definition[i];
        break;
      case "mixin":
        mixins = definition[i];
        break;
      default:
        throw new ArgumentError(
          ('You gave \'' + i + '\' as definition, but the _class() excepts' +
           ' only \'property\',\'static\',\'method\',\'parent\',\'interfaces\',\'mixin\'.'));
      }
    }

    __class__ = function __Class__(arg) {
      __class__['%%INIT_INSTANCE_ORIGIN_PROPS'](this);
      if (this.init) this.init.apply(this, arguments);
      else           _clone(arg, this);
    };

    __class__['%%INIT_INSTANCE_ORIGIN_PROPS'] =
      function(inst) {
        for (var p in props) {
          inst[p] = _clone(props[p]);
        }
      };

    inherits(__class__, parent);

    for (j = 0, l = mixins.length; j < l; j++) {
      mixin(__class__, mixins[j]);
    }

    for (i in methods) {
      if (methods.hasOwnProperty(i)) {
        method(__class__, i, methods[i]);
      }
    }
    __class__.prototype.constructor = __class__;

    __class__['%%CLASSNAME%%'] = name || genclassid();

    for (j=0, l=interfaces.length; j<l; j++) {
      check_interface(__class__, interfaces[j]);
    }

    for (i in statics) {
      __class__[i] = statics[i];
    }

    statics['init'] && typeof statics['init'] === 'function' && statics.init.call(__class__);

    return __class__;
  };

  return classify;

})({});
// for node.js
if (typeof exports !== 'undefined') exports.classify = classify;
