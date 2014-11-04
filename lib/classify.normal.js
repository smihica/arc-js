/*
  copyright (c) smihica.
  Mit license
*/
var classify = (function(ns) {

  var classify = ns;

  function randomAscii(len) {
    for(var rt='';0<len;len--) rt += String.fromCharCode(32+Math.round(Math.random()*94));
    return rt.replace(/'|"|\\/g, '@');
  };

  function ClassifyError(message) {
    Error.apply(this, arguments);
    if (Error.captureStackTrace !== void(0))
      Error.captureStackTrace(this, this.constructor);
    this.message = message;
  };
  ClassifyError.prototype = new Error();

  function createExceptionClass(exceptionClassName) {
    var exceptionClass = function() { ClassifyError.apply(this, arguments); };
    exceptionClass.prototype = new ClassifyError();
    exceptionClass.prototype.name = exceptionClassName;
    return exceptionClass;
  };

  var ArgumentError    = createExceptionClass('ArgumentError');
  var DeclarationError = createExceptionClass('DeclarationError');

  // test the obj is atomic or not.
  function _atomic_p(obj, t) {
    return ( obj === null || obj === void(0) ||
             (t = typeof obj) === 'number' ||
             t === 'string' ||
             t === 'boolean' ||
             ((obj.valueOf !== Object.prototype.valueOf) &&
              !(obj instanceof Date)));
  };

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
  };

  var genclassid = (function(i) {
    return function genclassid() {
      return "ANONYMOUS_CLASS_"+(++i);
    };
  })(0);

  var iop = randomAscii(64);

  function __super__() {
    return this.constructor.__super__.prototype;
  };

  function inherits(_class, parent) {
    _class.__super__ = parent;

    var f = function() {};
    f.prototype = parent.prototype;
    f.prototype.constructor = parent;
    _class.prototype = new f();
    _class.prototype.__super__ = __super__;

    var iiop = _class[iop];

    _class[iop] = function(inst) {
      var parent_iiop = parent[iop];
      if (parent_iiop) parent_iiop(inst);
      iiop(inst);
    };

    return _class;
  };

  function method(_class, name, func) {
    _class.prototype[name] = func;
  };

  function mixin(_class, include) {
    var incproto = include.prototype;
    for (var i in incproto) {
      if (i == 'init') {
        _class.prototype['init@' + include['@CLASSNAME']] = incproto[i];
      } else if (i !== "__super__" && i !== "constructor") {
        _class.prototype[i] = incproto[i];
      }
    }

    var iiop = _class[iop];
    _class[iop] = function(inst) {
      var include_iiop = include[iop];
      if (include_iiop) include_iiop(inst);
      iiop(inst);
    };
  };

  function check_interface(_class, impl) {
    for (var i in impl.prototype) {
      if (impl.prototype.hasOwnProperty(i)) {
        if (!_class.prototype.hasOwnProperty(i)) {
          throw new DeclarationError(
            'The class \'' + _class['@CLASSNAME'] +
              '\' must provide property or method \'' + i +
              '\' imposed by \'' + impl['@CLASSNAME'] +"'.");
        }
      }
    }
  };

  function hasProp (d) {
    for (var p in d)
      if (d.hasOwnProperty(p)) return true;
    return false;
  }

  var userDirectives = {};

  function expand (context, def) {

    if (!def) return context;

    var i, k, t, directivenames = [],
    base = "property,static,method,parent,mixin,implement".split(',');

    for (i in userDirectives) directivenames.push(i);

    while (1) {
      var rec = false;

      for (i in def) {
        if (0 <= base.indexOf(i)) context[i] = def[i];
        else if (0 <= directivenames.indexOf(i)) {
          if (hasProp(def[i])) rec = true;
        } else throw new ArgumentError(
          'You gave \'' + i + '\' as definition, but the classify() excepts' +
            ' only "' + base.concat(directivenames).join(', ') + '".');
      }

      if (!rec) break;

      for (i in userDirectives) context[i] = context[i] || {};
      for (i in userDirectives) {
        t = 0;
        for (k in def[i]) {
          if (t == 0) context = userDirectives[i].one_time_fn(context);
          if (context) context = userDirectives[i](context, k, def[i][k]);
          if (!context) throw new DeclarationError('directives must return context. ON YOUR directive "' + i + '"');
          delete def[i][k]; // for recursive directive definition.
          t++;
        }
      }

      def = context;
    }

    return context;
  };

  var classify = function classify(name, def) {
    var __class__, i, j, l, k, c, type, context;

    if ((l = arguments.length) == 1) return (typeof name !== 'string') ? classify(genclassid(), name) : classify(name, {});
    else if (!(l == 2 && typeof name === 'string' && def instanceof Object)) // TODO: check is def a plainObject or no ?
      throw new ArgumentError('Expects classify(name, definition) or classify(name) or classify(definition).');

    if (!name.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/))
      throw new ArgumentError('You give "' + name + '" as class name. But class name must be a valid variable name in JavaScript.');

    context = {
      property:   {},
      static:     {},
      method:     {},
      parent:     Object,
      mixin:      [],
      implement:  []
    };

    context = expand(context, def);

    var inner_new_call_identifier = randomAscii(64);
    eval("__class__ = function " + name + "(arg) {" +
      "if (this.constructor === " + name + ") {" +
         name + "['" + iop + "'](this);" +
         "if (arg !== '" + inner_new_call_identifier + "') " +
         (('init' in context.method) ? "this.init.apply(this, arguments);" : "_clone(arg, this);") +
         "return this;" +
      "}" +
      "var self = new " + name + "('" + inner_new_call_identifier + "');" +
      (('init' in context.method) ? "self.init.apply(self, arguments);" : "_clone(arg, self);") +
      "return self;" +
    "}");

    // TODO optimization.
    __class__[iop] = function(inst) {
      for (var p in context.property) {
        inst[p] = _clone(context.property[p]);
      }
    };

    inherits(__class__, context.parent);

    for (j = 0, l = context.mixin.length; j < l; j++) {
      mixin(__class__, context.mixin[j]);
    }

    for (i in context.method) {
      if (context.method.hasOwnProperty(i)) {
        method(__class__, i, context.method[i]);
      }
    }
    __class__.prototype.constructor = __class__;
    __class__.prototype.__class__ = __class__;

    __class__['@CLASSNAME'] = name;

    for (j=0, l=context.implement.length; j<l; j++) {
      check_interface(__class__, context.implement[j]);
    }

    for (i in context.static) {
      __class__[i] = context.static[i];
    }

    (typeof context.static['init'] === 'function') && context.static['init'].call(__class__);

    return __class__;
  };

  classify.addDirective = function addDirective(directiveName, fn, ofn) {
    fn.one_time_fn = ofn || function(c){return c};
    userDirectives[directiveName] = fn;
  };
  classify.removeDirective = function removeDirective(directiveName) {
    delete userDirectives[directiveName];
  };
  classify.expand = expand;

  classify.error = {
    ClassifyError    : ClassifyError,
    ArgumentError    : ArgumentError,
    DeclarationError : DeclarationError
  };

  return classify;

})({});
// for node.js
if (typeof exports !== 'undefined') exports.classify = classify;
