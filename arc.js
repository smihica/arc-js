/** @file arc.js { */
var ArcJS = (function() {
  var ArcJS = this;
  ArcJS.version = '0.1.0';
/** @file classify.min.js { */
var classify=function(ns){function randomAscii(a){for(var b="";0<a;a--)b+=String.fromCharCode(32+Math.round(Math.random()*94));return b.replace(/'|"|\\/g,"@")}function ClassifyError(a){Error.apply(this,arguments),Error.captureStackTrace!==void 0&&Error.captureStackTrace(this,this.constructor),this.message=a}function createExceptionClass(a){var b=function(){ClassifyError.apply(this,arguments)};return b.prototype=new ClassifyError,b.prototype.name=a,b}function _atomic_p(a,b){return a===null||a===void 0||(b=typeof a)==="number"||b==="string"||b==="boolean"||a.valueOf!==Object.prototype.valueOf&&!(a instanceof Date)}function _clone(a,b){if(_atomic_p(a))return a;var c,d;if(a instanceof Date){c=new Date(a.getTime());if(b instanceof Date)for(d in b)b.hasOwnProperty(d)&&(c[d]=_clone(b[d],c[d]))}else if(typeof a=="function"){c=function(){return a.apply(this,arguments)};if(typeof b=="function")for(d in b)b.hasOwnProperty(d)&&(c[d]=_clone(b[d],c[d]))}else c=!_atomic_p(b)&&typeof b!="function"?b:new a.constructor;for(d in a)a.hasOwnProperty(d)&&(c[d]=_clone(a[d],c[d]));return c}function __super__(){return this.constructor.__super__.prototype}function inherits(a,b){a.__super__=b;var c=function(){};c.prototype=b.prototype,c.prototype.constructor=b,a.prototype=new c,a.prototype.__super__=__super__;var d=a[iop];return a[iop]=function(a){var c=b[iop];c&&c(a),d(a)},a}function method(a,b,c){a.prototype[b]=c}function mixin(a,b){var c=b.prototype;for(var d in c)d=="init"?a.prototype["init@"+b["@CLASSNAME"]]=c[d]:d!=="__super__"&&d!=="constructor"&&(a.prototype[d]=c[d]);var e=a[iop];a[iop]=function(a){var c=b[iop];c&&c(a),e(a)}}function check_interface(a,b){for(var c in b.prototype)if(b.prototype.hasOwnProperty(c)&&!a.prototype.hasOwnProperty(c))throw new DeclarationError("The class '"+a["@CLASSNAME"]+"' must provide property or method '"+c+"' imposed by '"+b["@CLASSNAME"]+"'.")}function hasProp(a){for(var b in a)if(a.hasOwnProperty(b))return!0;return!1}function expand(a,b){if(!b)return a;var c,d,e,f=[],g="property,static,method,parent,mixin,implement".split(",");for(c in userDirectives)f.push(c);for(;;){var h=!1;for(c in b)if(0>g.indexOf(c)){if(0>f.indexOf(c))throw new ArgumentError("You gave '"+c+"' as definition, but the classify() excepts"+' only "'+g.concat(f).join(", ")+'".');hasProp(b[c])&&(h=!0)}else a[c]=b[c];if(!h)break;for(c in userDirectives)a[c]=a[c]||{};for(c in userDirectives){e=0;for(d in b[c]){e==0&&(a=userDirectives[c].one_time_fn(a)),a&&(a=userDirectives[c](a,d,b[c][d]));if(!a)throw new DeclarationError('directives must return context. ON YOUR directive "'+c+'"');delete b[c][d],e++}}b=a}return a}var classify=ns;ClassifyError.prototype=Error();var ArgumentError=createExceptionClass("ArgumentError"),DeclarationError=createExceptionClass("DeclarationError"),genclassid=function(a){return function(){return"ANONYMOUS_CLASS_"+ ++a}}(0),iop=randomAscii(64),userDirectives={},classify=function classify(name,def){var __class__,i,j,l,k,c,type,context;if((l=arguments.length)==1)return typeof name!="string"?classify(genclassid(),name):classify(name,{});if(l==2&&typeof name=="string"&&def instanceof Object){if(!name.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/))throw new ArgumentError('You give "'+name+'" as class name. But class name must be a valid variable name in JavaScript.');context={property:{},"static":{},method:{},parent:Object,mixin:[],implement:[]},context=expand(context,def);var inner_new_call_identifier=randomAscii(64);eval("__class__ = function "+name+"(arg) {"+"if (this.constructor === "+name+") {"+name+"['"+iop+"'](this);"+"if (arg !== '"+inner_new_call_identifier+"') "+("init"in context.method?"this.init.apply(this, arguments);":"_clone(arg, this);")+"return this;"+"}"+"var self = new "+name+"('"+inner_new_call_identifier+"');"+("init"in context.method?"self.init.apply(self, arguments);":"_clone(arg, self);")+"return self;"+"}"),__class__[iop]=function(a){for(var b in context.property)a[b]=_clone(context.property[b])},inherits(__class__,context.parent);for(j=0,l=context.mixin.length;j<l;j++)mixin(__class__,context.mixin[j]);for(i in context.method)context.method.hasOwnProperty(i)&&method(__class__,i,context.method[i]);__class__.prototype.constructor=__class__,__class__.prototype.__class__=__class__,__class__["@CLASSNAME"]=name;for(j=0,l=context.implement.length;j<l;j++)check_interface(__class__,context.implement[j]);for(i in context.static)__class__[i]=context.static[i];return typeof context.static.init=="function"&&context.static.init.call(__class__),__class__}throw new ArgumentError("Expects classify(name, definition) or classify(name) or classify(definition).")};return classify.addDirective=function(b,c,d){c.one_time_fn=d||function(a){return a},userDirectives[b]=c},classify.removeDirective=function(b){delete userDirectives[b]},classify.expand=expand,classify.error={ClassifyError:ClassifyError,ArgumentError:ArgumentError,DeclarationError:DeclarationError},classify}({});typeof exports!="undefined"&&(exports.classify=classify);/** @} */
/** @file stack.js { */
var Stack = classify("Stack", {
  property: {
    stack: []
  },
  method: {
    push: function(x, s) {
      this.stack[s] = x;
      return s + 1;
    },
    index_set: function(s, i, v) {
      var idx = s - i - 1;
      this.stack[idx] = v;
    },
    index: function(s, i) {
      var idx = s - i - 1;
      if (idx < 0) {
        throw new Error('idx is out of range.');
      }
      return this.stack[idx];
    },
    range_get: function(from, to) {
      return this.stack.slice(from, to+1);
    },
    save:      function(s) {
      var rt = new Stack();
      rt.stack = this.stack.slice(0, s);
      return rt;
    },
    restore:   function(s) {
      var len = s.stack.length;
      var after = this.stack.slice(len);
      this.stack = s.stack.concat(after);
      return len;
    },
    shift:     function(n, m, s) {
      for (var i = (n - 1); 0 <= i; i--) {
        this.index_set(s, i+m, this.index(s, i));
      }
      return s - m;
    }
  }
});
ArcJS.Stack = Stack;
/** @} */
/** @file symbol.js { */
var Symbol = classify("Symbol", {
  static: {
    tbl: {},
    get: function(name) {
      var r = null;
      if (!(r = this.tbl[name])) {
        r = new Symbol(name);
        this.tbl[name] = r;
      }
      return r;
    }
  },
  property: {
    name: null
  },
  method: {
    init: function(n) {
      this.name = n;
    }
  }
});
ArcJS.Symbol = Symbol;
/** @} */
/** @file cons.js { */
var Cons = function(car, cdr) {
  this.car = car; this.cdr = cdr;
}
ArcJS.Cons = Cons;
/** @} */
/** @file char.js { */
var Char = classify("Char", {
  static: {
    tbl: {},
    get: function(n) {
      var c = null;
      if (!(c = this.tbl[n])) {
        c = new Char(n);
        this.tbl[n] = c;
      }
      return c;
    }
  },
  property: { c: null },
  method: {
    init: function(c) {
      this.c = c;
    }
  }
});
ArcJS.Char = Char;
/** @} */
/** @file table.js { */
var Table = classify("Table", {
  static: {
    genkey: (function() {
      var i = 0;
      return function() {
        return '%___table_key_' + i++ + '___';
      }
    })(),
    keying: function keying(obj) {
      var type_name = type(obj).name;
      var key;
      switch (type_name) {
      case 'string':
        break;
      case 'int':
      case 'num':
        key = obj+'';
        break;
      case 'sym':
        key = ((obj === nil) ? 'nil' :
               (obj === t)   ? 't' :
               obj.name);
        break;
      case 'cons':
        key = keying(car(obj)) + keying(cdr(obj));
        break;
      default:
        obj.key_for_table = obj.key_for_table || Table.genkey();
        key = obj.key_for_table;
        break;
      }
      return type_name + ':' + key;
    }
  },
  property: { src: null, key_src: null, n: 0 },
  method: {
    init: function() {
      this.src = {};
      this.key_src = {};
    },
    put: function(key, val) {
      var skey = Table.keying(key);
      if (!(skey in this.src)) this.n++;
      this.src[skey] = val;
      this.key_src[skey] = key;
    },
    get: function(key) {
      var skey = Table.keying(key);
      return this.src[skey] || nil;
    },
    rem: function(key) {
      var skey = Table.keying(key);
      if (skey in this.src) {
        this.n--;
        delete this.src[skey];
        delete this.key_src[skey];
      }
      return nil;
    },
    dump_to_list: function() {
      var rt = nil;
      for (var k in this.src) {
        var key = this.key_src[k];
        var val = this.src[k];
        rt = cons(cons(key, cons(val, nil)), rt);
      }
      return rt;
    },
    load_from_list: function(l) {
      while (l !== nil) {
        var c = car(l);
        this.put(car(c), cadr(c));
        l = cdr(l);
      }
      return this;
    },
    stringify_content: function() {
      return '()'; // TODO: mendokuse.
    }
  }
});
ArcJS.Table = Table;
/** @} */
/** @file closure.js { */
var Closure = classify('Closure', {
  property: {
    name: null,
    body: null,
    pc:   0,
    arglen: 0,
    dotpos: 0,
    closings: [],
    namespace: null
  },
  method: {
    init: function(body, pc, closinglen, arglen, dotpos, stack, stack_pointer, namespace) {
      this.body = body;
      this.pc   = pc;
      this.arglen = arglen;
      this.dotpos = dotpos;
      for (var i = 0; i<closinglen; i++)
        this.closings.push(stack.index(stack_pointer, i));
      this.namespace = namespace;
    },
    index: function(idx) {
      return this.closings[idx];
    }
  }
});
ArcJS.Closure = Closure;
/** @} */
/** @file call.js { */
var Call = classify("Call", {
  property: {
    fname: null,
    fn: null,
    args: null
  },
  method: {
    init: function(fn_or_name, args) {
      if (typeof fn_or_name === 'string') {
        this.name = fn_or_name;
      } else {
        this.fn = fn_or_name;
      }
      this.args = args;
    },
    codegen: function() {
      var code;
      if (this.name) {
        code = [
          ['refer-global', this.name],
          ['indirect'],
          ['apply']
        ];
      } else {
        code = [
          ['constant', this.fn],
          ['apply']
        ];
      }
      var l = this.args.length;
      code.unshift(['argument']);
      code.unshift(['constant', l]);
      for (var i=l-1; -1 < i; i--) {
        code.unshift(['argument']);
        code.unshift(['constant', this.args[i]]);
      }
      return code;
    }
  }
});
ArcJS.Call = Call;
/** @} */
/** @file continuation.js { */
var Continuation = classify('Continuation', {
  parent: Closure,
  method: {
    init: function(stack, shift_num, stack_pointer, namespace) {
      Closure.prototype.init.call(
        this,
        [['refer-local', 0],
         ['nuate', stack.save(stack_pointer)], // stack restore
         ['continue-return', shift_num]], // return to outer frame.
        0,
        0,
        1,
        -1,
        stack,
        0,
        namespace);
    }
  }
});
ArcJS.Continuation = Continuation;
/** @} */
/** @file tagged.js { */
var Tagged = classify('Tagged', {
  property: { tag: null, obj: null },
  method: {
    init: function(tag, obj) {
      this.tag = tag;
      this.obj = obj
    }
  }
});
ArcJS.Tagged = Tagged;
/** @} */
/** @file box.js { */
var Box = classify('Box', {
  property: {
    v: null
  },
  method: {
    init: function(v) {
      this.v = v;
    },
    value: function(v) {
      if (argument.length === 1) this.v = v;
      else                       return this.v;
    },
    unbox: function() {
      return this.v;
    },
    setbox: function(v) {
      this.v = v;
    }
  }
});
ArcJS.Box = Box;
/** @} */
/** @file primitives.js { */
var nil = (function() {
  var n = new Cons(null, null);
  n.car = n; n.cdr = n;
  return n;
})();

var is_nodejs = (typeof module !== 'undefined' && module.exports);
var t = true;

var s_int    = Symbol.get('int');
var s_num    = Symbol.get('num');
var s_string = Symbol.get('string');
var s_sym    = Symbol.get('sym');
var s_char   = Symbol.get('char');
var s_table  = Symbol.get('table');
var s_cons   = Symbol.get('cons');
var s_fn     = Symbol.get('fn');
var s_mac    = Symbol.get('mac');

var list_to_javascript_arr = function(lis) {
  if (lis !== nil && type(lis).name !== 'cons') return [lis];
  var rt = [];
  while (lis !== nil) {
    rt.push(car(lis));
    lis = cdr(lis);
  }
  return rt;
}

var javascript_arr_to_list = function(arr) {
  var l = arr.length;
  if (l === 0) return nil;
  var rt = cons(arr[0], nil);
  var tmp = rt;
  for (var i=1; i<l; i++) {
    tmp.cdr = cons(arr[i], nil);
    tmp = tmp.cdr;
  }
  return rt;
}

var coerce = function(obj, to_type, args) {
  /*
    A char can be coerced to int, string, or sym.
    A number can be coerced to int, char, or string (of specified base).
    A string can be coerced to sym, cons (char list), or int (of specified base).
    A list of characters can be coerced to a string.
    A symbol can be coerced to a string.
  */
  to_type = to_type.name;
  var from_type = type(obj).name;
  switch(from_type) {
  case 'char':
    switch(to_type) {
    case 'int':
    case 'num':
      return obj.c.charCodeAt(0);
    case 'sym':
      return Symbol.get(obj.c);
    case 'string':
      return obj.c[0];
    case 'char':
      return obj;
    }
    break;
  case 'num':
  case 'int':
    switch(to_type) {
    case 'char':
      return Char.get(String.fromCharCode(obj));
    case 'string':
      return (obj).toString(arguments[2] || 10);
    case 'int':
      return (obj | 0);
    case 'num':
      return obj;
    }
    break;
  case 'string':
    switch(to_type) {
    case 'sym':
      return Symbol.get(obj);
    case 'cons':
      var lis = [];
      for (var i = 0, l = obj.length; i<l; i++)
        lis.push(Char.get(obj[i]));
      return javascript_arr_to_list(lis);
    case 'int':
      return (parseInt(obj, arguments[2] || 10) | 0);
    case 'num':
      return parseFloat(obj);
    case 'string':
      return obj;
    }
    break;
  case 'cons':
    switch(to_type) {
    case 'string':
      var rt = '';
      while (obj !== nil) {
        var c = car(obj);
        if(type(c).name === 'char') {
          rt += c.c;
        } else {
          // throw new Error('coerce of cons->string requires a proper list of Chars.');
          rt += coerce(c, s_string);
        }
        obj = cdr(obj);
      }
      return rt;
    case 'cons':
      return obj;
    case 'table':
      var rt = new Table();
      return rt.load_from_list(obj);
    }
    break;
  case 'sym':
    switch(to_type) {
    case 'string':
      if (obj === nil) return "nil";
      if (obj === t)   return "t";
      return obj.name;
    case 'sym':
      return obj;
    }
    break;
  case 'table':
    switch(to_type) {
    case 'cons':
      return obj.dump_to_list();
    }
    break;
  }
  throw new Error("Can't coerce " + from_type + " to " + to_type);
}

var type = function(x) {
  if (x === nil || x === t) return s_sym;
  var type = typeof x;
  switch (type) {
  case 'string':
    return s_string;
  case 'number':
    return (!!(x % 1)) ? s_num : s_int;
  case 'function':
    return s_fn;
  case 'object':
    if (x instanceof Symbol)   return s_sym;
    if (x instanceof Cons)     return s_cons;
    if (x instanceof Closure)  return s_fn;
    if (x instanceof Char)     return s_char;
    if (x instanceof Table)    return s_table;
    if (x instanceof Tagged)   return x.tag;
  default:
    return Symbol.get('javascript-' + type);
  }
};

// use decycle from https://raw.github.com/douglascrockford/JSON-js/master/cycle.js
/** @file cycle.js { */
/*
    cycle.js
    2013-02-19

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/

/*jslint evil: true, regexp: true */

/*members $ref, apply, call, decycle, hasOwnProperty, length, prototype, push,
    retrocycle, stringify, test, toString
*/

if (typeof JSON.decycle !== 'function') {
    JSON.decycle = function decycle(object) {
        'use strict';

// Make a deep copy of an object or array, assuring that there is at most
// one instance of each object or array in the resulting structure. The
// duplicate references (which might be forming cycles) are replaced with
// an object of the form
//      {$ref: PATH}
// where the PATH is a JSONPath string that locates the first occurance.
// So,
//      var a = [];
//      a[0] = a;
//      return JSON.stringify(JSON.decycle(a));
// produces the string '[{"$ref":"$"}]'.

// JSONPath is used to locate the unique object. $ indicates the top level of
// the object or array. [NUMBER] or [STRING] indicates a child member or
// property.

        var objects = [],   // Keep a reference to each unique object or array
            paths = [];     // Keep the path to each unique object or array

        return (function derez(value, path) {

// The derez recurses through the object, producing the deep copy.

            var i,          // The loop counter
                name,       // Property name
                nu;         // The new object or array

// typeof null === 'object', so go on if this value is really an object but not
// one of the weird builtin objects.

            if (typeof value === 'object' && value !== null &&
                    !(value instanceof Boolean) &&
                    !(value instanceof Date)    &&
                    !(value instanceof Number)  &&
                    !(value instanceof RegExp)  &&
                    !(value instanceof String)) {

// If the value is an object or array, look to see if we have already
// encountered it. If so, return a $ref/path object. This is a hard way,
// linear search that will get slower as the number of unique objects grows.

                for (i = 0; i < objects.length; i += 1) {
                    if (objects[i] === value) {
                        return {$ref: paths[i]};
                    }
                }

// Otherwise, accumulate the unique value and its path.

                objects.push(value);
                paths.push(path);

// If it is an array, replicate the array.

                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    nu = [];
                    for (i = 0; i < value.length; i += 1) {
                        nu[i] = derez(value[i], path + '[' + i + ']');
                    }
                } else {

// If it is an object, replicate the object.

                    nu = {};
                    for (name in value) {
                        if (Object.prototype.hasOwnProperty.call(value, name)) {
                            nu[name] = derez(value[name],
                                path + '[' + JSON.stringify(name) + ']');
                        }
                    }
                }
                return nu;
            }
            return value;
        }(object, '$'));
    };
}


if (typeof JSON.retrocycle !== 'function') {
    JSON.retrocycle = function retrocycle($) {
        'use strict';

// Restore an object that was reduced by decycle. Members whose values are
// objects of the form
//      {$ref: PATH}
// are replaced with references to the value found by the PATH. This will
// restore cycles. The object will be mutated.

// The eval function is used to locate the values described by a PATH. The
// root object is kept in a $ variable. A regular expression is used to
// assure that the PATH is extremely well formed. The regexp contains nested
// * quantifiers. That has been known to have extremely bad performance
// problems on some browsers for very long strings. A PATH is expected to be
// reasonably short. A PATH is allowed to belong to a very restricted subset of
// Goessner's JSONPath.

// So,
//      var s = '[{"$ref":"$"}]';
//      return JSON.retrocycle(JSON.parse(s));
// produces an array containing a single element which is the array itself.

        var px =
            /^\$(?:\[(?:\d+|\"(?:[^\\\"\u0000-\u001f]|\\([\\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*\")\])*$/;

        (function rez(value) {

// The rez function walks recursively through the object looking for $ref
// properties. When it finds one that has a value that is a path, then it
// replaces the $ref object with a reference to the value that is found by
// the path.

            var i, item, name, path;

            if (value && typeof value === 'object') {
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    for (i = 0; i < value.length; i += 1) {
                        item = value[i];
                        if (item && typeof item === 'object') {
                            path = item.$ref;
                            if (typeof path === 'string' && px.test(path)) {
                                value[i] = eval(path);
                            } else {
                                rez(item);
                            }
                        }
                    }
                } else {
                    for (name in value) {
                        if (typeof value[name] === 'object') {
                            item = value[name];
                            if (item) {
                                path = item.$ref;
                                if (typeof path === 'string' && px.test(path)) {
                                    value[name] = eval(path);
                                } else {
                                    rez(item);
                                }
                            }
                        }
                    }
                }
            }
        }($));
        return $;
    };
}
/** @} */
var stringify = function(x) {
  var type_name = type(x).name;
  switch (type_name) {
  case 'int':
  case 'num':
  case 'string':
    break;
  case 'sym':
    if (x === nil) return 'nil';
    if (x === t) return 't';
    return x.name;
  case 'cons':
    return "(" + stringify_list(x) + ")";
  case 'fn':
    return "#<" + (typeof x === 'function' ?
                   'prim' + (x.prim_name ? (":"+x.prim_name) : "") :
                   'fn' + (x.name ? (":"+x.name) : "")) + ">";
  case 'char':
    return "#\\" + x.c;
  case 'table':
    return '#<table n=' + x.n + /* ' | ' + x.stringify_content() + */ '>';
  }
  if (x instanceof Tagged) {
    return '#<tagged ' + type_name + ' ' + stringify(x.obj) + '>';
  }
  if (x instanceof Box)
    return '#<%boxing ' + stringify(x.unbox()) + '>';
  return JSON.stringify(JSON.decycle(x));
}

var stringify_list = function(cons) {
  var a = car(cons), d = cdr(cons);
  return stringify(a) +
    ((d === nil) ? '' :
     (d instanceof Cons) ?
     ' ' + stringify_list(d) :
     ' . ' + stringify(d));
};

var stringify_for_disp = function(x) {
  return (type(x).name === 'string') ? x : stringify(x);
}

var uniq_counter = 0;

var primitives = (function() {
  var rt = {
    'cons': [{dot: -1}, function(car, cdr) {
      return new Cons(car, cdr);
    }],
    'car':  [{dot: -1}, function(x) {
      if (x instanceof Cons) return x.car;
      throw new Error(stringify(x) + ' is not cons type.');
    }],
    'scar': [{dot: -1}, function(x, v) {
      if (x instanceof Cons) return (x.car = v);
      throw new Error(stringify(x) + ' is not cons type.');
    }],
    'cdr': [{dot: -1}, function(x) {
      if (x instanceof Cons) return x.cdr;
      throw new Error(stringify(x) + ' is not cons type.');
    }],
    'scdr': [{dot: -1}, function(x, v) {
      if (x instanceof Cons) return (x.cdr = v);
      throw new Error(stringify(x) + ' is not cons type.');
    }],

    /* c...r code generator
      (pr ((afn (d cs)
         (if (< 0 d)
             (+ (self (- d 1) (cons 'a cs)) (self (- d 1) (cons 'd cs)))
             (+ "'c" cs "r': [{dot: -1}, function(x) { return c"
                (intersperse "r(c" cs) "r(x" (n-of (len cs) ")")
                "; }],\n" )))
       4 nil))
    */
    'caar': [{dot: -1}, function(x) { return car(car(x)); }],
    'cdar': [{dot: -1}, function(x) { return cdr(car(x)); }],
    'cadr': [{dot: -1}, function(x) { return car(cdr(x)); }],
    'cddr': [{dot: -1}, function(x) { return cdr(cdr(x)); }],

    'caaar': [{dot: -1}, function(x) { return car(car(car(x))); }],
    'cdaar': [{dot: -1}, function(x) { return cdr(car(car(x))); }],
    'cadar': [{dot: -1}, function(x) { return car(cdr(car(x))); }],
    'cddar': [{dot: -1}, function(x) { return cdr(cdr(car(x))); }],
    'caadr': [{dot: -1}, function(x) { return car(car(cdr(x))); }],
    'cdadr': [{dot: -1}, function(x) { return cdr(car(cdr(x))); }],
    'caddr': [{dot: -1}, function(x) { return car(cdr(cdr(x))); }],
    'cdddr': [{dot: -1}, function(x) { return cdr(cdr(cdr(x))); }],

    'caaaar': [{dot: -1}, function(x) { return car(car(car(car(x)))); }],
    'cdaaar': [{dot: -1}, function(x) { return cdr(car(car(car(x)))); }],
    'cadaar': [{dot: -1}, function(x) { return car(cdr(car(car(x)))); }],
    'cddaar': [{dot: -1}, function(x) { return cdr(cdr(car(car(x)))); }],
    'caadar': [{dot: -1}, function(x) { return car(car(cdr(car(x)))); }],
    'cdadar': [{dot: -1}, function(x) { return cdr(car(cdr(car(x)))); }],
    'caddar': [{dot: -1}, function(x) { return car(cdr(cdr(car(x)))); }],
    'cdddar': [{dot: -1}, function(x) { return cdr(cdr(cdr(car(x)))); }],
    'caaadr': [{dot: -1}, function(x) { return car(car(car(cdr(x)))); }],
    'cdaadr': [{dot: -1}, function(x) { return cdr(car(car(cdr(x)))); }],
    'cadadr': [{dot: -1}, function(x) { return car(cdr(car(cdr(x)))); }],
    'cddadr': [{dot: -1}, function(x) { return cdr(cdr(car(cdr(x)))); }],
    'caaddr': [{dot: -1}, function(x) { return car(car(cdr(cdr(x)))); }],
    'cdaddr': [{dot: -1}, function(x) { return cdr(car(cdr(cdr(x)))); }],
    'cadddr': [{dot: -1}, function(x) { return car(cdr(cdr(cdr(x)))); }],
    'cddddr': [{dot: -1}, function(x) { return cdr(cdr(cdr(cdr(x)))); }],

    'list': [{dot: 0}, function($$) {
      for (var i=arguments.length-1, rt=nil; -1<i; i--)
        rt = cons(arguments[i], rt);
      return rt;
    }],
    'nthcdr': [{dot: -1}, function(n, lis) {
      for (;0 < n;n--) lis = cdr(lis);
      return lis;
    }],
    'consif': [{dot: -1}, function(n, lis) {
      return (n === nil) ? lis : cons(n, lis);
    }],
    'firstn': [{dot: -1}, function(n, lis) {
      var rt = nil;
      while (lis !== nil && 0 < n) {
        rt = cons(car(lis), rt);
        lis = cdr(lis);
        n--;
      }
      return nreverse(rt)
    }],
    'len': [{dot: -1}, function(lis) {
      if (typeof lis === 'string') return lis.length;
      var i = 0;
      while (lis !== nil) {
        i++; lis = cdr(lis);
      }
      return i;
    }],
    'rev': [{dot: -1}, function(lis) {
      var rt = nil;
      while (lis !== nil) {
        rt = cons(car(lis), rt);
        lis = cdr(lis);
      }
      return rt;
    }],
    'nrev': [{dot: 1}, function(lis, $$) {
      var r = $$ || nil;
      var tmp;
      while (lis !== nil && 'cdr' in lis) {
        tmp = lis.cdr;
        lis.cdr = r;
        r = lis;
        lis = tmp;
      }
      return r;
    }],
    'uniq': [{dot: 0}, function($$) {
      var u = '%g'+uniq_counter;
      if (0 < arguments.length) {
        u += ('-' + arguments[0].name);
      }
      var rt = Symbol.get(u);
      uniq_counter++;
      return rt;
    }],
    'type': [{dot: -1}, type],
    'err': [{dot: 0}, function($$) {
      throw new Error(
        ('error: ' +
         Array.prototype.map.call(
           arguments,
           function(x) { return type(x) === s_string ? x : stringify(x); }
         ).join(' ') + '.'));
    }],
    '+': [{dot: 0}, function($$) {
      var l = arguments.length, rt = 0;
      for (var i=l-1; 0<=i; i--) {
        if (typeof arguments[i] === 'string') {
          var rts = '';
          for (var i=l-1; 0<=i; i--)
            rts = coerce(arguments[i], s_string) + rts;
          return rts;
        }
      }
      if (l < 1) return 0;
      if (arguments[0] === nil || type(arguments[0]) === s_cons)
        return primitives['%list-append'].apply(this, arguments);
      for (var i=0; i<l; i++) rt += arguments[i];
      return rt;
    }],
    'min': [{dot: 0}, function($$) {
      var l = arguments.length, rt = Infinity;
      for (var i=l-1; 0<=i; i--) rt = Math.min(rt, arguments[i]);
      return rt;
    }],
    'max': [{dot: 0}, function($$) {
      var l = arguments.length, rt = -Infinity;
      for (var i=l-1; 0<=i; i--) rt = Math.max(rt, arguments[i]);
      return rt;
    }],
    '%list-append': [{dot: 0}, function($$) {
      var dotted = nil;
      for (var i=0, l=arguments.length, rt = nil; i<l; i++) {
        if (dotted !== nil) throw new Error(
          ('error: +(list): contract violation (' +
           Array.prototype.map.call(arguments, stringify).join(' ') + ')'));
        var lis = arguments[i];
        while (lis !== nil) {
          rt = cons(car(lis), rt);
          lis = cdr(lis);
          if (!(lis instanceof Cons)) { dotted = lis; break; }
        }
      }
      return nreverse(rt, dotted);
    }],
    '-': [{dot: 1}, function(x, $$) {
      for (var i=1, l=arguments.length, rt = arguments[0]; i<l; i++)
        rt -= arguments[i];
      return (l === 1) ? (-rt) : rt;
    }],
    '*': [{dot: 0}, function($$) {
      for (var i=0, l=arguments.length, rt = 1; i<l; i++)
        rt *= arguments[i];
      return rt;
    }],
    '/': [{dot: 1}, function(x, $$) {
      for (var i=1, l=arguments.length, rt = arguments[0]; i<l; i++)
        rt /= arguments[i];
      return rt;
    }],
    '<': [{dot: 0}, function($$) {
      for (var i=1, l=arguments.length; i<l; i++) {
        if (!(arguments[i-1] < arguments[i])) return nil;
      }
      return t;
    }],
    '>': [{dot: 0}, function($$) {
      for (var i=1, l=arguments.length; i<l; i++) {
        if (!(arguments[i-1] > arguments[i])) return nil;
      }
      return t;
    }],
    '<=': [{dot: 0}, function($$) {
      for (var i=1, l=arguments.length; i<l; i++) {
        if (!(arguments[i-1] <= arguments[i])) return nil;
      }
      return t;
    }],
    '>=': [{dot: 0}, function($$) {
      for (var i=1, l=arguments.length; i<l; i++) {
        if (!(arguments[i-1] >= arguments[i])) return nil;
      }
      return t;
    }],
    'odd': [{dot: -1}, function(x) {
      return (x % 2) ? t : nil;
    }],
    'even': [{dot: -1}, function(x) {
      return (x % 2) ? nil : t;
    }],
    'mod': [{dot: -1}, function(x, y) {
      return (x % y);
    }],
    'no': [{dot: -1}, function(x) {
      return (x === nil) ? t : nil;
    }],
    'is': [{dot: -1}, function(a, b) {
      return (a === b) ? t : nil;
    }],
    '%mem': [{dot: -1}, function(test, lis) {
      while (lis !== nil) {
        if (car(lis) === test) return lis;
        lis = cdr(lis);
      }
      return nil;
    }],
    '%pos': [{dot: -1}, function(test, lis) {
      var i = 0;
      while (lis !== nil) {
        if (car(lis) === test) return i;
        lis = cdr(lis);
        i++;
      }
      return nil;
    }],
    'atom': [{dot: -1}, function(x) {
      return (type(x).name === 'cons') ? nil : t;
    }],
    'apply': [{dot: 1}, function(fn, $$) {
      for (var i=1, l=arguments.length-1, args=[]; i<l; i++)
        args[i-1] = arguments[i];
      if (0 < l) args = args.concat(list_to_javascript_arr(arguments[l]));
      return new Call(fn, args);
    }],
    '%pair': [{dot: -1}, function(lis) {
      var rt = nil, toggle = true;
      while (lis !== nil) {
        if (toggle) {
          rt = cons(cons(car(lis), nil), rt);
        } else {
          car(rt).cdr = cons(car(lis), nil);
        }
        lis = cdr(lis);
        toggle = !toggle;
      }
      return nreverse(rt);
    }],
    '%union': [{dot: -1}, function(test, lis1, lis2) {
      var arr = list_to_javascript_arr(lis1);
      while (lis2 !== nil) {
        var ca = car(lis2);
        if (arr.indexOf(ca) < 0) arr.push(ca);
        lis2 = cdr(lis2);
      }
      return javascript_arr_to_list(arr);
    }],
    'dedup': [{dot: -1}, function(lis) {
      var arr = list_to_javascript_arr(lis);
      var narr = [];
      for (var i=0, l=arr.length; i<l; i++) {
        if (narr.indexOf(arr[i]) < 0) narr.push(arr[i]);
      }
      return javascript_arr_to_list(narr);
    }],
    'table': [{dot: -1}, function() {
      return new Table();
    }],
    'ref': [{dot: -1}, function(obj, idx) {
      var val;
      switch (type(obj).name) {
      case 'string':
      case 'cons':
        throw new Error('todo');
        break;
      case 'table':
        val = obj.get(idx);
        break;
      }
      return val;
    }],
    'sref': [{dot: -1}, function(obj, val, idx) {
      switch (type(obj).name) {
      case 'string':
      case 'cons':
        throw new Error('todo');
        break;
      case 'table':
        obj.put(idx, val);
        break;
      }
      return val;
    }],
    'annotate': [{dot: -1}, function(tag, obj) {
      if (type(tag).name !== 'sym')
        throw new Error("First argument must be a symbol " + stringify(tag));
      return new Tagged(tag, obj);
    }],
    'rep': [{dot: -1}, function(tagged) {
      return tagged.obj;
    }],
    'coerce': [{dot: 2}, coerce],
    'bound': [{dot: -1}, function(symbol) {
      return (symbol.name in this.global) ? t : nil;
    }],
    'newstring': [{dot: -1}, function(n, c) {
      var nt = type(n).name, ct = type(c).name;
      if ((nt === 'int' || nt === 'num') && ct === 'char') {
        var rt = '';
        for (;0<n;n--) rt += c.c;
        return rt;
      }
      throw new Error('newstring requires int, char.');
    }],
    'in-ns': [{dot: -1}, function(n) {
      NameSpace.push(this.namespace);
      this.namespace = this.namespace.extend(n.name);
      this.global = this.namespace.vars;
      return nil;
    }],
    'exit-ns': [{dot: -1}, function() {
      this.namespace = NameSpace.pop();
      if (!this.namespace) return nil; // throw new Error('this is root ns.');
      this.global = this.namespace.vars;
      return nil;
    }],
    'isa': [{dot: -1}, function(x, typ) {
      return (type(x) === typ) ? t : nil;
    }],
    'acons': [{dot: -1}, function(x) {
      return (type(x) === s_cons) ? t : nil;
    }],
    'idfn': [{dot: -1}, function(x) { return x; }],
    'disp': [{dot: 1}, function(item, $$) {
      if (!is_nodejs) { throw new Error("'disp' is not supported in Browser."); }
      var stream = process.stdout;
      var l = arguments.length;
      if (0 < l) {
        if (1 < l) {
          stream = arguments[1];
        }
        stream.write(stringify_for_disp(item));
      }
      return nil;
    }],
    'pr': [{dot: 0}, function($$) {
      if (!is_nodejs) { throw new Error("'pr' is not supported in Browser."); }
      for (var i = 0, l = arguments.length; i < l; i++) {
        process.stdout.write(stringify_for_disp(arguments[i]));
      }
      return (0 < l) ? arguments[0] : nil;
    }],
    'prt': [{dot: 0}, function($$) {
      if (!is_nodejs) { throw new Error("'prt' is not supported in Browser."); }
      for (var i = 0, l = arguments.length; i < l; i++) {
        if (arguments[i] !== nil) process.stdout.write(stringify_for_disp(arguments[i]));
      }
      return (0 < l) ? arguments[0] : nil;
    }],
    'prn': [{dot: 0}, function($$) {
      if (0 < arguments.length) {
        var arr = Array.prototype.map.call(arguments, stringify_for_disp);
        console.log(arr.join(''));
        return arguments[0];
      }
      return nil;
    }],
  };
  for (var n in rt) {
    var f = rt[n];
    if (f instanceof Array && typeof f[1] === 'function') {
      var options = f[0];
      f = f[1];
      f.dotpos = options['dot'];
      f.toString().match(/^function.*?\((.*?)\)/);
      var args = RegExp.$1;
      if (args === '') {
        f.arglen = 0;
        f.prim_name = n;
      } else {
        var vs = args.split(/\s*,\s*/g);
        f.arglen = vs.length;
        f.prim_name = n;
      }
      rt[n] = f;
    }
  }
  return rt;
})();

var cons  = primitives.cons;
var list  = primitives.list;
var car   = primitives.car;
var scar  = primitives.scar;
var cdr   = primitives.cdr;
var scdr  = primitives.scdr;
var caar  = primitives.caar;
var cadr  = primitives.cadr;
var cddr  = primitives.cddr;
var nreverse = primitives.nrev;
var rep = primitives.rep;
var annotate = primitives.annotate;

ArcJS.nil = nil;
ArcJS.t = t;
ArcJS.type = type;
ArcJS.stringify = stringify;
ArcJS.cons = cons;
ArcJS.list = list;
ArcJS.car = car;
ArcJS.cdr = cdr;
ArcJS.cadr = cadr;
ArcJS.cddr = cddr;
ArcJS.nreverse = nreverse;
ArcJS.rep = rep;
ArcJS.annotate = annotate;
ArcJS.list_to_javascript_arr = list_to_javascript_arr;
ArcJS.javascript_arr_to_list = javascript_arr_to_list;
/** @} */
/** @file reader.js { */
var Reader = classify("Reader", {

  static: {
    EOF:    new Object(),
    DOT:    new Object(),
    LPAREN: new Object(),
    RPAREN: new Object(),
    LBRACK: new Object(),
    RBRACK: new Object(),
    QUOTE:            Symbol.get('quote'),
    QUASIQUOTE:       Symbol.get('quasiquote'),
    UNQUOTE:          Symbol.get('unquote'),
    UNQUOTE_SPLICING: Symbol.get('unquote-splicing')
  },

  property: {
    str: '',
    i: 0,
    slen: 0,
    subreader: null,
    vm: null
  },

  method: {
    init: function(vm) {
      this.vm = vm;
    },

    get_subreader: function() {
      if (this.subreader) return this.subreader;
      this.subreader = new Reader(this.vm);
      return this.subreader;
    },

    load_source: function(str) {
      this.str = str;
      this.slen = str.length;
      this.i = 0;
    },

    whitespace_p: function(c) {
      return (-1 < String.fromCharCode(9,10,11,12,13,32).indexOf(c));
    },

    delimited: function(c) {
      return this.whitespace_p(c) || (-1 < '()[]";'.indexOf(c));
    },

    number_p: function(c) {
      return (-1 < '0123456789+-.'.indexOf(c));
    },

    reader_macro_p: function(c) {
      return c === '#';
    },

    read_reader_macro: function(c) {
      if (c === '\\') {
        if (this.i < this.slen) return Char.get(this.str[this.i++]);
      }
      if (c === '/') {
        if (this.i < this.slen) return this.read_regexp();
      }
      var tok = this.read_thing();
      if (tok.length === 0) throw new Error("unexpected end-of-file while reading macro-char #" + c);
      switch (c) {
      case 'x':
        return parseInt(tok, 16);
      case 'd':
        return parseInt(tok, 10);
      case 'o':
        return parseInt(tok, 8);
      case 'b':
        return parseInt(tok, 2);
      }
    },

    read_list: function(bracketed) {
      var token;
      var lis = nil;
      while ((token = this.read_token()) !== Reader.EOF) {
        if (token === Reader.RPAREN) {
          if (bracketed) throw new Error("bracketed list terminated by parenthesis");
          return nreverse(lis, nil);
        }
        if (token === Reader.RBRACK) {
          if (!bracketed) throw new Error("parenthesized list terminated by bracket");
          return nreverse(lis, nil);
        }
        if (token === Reader.LPAREN) {
          lis = cons(this.read_list(), lis);
          continue;
        }
        if (token === Reader.LBRACK) {
          lis = cons(this.read_blist(), lis);
          continue;
        }
        if (token === Reader.DOT) {
          if (lis === nil) throw new Error("misplaced dot('.') while reading list.");
          var rest = this.read_expr();
          if (rest === Reader.DOT) throw new Error("misplaced dot('.') while reading list.");
          token = this.read_token();
          if (token === Reader.RPAREN) {
            if (bracketed) throw new Error("bracketed list terminated by parenthesis.");
            lis = nreverse(lis, rest);
            return lis;
          }
          if (token === Reader.RBRACK) {
            if (!bracketed) throw new Error("parenthesized list terminated by bracket.");
            lis = nreverse(lis, rest);
            return lis;
          }
          if (token === Reader.EOF) throw new Error("unexpected end-of-file while reading list.");
          throw new Error("more than one item following dot('.') while reading list.");
        }
        lis = cons(token, lis);
      }
      throw new Error("unexpected end-of-file while reading list");
    },

    read_blist: function() {
      var body = this.read_list(true);
      return cons(Symbol.get('%shortfn'), cons(body, nil));
    },

    read_thing: function() {
      var thing = '';
      while (this.i < this.slen) {
        var c = this.str[this.i];
        if (this.delimited(c)) {
          return thing;
        }
        thing += c;
        this.i++;
      }
      return thing;
    },

    read_number: function() {
      var tok = this.read_thing();
      if (tok.length === 0) return Reader.EOF;
      if (tok === '.') return Reader.DOT;
      if (tok === '+' || tok === '-') return this.make_symbol(tok);
      return this.make_number(tok);
    },

    make_number: function(tok) {
      if (tok === '+inf.0')      return Infinity;
      else if (tok === '-inf.0') return -Infinity;
      var n = parseFloat(tok);
      // TODO flaction, imagine, +pattern.
      if (n === NaN) throw new Error("parsing failed the number " + tok);
      return n;
    },

    read_symbol: function() {
      var tok = this.read_thing();
      if (tok.length === 0) return Reader.EOF;
      var ss = this.vm.global['%___special_syntax___'];
      if (ss) {
        var ss = ss.v.src;
        for (var s in ss) {
          var def = rep(ss[s]);
          var m = tok.match(new RegExp(rep(car(def))));
          if (m) {
            var expanded = this.vm.arc_apply(cdr(def), m.slice(1));
            return this.get_subreader().read(expanded);
          }
        }
      }
      return this.make_symbol(tok);
    },

    make_symbol: function(tok) {
      if (tok === 'nil') return nil;
      if (tok === 't') return true;
      return Symbol.get(tok);
    },

    read_string: function(delimiter, type, escape_only_delimiter) {
      delimiter = delimiter || '"';
      type = type || 'string';
      var str = '', esc = false;
      while(this.i < this.slen) {
        var c = this.str[this.i++];
        // TODO more Escape patterns.
        if (esc) {
          esc = false;
          var escaped_char = (({n: '\n', r: '\r', s: '\s', t: '\t'})[c]);
          if (escape_only_delimiter && !escaped_char && c !== delimiter) {
            str += '\\' + c;
          } else {
            str += escaped_char || c;
          }
          continue;
        } else {
          switch(c) {
          case '\\':
            esc = true;
            continue;
          case delimiter:
            return str;
          default:
            str += c;
            continue;
          }
        }
      }
      throw new Error("unexpected end-of-file while reading " + type);
    },

    read_regexp: function() {
      var str = this.read_string('/', 'regexp', true);
      return list(Symbol.get('annotate'), list(Symbol.get('quote'), Symbol.get('regexp')), str);
    },

    read_token: function() {
      var c = '', tmp = '';
      outer:
      while (true) {
        if (this.slen <= this.i) return Reader.EOF;
        c = this.str[this.i++];
        if (this.whitespace_p(c)) { continue; }
        if (this.number_p(c)) { this.i--; return this.read_number(); }
        if (this.reader_macro_p(c)) {
          c = this.str[this.i++];
          if (c === '|') {
            c = '';
            while (this.i < this.slen) {
              tmp = c;
              c = this.str[this.i++];
              if (tmp+c === '|#') continue outer;
            }
            return Reader.EOF;
          }
          return this.read_reader_macro(c);
        }
        switch (c) {
        case ";":
          while (this.i < this.slen) {
            c = this.str[this.i++];
            if (c === '\n' || c === '\r') continue outer;
          }
          return Reader.EOF;
        case '"': return this.read_string();
        case '(': return Reader.LPAREN;
        case ')': return Reader.RPAREN;
        case '[': return Reader.LBRACK;
        case ']': return Reader.RBRACK;
        case "'": {
          var obj = this.read_expr();
          if (obj === Reader.EOF) throw new Error("unexpected end-of-file following quotation-mark(')");
          return cons(Reader.QUOTE, cons(obj, nil));
        }
        case "`": {
          var obj = this.read_expr();
          if (obj === Reader.EOF) throw new Error("unexpected end-of-file following backquotation-mark(`)");
          return cons(Reader.QUASIQUOTE, cons(obj, nil));
        }
        case ',':
          if (this.slen <= this.i) throw new Error("unexpected end-of-file following comma(,)");
          c = this.str[this.i++];
          if (c === '@') {
            var obj = this.read_expr();
            return cons(Reader.UNQUOTE_SPLICING, cons(obj, nil));
          }
          this.i--;
          return cons(Reader.UNQUOTE, cons(this.read_expr(), nil));
        default:
          this.i--;
          return this.read_symbol();
        }
      }
    },

    read_expr: function() {
      var token = this.read_token();
      if (token === Reader.RPAREN) throw new Error("unexpected closing parenthesis");
      if (token === Reader.RBRACK) throw new Error("unexpected closing bracket");
      if (token === Reader.LPAREN) return this.read_list();
      if (token === Reader.LBRACK) return this.read_blist();
      return token;
    },

    read: function(str) {
      if (str) this.load_source(str);
      return this.read_expr();
    }
  }
});
ArcJS.Reader = Reader;
/** @} */
/** @file preload.js { */
var preload = [];
// compiler
/** @file compiler.fasl { */
// This is an auto generated file.
// Compiled from ['/Users/smihica/code/arc-js/src/arc/compiler.arc'].
// DON'T EDIT !!!
preload.push.apply(preload, [
[0,6,6,"0",7,11,"table",21,22,19,"%___macros___",25],
[0,6,6,"0",7,11,"table",21,22,19,"%___special_syntax___",25],
[0,119,11,"%___macros___",21,7,0,107,6,"mac",7,1,0,98,3,2,9,0,2,65,6,"assign",7,9,2,7,0,52,6,"sref",7,6,"%___macros___",7,0,30,6,"annotate",7,6,"(quote mac)",7,0,19,0,10,6,"fn",7,9,1,7,6,"2",7,11,"list",21,22,7,9,0,7,6,"2",7,11,"+",21,22,7,6,"3",7,11,"list",21,22,7,0,10,6,"quote",7,9,2,7,6,"2",7,11,"list",21,22,7,6,"4",7,11,"list",21,22,7,6,"3",7,11,"list",21,5,4,4,22,3,31,6,"annotate",7,6,"(quote mac)",7,0,19,0,10,6,"fn",7,9,2,7,6,"2",7,11,"list",21,22,7,9,1,7,6,"2",7,11,"+",21,22,7,6,"3",7,11,"list",21,5,4,4,22,23,4,7,6,"2",7,11,"annotate",21,22,7,6,"mac",7,6,"3",7,11,"sref",21,22,19,"mac",25],
[0,41,11,"%___macros___",21,7,0,29,6,"mac",7,1,0,20,1,-1,6,"fn",7,0,8,6,"_",7,6,"1",7,11,"list",21,22,7,9,0,7,6,"3",7,11,"list",21,5,4,2,22,7,6,"2",7,11,"annotate",21,22,7,6,"%shortfn",7,6,"3",7,11,"sref",21,22,19,"%shortfn",25],
[0,72,11,"%___macros___",21,7,0,60,6,"mac",7,1,0,51,3,2,6,"with",7,0,10,9,2,7,12,7,6,"2",7,11,"list",21,22,7,0,30,6,"assign",7,9,2,7,0,19,0,10,6,"fn",7,9,1,7,6,"2",7,11,"list",21,22,7,9,0,7,6,"2",7,11,"+",21,22,7,6,"3",7,11,"list",21,22,7,6,"3",7,11,"list",21,5,4,4,22,7,6,"2",7,11,"annotate",21,22,7,6,"rfn",7,6,"3",7,11,"sref",21,22,19,"rfn",25],
[0,43,11,"%___macros___",21,7,0,31,6,"mac",7,1,0,22,2,1,0,12,6,"rfn",7,6,"self",7,9,1,7,6,"3",7,11,"list",21,22,7,9,0,7,6,"2",7,11,"+",21,5,3,3,22,7,6,"2",7,11,"annotate",21,22,7,6,"afn",7,6,"3",7,11,"sref",21,22,19,"afn",25],
[0,145,11,"%___macros___",21,7,0,133,6,"mac",7,1,0,124,1,0,0,8,9,0,7,6,"1",7,11,"%pair",21,22,7,6,"1",7,12,7,14,20,0,8,0,0,7,1,1,102,1,-1,0,8,9,0,7,6,"1",7,11,"car",21,22,7,14,0,17,0,8,8,0,0,7,6,"1",7,11,"len",21,22,7,6,"2",7,6,"2",7,11,"is",21,22,2,44,6,"%if",7,0,8,8,0,0,7,6,"1",7,11,"car",21,22,7,0,8,8,0,0,7,6,"1",7,11,"cadr",21,22,7,0,15,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,10,0,21,22,7,6,"4",7,11,"list",21,5,5,4,22,3,29,0,17,0,8,8,0,0,7,6,"1",7,11,"len",21,22,7,6,"1",7,6,"2",7,11,"is",21,22,2,10,8,0,0,7,6,"1",7,11,"car",21,5,2,4,22,3,2,12,15,2,23,2,16,0,0,15,2,5,2,2,22,7,6,"2",7,11,"annotate",21,22,7,6,"if",7,6,"3",7,11,"sref",21,22,19,"if",25],
[0,93,11,"%___macros___",21,7,0,81,6,"mac",7,1,0,72,1,0,0,8,9,0,7,6,"1",7,11,"cdr",21,22,2,46,6,"%if",7,0,8,9,0,7,6,"1",7,11,"car",21,22,7,0,24,0,8,6,"and",7,6,"1",7,11,"list",21,22,7,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"+",21,22,7,12,7,6,"4",7,11,"list",21,5,5,2,22,3,17,0,8,9,0,7,6,"1",7,11,"car",21,22,7,14,8,0,0,2,3,8,0,0,3,2,12,15,2,23,2,7,6,"2",7,11,"annotate",21,22,7,6,"and",7,6,"3",7,11,"sref",21,22,19,"and",25],
[0,100,11,"%___macros___",21,7,0,88,6,"mac",7,1,0,79,1,0,9,0,2,75,0,6,6,"0",7,11,"uniq",21,22,7,14,0,64,6,"with",7,0,17,8,0,0,7,0,8,9,0,7,6,"1",7,11,"car",21,22,7,6,"2",7,11,"list",21,22,7,0,37,6,"%if",7,8,0,0,7,8,0,0,7,0,24,0,8,6,"or",7,6,"1",7,11,"list",21,22,7,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"+",21,22,7,6,"4",7,11,"list",21,22,7,6,"3",7,11,"list",21,22,15,2,3,2,12,23,2,7,6,"2",7,11,"annotate",21,22,7,6,"or",7,6,"3",7,11,"sref",21,22,19,"or",25],
[0,50,11,"%___macros___",21,7,0,38,6,"mac",7,1,0,29,3,2,0,19,6,"with",7,0,10,9,2,7,9,1,7,6,"2",7,11,"list",21,22,7,6,"2",7,11,"list",21,22,7,9,0,7,6,"2",7,11,"+",21,5,3,4,22,7,6,"2",7,11,"annotate",21,22,7,6,"let",7,6,"3",7,11,"sref",21,22,19,"let",25],
[0,52,11,"%___macros___",21,7,0,40,6,"mac",7,1,0,31,3,2,6,"assign",7,9,2,7,0,19,0,10,6,"fn",7,9,1,7,6,"2",7,11,"list",21,22,7,9,0,7,6,"2",7,11,"+",21,22,7,6,"3",7,11,"list",21,5,4,4,22,7,6,"2",7,11,"annotate",21,22,7,6,"def",7,6,"3",7,11,"sref",21,22,19,"def",25],
[0,158,11,"%___macros___",21,7,0,146,6,"mac",7,1,0,137,1,0,0,8,9,0,7,6,"1",7,11,"%pair",21,22,7,6,"1",7,12,7,14,20,0,8,0,0,7,1,1,115,1,-1,0,8,9,0,7,6,"1",7,11,"car",21,22,7,14,0,17,0,8,8,0,0,7,6,"1",7,11,"len",21,22,7,6,"2",7,6,"2",7,11,"is",21,22,2,57,6,"let",7,6,"it",7,0,8,8,0,0,7,6,"1",7,11,"car",21,22,7,0,35,6,"%if",7,6,"it",7,0,8,8,0,0,7,6,"1",7,11,"cadr",21,22,7,0,15,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,10,0,21,22,7,6,"4",7,11,"list",21,22,7,6,"4",7,11,"list",21,5,5,4,22,3,29,0,17,0,8,8,0,0,7,6,"1",7,11,"len",21,22,7,6,"1",7,6,"2",7,11,"is",21,22,2,10,8,0,0,7,6,"1",7,11,"car",21,5,2,4,22,3,2,12,15,2,23,2,16,0,0,15,2,5,2,2,22,7,6,"2",7,11,"annotate",21,22,7,6,"aif",7,6,"3",7,11,"sref",21,22,19,"aif",25],
[0,143,11,"%___macros___",21,7,0,131,6,"mac",7,1,0,122,3,2,12,7,14,20,0,8,0,0,7,9,2,7,1,2,89,1,-1,0,15,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"no",21,22,2,10,9,0,7,6,"1",7,11,"car",21,5,2,2,22,3,63,6,"if",7,0,28,6,"is",7,10,0,7,0,17,6,"quote",7,0,8,9,0,7,6,"1",7,11,"car",21,22,7,6,"2",7,11,"list",21,22,7,6,"3",7,11,"list",21,22,7,0,8,9,0,7,6,"1",7,11,"cadr",21,22,7,0,15,0,8,9,0,7,6,"1",7,11,"cddr",21,22,7,6,"1",7,10,1,21,22,7,6,"4",7,11,"list",21,5,5,2,22,23,2,16,0,0,15,2,7,14,6,"let",7,9,2,7,9,1,7,0,7,9,0,7,6,"1",7,8,0,0,22,7,6,"4",7,11,"list",21,5,5,6,22,7,6,"2",7,11,"annotate",21,22,7,6,"caselet",7,6,"3",7,11,"sref",21,22,19,"caselet",25],
[0,48,11,"%___macros___",21,7,0,36,6,"mac",7,1,0,27,2,1,0,17,6,"caselet",7,0,6,6,"0",7,11,"uniq",21,22,7,9,1,7,6,"3",7,11,"list",21,22,7,9,0,7,6,"2",7,11,"+",21,5,3,3,22,7,6,"2",7,11,"annotate",21,22,7,6,"case",7,6,"3",7,11,"sref",21,22,19,"case",25],
[0,220,11,"%___macros___",21,7,0,208,6,"mac",7,1,0,199,2,1,0,17,0,8,9,0,7,6,"1",7,11,"len",21,22,7,6,"1",7,6,"2",7,11,"-",21,22,7,14,0,10,8,0,0,7,9,0,7,6,"2",7,11,"firstn",21,22,7,0,10,8,0,0,7,9,0,7,6,"2",7,11,"nthcdr",21,22,7,14,6,"case",7,0,147,0,19,6,"car",7,0,10,9,1,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,120,0,111,11,"+",21,7,12,7,0,99,9,1,7,1,1,88,1,-1,0,8,9,0,7,6,"1",7,11,"car",21,22,7,0,71,0,62,6,"apply",7,0,53,0,17,6,"fn",7,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"cons",21,22,7,0,28,0,19,6,"cdr",7,0,10,10,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,2,22,7,8,0,1,7,6,"2",7,11,"map1",21,22,7,6,"3",7,11,"apply",21,22,7,8,0,0,7,6,"2",7,11,"+",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,8,22,7,6,"2",7,11,"annotate",21,22,7,6,"reccase",7,6,"3",7,11,"sref",21,22,19,"reccase",25],
[0,136,11,"%___macros___",21,7,0,124,6,"mac",7,1,0,115,3,2,0,6,6,"0",7,11,"uniq",21,22,7,0,6,6,"0",7,11,"uniq",21,22,7,14,0,90,6,"rfn",7,8,0,1,7,0,8,8,0,0,7,6,"1",7,11,"list",21,22,7,0,70,6,"if",7,8,0,0,7,0,59,6,"do",7,0,30,0,21,6,"let",7,9,2,7,0,10,6,"car",7,8,0,0,7,6,"2",7,11,"list",21,22,7,6,"3",7,11,"list",21,22,7,9,0,7,6,"2",7,11,"+",21,22,7,0,19,8,0,1,7,0,10,6,"cdr",7,8,0,0,7,6,"2",7,11,"list",21,22,7,6,"2",7,11,"list",21,22,7,6,"3",7,11,"list",21,22,7,6,"3",7,11,"list",21,22,7,6,"4",7,11,"list",21,22,7,9,1,7,6,"2",7,11,"list",21,5,3,7,22,7,6,"2",7,11,"annotate",21,22,7,6,"each",7,6,"3",7,11,"sref",21,22,19,"each",25],
[1,0,195,1,-1,4,2,7,6,"1",7,9,0,7,1,1,186,1,-1,10,0,7,6,"1",7,12,7,14,20,0,8,0,0,7,9,0,7,1,2,169,1,-1,0,8,9,0,7,6,"1",7,11,"type",21,22,7,14,0,10,8,0,0,7,6,"cons",7,6,"2",7,11,"is",21,22,2,145,0,8,9,0,7,6,"1",7,11,"car",21,22,7,14,0,10,8,0,0,7,6,"unquote",7,6,"2",7,11,"is",21,22,2,28,0,26,10,0,7,1,1,8,1,-1,13,7,6,"1",7,10,0,5,2,2,22,7,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,95,0,10,8,0,0,7,6,"unquote-splicing",7,6,"2",7,11,"is",21,22,2,28,0,26,10,0,7,1,1,8,1,-1,13,7,6,"1",7,10,0,5,2,2,22,7,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,57,0,56,9,0,7,6,"1",7,12,7,14,20,0,8,0,0,7,10,1,7,1,2,40,1,-1,9,0,2,36,0,8,9,0,7,6,"1",7,11,"car",21,22,7,14,0,8,8,0,0,7,6,"1",7,10,0,21,22,15,2,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,10,1,21,5,2,2,22,3,2,12,23,2,16,0,0,15,2,22,15,2,3,2,12,15,2,23,2,16,0,0,15,2,5,2,2,22,5,2,2,22,19,"find-qq-eval",25],
[1,0,474,1,-1,0,8,9,0,7,6,"1",7,11,"find-qq-eval",21,22,2,19,0,17,0,8,9,0,7,6,"1",7,11,"type",21,22,7,6,"cons",7,6,"2",7,11,"is",21,22,3,2,12,2,434,0,8,9,0,7,6,"1",7,11,"car",21,22,7,14,0,10,8,0,0,7,6,"unquote",7,6,"2",7,11,"is",21,22,2,21,0,19,1,0,3,1,-1,9,0,23,2,7,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,391,0,10,8,0,0,7,6,"unquote-splicing",7,6,"2",7,11,"is",21,22,2,27,0,25,1,0,9,1,-1,6,"\"cannot use ,@ after .\"",7,6,"1",7,11,"err",21,5,2,2,22,7,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,354,0,15,0,8,9,0,7,6,"1",7,11,"car",21,22,7,6,"1",7,11,"type",21,22,7,14,0,10,8,0,0,7,6,"cons",7,6,"2",7,11,"is",21,22,2,285,0,15,0,8,9,0,7,6,"1",7,11,"car",21,22,7,6,"1",7,11,"car",21,22,7,14,0,10,8,0,0,7,6,"quasiquote",7,6,"2",7,11,"is",21,22,2,68,0,66,9,0,7,1,1,41,1,-1,6,"cons",7,0,15,0,8,9,0,7,6,"1",7,11,"expand-qq",21,22,7,6,"1",7,11,"qq-pair",21,22,7,0,15,0,8,10,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"qq-pair",21,22,7,6,"3",7,11,"list",21,5,4,2,22,7,0,15,0,8,9,0,7,6,"1",7,11,"car",21,22,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,188,0,10,8,0,0,7,6,"unquote",7,6,"2",7,11,"is",21,22,2,54,0,52,9,0,7,1,1,27,1,-1,6,"cons",7,9,0,7,0,15,0,8,10,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"qq-pair",21,22,7,6,"3",7,11,"list",21,5,4,2,22,7,0,15,0,8,9,0,7,6,"1",7,11,"car",21,22,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,124,0,10,8,0,0,7,6,"unquote-splicing",7,6,"2",7,11,"is",21,22,2,73,0,71,9,0,7,1,1,46,1,-1,0,15,0,8,10,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"no",21,22,2,3,9,0,3,27,6,"+",7,9,0,7,0,15,0,8,10,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"qq-pair",21,22,7,6,"3",7,11,"list",21,5,4,2,22,23,2,7,0,15,0,8,9,0,7,6,"1",7,11,"car",21,22,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,41,0,40,6,"cons",7,0,15,0,8,9,0,7,6,"1",7,11,"car",21,22,7,6,"1",7,11,"qq-pair",21,22,7,0,15,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"qq-pair",21,22,7,6,"3",7,11,"list",21,22,15,2,3,41,0,40,6,"cons",7,0,15,0,8,9,0,7,6,"1",7,11,"car",21,22,7,6,"1",7,11,"qq-pair",21,22,7,0,15,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"qq-pair",21,22,7,6,"3",7,11,"list",21,22,15,2,15,2,3,11,6,"quote",7,9,0,7,6,"2",7,11,"list",21,5,3,2,22,23,2,19,"qq-pair",25],
[1,0,173,1,-1,0,8,9,0,7,6,"1",7,11,"find-qq-eval",21,22,2,19,0,17,0,8,9,0,7,6,"1",7,11,"type",21,22,7,6,"cons",7,6,"2",7,11,"is",21,22,3,2,12,2,133,0,8,9,0,7,6,"1",7,11,"car",21,22,7,14,0,10,8,0,0,7,6,"quasiquote",7,6,"2",7,11,"is",21,22,2,34,0,32,1,0,16,1,-1,0,8,9,0,7,6,"1",7,11,"expand-qq",21,22,7,6,"1",7,11,"expand-qq",21,5,2,2,22,7,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,77,0,10,8,0,0,7,6,"unquote",7,6,"2",7,11,"is",21,22,2,21,0,19,1,0,3,1,-1,9,0,23,2,7,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,46,0,10,8,0,0,7,6,"unquote-splicing",7,6,"2",7,11,"is",21,22,2,27,0,25,1,0,9,1,-1,6,"\",@ cannot be used immediately after `\"",7,6,"1",7,11,"err",21,5,2,2,22,7,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,9,0,8,9,0,7,6,"1",7,11,"qq-pair",21,22,15,2,3,11,6,"quote",7,9,0,7,6,"2",7,11,"list",21,5,3,2,22,23,2,19,"expand-qq",25],
[0,30,11,"%___macros___",21,7,0,18,6,"mac",7,1,0,9,1,-1,9,0,7,6,"1",7,11,"expand-qq",21,5,2,2,22,7,6,"2",7,11,"annotate",21,22,7,6,"quasiquote",7,6,"3",7,11,"sref",21,22,19,"quasiquote",25],
[1,0,71,2,-1,9,0,7,12,7,6,"2",7,12,7,14,20,0,9,1,7,8,0,0,7,1,2,52,2,-1,9,1,2,41,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,0,23,0,14,0,8,9,1,7,6,"1",7,11,"car",21,22,7,6,"1",7,10,1,22,7,9,0,7,6,"2",7,11,"cons",21,22,7,6,"2",7,10,0,21,5,3,3,22,3,9,9,0,7,6,"1",7,11,"nrev",21,5,2,3,22,23,3,16,0,0,15,2,5,3,3,22,19,"map1",25],
[0,119,11,"%___macros___",21,7,0,107,6,"mac",7,1,0,98,2,1,0,8,9,1,7,6,"1",7,11,"no",21,22,2,12,6,"do",7,9,0,7,6,"2",7,11,"cons",21,5,3,3,22,3,77,6,"let",7,0,67,0,8,9,1,7,6,"1",7,11,"car",21,22,7,0,51,0,8,9,1,7,6,"1",7,11,"cadr",21,22,7,0,35,0,26,6,"withs",7,0,17,0,8,9,1,7,6,"1",7,11,"cddr",21,22,7,9,0,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,3,22,23,3,7,6,"2",7,11,"annotate",21,22,7,6,"withs",7,6,"3",7,11,"sref",21,22,19,"withs",25],
[0,192,11,"%___macros___",21,7,0,180,6,"mac",7,1,0,171,2,1,0,8,9,1,7,6,"1",7,11,"acons",21,22,2,97,6,"with",7,0,86,0,77,11,"+",21,7,12,7,0,65,1,0,56,1,-1,9,0,7,0,46,0,37,6,"uniq",7,0,28,0,19,6,"quote",7,0,10,9,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,2,22,7,9,1,7,6,"2",7,11,"map1",21,22,7,6,"3",7,11,"apply",21,22,7,9,0,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,3,22,3,65,6,"let",7,0,55,9,1,7,0,46,0,37,6,"uniq",7,0,28,0,19,6,"quote",7,0,10,9,1,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,9,0,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,3,22,23,3,7,6,"2",7,11,"annotate",21,22,7,6,"w/uniq",7,6,"3",7,11,"sref",21,22,19,"w/uniq",25],
[0,164,11,"%___macros___",21,7,0,152,6,"mac",7,1,0,143,1,0,0,8,6,"g",7,6,"1",7,11,"uniq",21,22,7,14,6,"fn",7,0,123,8,0,0,7,0,114,0,105,9,0,7,6,"1",7,12,7,14,20,0,8,1,0,7,8,0,0,7,1,2,89,1,-1,0,8,9,0,7,6,"1",7,11,"cdr",21,22,2,33,0,8,9,0,7,6,"1",7,11,"car",21,22,7,0,15,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,10,0,21,22,7,6,"2",7,11,"list",21,5,3,2,22,3,47,6,"apply",7,0,37,0,8,9,0,7,6,"1",7,11,"car",21,22,2,10,0,8,9,0,7,6,"1",7,11,"car",21,22,3,2,6,"idfn",7,0,10,10,1,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,2,22,23,2,16,0,0,15,2,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,4,22,7,6,"2",7,11,"annotate",21,22,7,6,"compose",7,6,"3",7,11,"sref",21,22,19,"compose",25],
[1,0,22,1,-1,9,0,7,1,1,18,1,0,0,10,10,0,7,9,0,7,6,"2",7,11,"apply",21,22,7,6,"1",7,11,"no",21,5,2,2,22,23,2,19,"complement",25],
[0,176,11,"%___macros___",21,7,0,164,6,"mac",7,1,0,155,4,3,6,"assign",7,0,145,9,3,7,0,136,0,127,6,"sref",7,0,118,6,"%___special_syntax___",7,0,109,0,73,6,"annotate",7,0,64,6,"(quote special-syntax)",7,0,55,0,46,6,"cons",7,0,37,9,2,7,0,28,0,19,6,"fn",7,0,10,9,1,7,9,0,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,28,0,19,6,"quote",7,0,10,9,3,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,5,22,7,6,"2",7,11,"annotate",21,22,7,6,"defss",7,6,"3",7,11,"sref",21,22,19,"defss",25],
[0,56,11,"%___special_syntax___",21,7,0,44,6,"special-syntax",7,0,35,0,10,6,"regexp",7,6,"\"^(.*[^:]):([^:].*)$\"",7,6,"2",7,11,"annotate",21,22,7,1,0,17,2,-1,6,"\"(compose \"",7,9,1,7,6,"\" \"",7,9,0,7,6,"\")\"",7,6,"5",7,11,"+",21,5,6,3,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"annotate",21,22,7,6,"compose-ss",7,6,"3",7,11,"sref",21,22,19,"compose-ss",25],
[0,52,11,"%___special_syntax___",21,7,0,40,6,"special-syntax",7,0,31,0,10,6,"regexp",7,6,"\"^\\\\~(.*)$\"",7,6,"2",7,11,"annotate",21,22,7,1,0,13,1,-1,6,"\"(complement \"",7,9,0,7,6,"\")\"",7,6,"3",7,11,"+",21,5,4,2,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"annotate",21,22,7,6,"complement-ss",7,6,"3",7,11,"sref",21,22,19,"complement-ss",25],
[0,56,11,"%___special_syntax___",21,7,0,44,6,"special-syntax",7,0,35,0,10,6,"regexp",7,6,"\"^(.*)\\\\.(.*)$\"",7,6,"2",7,11,"annotate",21,22,7,1,0,17,2,-1,6,"\"(\"",7,9,1,7,6,"\" \"",7,9,0,7,6,"\")\"",7,6,"5",7,11,"+",21,5,6,3,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"annotate",21,22,7,6,"ssyntax-ss",7,6,"3",7,11,"sref",21,22,19,"ssyntax-ss",25],
[0,56,11,"%___special_syntax___",21,7,0,44,6,"special-syntax",7,0,35,0,10,6,"regexp",7,6,"\"^(.*)\\\\!(.*)$\"",7,6,"2",7,11,"annotate",21,22,7,1,0,17,2,-1,6,"\"(\"",7,9,1,7,6,"\" '\"",7,9,0,7,6,"\")\"",7,6,"5",7,11,"+",21,5,6,3,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"annotate",21,22,7,6,"ssyntax-with-quote-ss",7,6,"3",7,11,"sref",21,22,19,"ssyntax-with-quote-ss",25],
[0,56,11,"%___special_syntax___",21,7,0,44,6,"special-syntax",7,0,35,0,10,6,"regexp",7,6,"\"^(.*?)::(.*)$\"",7,6,"2",7,11,"annotate",21,22,7,1,0,17,2,-1,6,"\"(ns \"",7,9,1,7,6,"\" \"",7,9,0,7,6,"\")\"",7,6,"5",7,11,"+",21,5,6,3,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"annotate",21,22,7,6,"namespace",7,6,"3",7,11,"sref",21,22,19,"namespace",25],
[1,0,78,2,-1,0,10,9,1,7,6,"fn",7,6,"2",7,11,"isa",21,22,2,56,9,0,7,6,"1",7,12,7,14,20,0,8,0,0,7,9,1,7,1,2,38,1,-1,9,0,2,34,0,14,0,8,9,0,7,6,"1",7,11,"car",21,22,7,6,"1",7,10,0,22,2,3,9,0,3,16,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,10,1,21,5,2,2,22,3,2,12,23,2,16,0,0,15,2,5,2,3,22,3,11,9,1,7,9,0,7,6,"2",7,11,"%mem",21,5,3,3,22,23,3,19,"mem",25],
[1,0,91,2,-1,0,10,9,1,7,6,"fn",7,6,"2",7,11,"isa",21,22,2,69,9,0,7,6,"0",7,6,"2",7,12,7,14,20,0,8,0,0,7,9,1,7,1,2,49,2,-1,9,1,2,45,0,14,0,8,9,1,7,6,"1",7,11,"car",21,22,7,6,"1",7,10,0,22,2,3,9,0,3,27,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,0,10,9,0,7,6,"1",7,6,"2",7,11,"+",21,22,7,6,"2",7,10,1,21,5,3,3,22,3,2,12,23,3,16,0,0,15,2,5,3,3,22,3,11,9,1,7,9,0,7,6,"2",7,11,"%pos",21,5,3,3,22,23,3,19,"pos",25],
[1,0,32,3,-1,0,11,9,2,7,11,"is",21,7,6,"2",7,11,"is",21,22,2,14,9,2,7,9,1,7,9,0,7,6,"3",7,11,"%union",21,5,4,4,22,3,6,13,2,3,12,3,2,12,23,4,19,"union",25],
[1,0,263,2,1,0,20,1,0,11,1,-1,9,0,7,6,"string",7,6,"2",7,11,"isa",21,5,3,2,22,7,9,0,7,6,"2",7,11,"mem",21,22,2,129,0,21,11,"min",21,7,0,11,11,"len",21,7,9,0,7,6,"2",7,11,"map",21,22,7,6,"2",7,11,"apply",21,22,7,14,0,8,8,0,0,7,6,"1",7,11,"newstring",21,22,7,14,0,93,6,"0",7,6,"1",7,12,7,14,20,0,8,0,0,7,9,0,7,9,1,7,8,1,0,7,8,2,0,7,1,5,71,1,-1,0,10,9,0,7,10,0,7,6,"2",7,11,"is",21,22,2,3,10,1,3,57,0,39,10,1,7,0,28,10,2,7,0,19,9,0,7,1,1,8,1,-1,10,0,7,6,"1",7,9,0,5,2,2,22,7,10,3,7,6,"2",7,11,"map",21,22,7,6,"2",7,11,"apply",21,22,7,9,0,7,6,"3",7,11,"sref",21,22,0,10,9,0,7,6,"1",7,6,"2",7,11,"+",21,22,7,6,"1",7,10,4,21,5,2,2,22,23,2,16,0,0,15,2,22,15,4,3,113,0,15,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"no",21,22,2,19,9,1,7,0,8,9,0,7,6,"1",7,11,"car",21,22,7,6,"2",7,11,"map1",21,5,3,3,22,3,79,9,0,7,6,"1",7,12,7,14,20,0,8,0,0,7,9,1,7,1,2,62,1,-1,0,11,11,"no",21,7,9,0,7,6,"2",7,11,"mem",21,22,2,3,12,3,47,0,20,10,0,7,0,11,11,"car",21,7,9,0,7,6,"2",7,11,"map1",21,22,7,6,"2",7,11,"apply",21,22,7,0,18,0,11,11,"cdr",21,7,9,0,7,6,"2",7,11,"map1",21,22,7,6,"1",7,10,1,21,22,7,6,"2",7,11,"cons",21,5,3,2,22,23,2,16,0,0,15,2,5,2,3,22,23,3,19,"map",25],
[1,0,26,2,1,11,"+",21,7,12,7,0,13,11,"map",21,7,9,1,7,9,0,7,6,"3",7,11,"apply",21,22,7,6,"3",7,11,"apply",21,5,4,3,22,19,"mappend",25],
[1,0,46,1,-1,0,17,0,8,9,0,7,6,"1",7,11,"type",21,22,7,6,"cons",7,6,"2",7,11,"is",21,22,2,13,11,"flat",21,7,9,0,7,6,"2",7,11,"mappend",21,5,3,2,22,3,15,9,0,2,12,9,0,7,12,7,6,"2",7,11,"cons",21,5,3,2,22,3,2,12,23,2,19,"flat",25],
[1,0,34,2,-1,9,1,7,1,1,22,1,-1,0,7,9,0,7,6,"1",7,10,0,22,2,12,9,0,7,12,7,6,"2",7,11,"cons",21,5,3,2,22,3,2,12,23,2,7,9,0,7,6,"2",7,11,"mappend",21,5,3,3,22,19,"keep",25],
[1,0,75,2,-1,9,1,2,71,0,17,0,8,9,1,7,6,"1",7,11,"car",21,22,7,9,0,7,6,"2",7,11,"%mem",21,22,2,19,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,9,0,7,6,"2",7,11,"set-minus",21,5,3,3,22,3,34,0,8,9,1,7,6,"1",7,11,"car",21,22,7,0,17,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,9,0,7,6,"2",7,11,"set-minus",21,22,7,6,"2",7,11,"cons",21,5,3,3,22,3,2,12,23,3,19,"set-minus",25],
[1,0,75,2,-1,9,1,2,71,0,17,0,8,9,1,7,6,"1",7,11,"car",21,22,7,9,0,7,6,"2",7,11,"%mem",21,22,2,35,0,8,9,1,7,6,"1",7,11,"car",21,22,7,0,17,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,9,0,7,6,"2",7,11,"set-intersect",21,22,7,6,"2",7,11,"cons",21,5,3,3,22,3,18,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,9,0,7,6,"2",7,11,"set-intersect",21,5,3,3,22,3,2,12,23,3,19,"set-intersect",25],
[1,0,64,1,-1,0,8,9,0,7,6,"1",7,11,"no",21,22,2,3,12,3,52,0,8,9,0,7,6,"1",7,11,"atom",21,22,2,12,9,0,7,12,7,6,"2",7,11,"cons",21,5,3,2,22,3,32,0,8,9,0,7,6,"1",7,11,"car",21,22,7,0,15,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"dotted-to-proper",21,22,7,6,"2",7,11,"cons",21,5,3,2,22,23,2,19,"dotted-to-proper",25],
[1,0,67,1,-1,9,0,7,6,"0",7,6,"2",7,12,7,14,20,0,8,0,0,7,1,1,50,2,-1,0,8,9,1,7,6,"1",7,11,"no",21,22,2,3,6,"-1",3,38,0,8,9,1,7,6,"1",7,11,"atom",21,22,2,3,9,0,3,27,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,0,10,9,0,7,6,"1",7,6,"2",7,11,"+",21,22,7,6,"2",7,10,0,21,5,3,3,22,23,3,16,0,0,15,2,5,3,2,22,19,"dotted-pos",25],
[1,0,129,3,2,0,8,9,0,7,6,"1",7,11,"acons",21,22,2,10,0,8,9,0,7,6,"1",7,11,"car",21,22,3,2,12,2,19,9,2,7,14,8,0,0,2,3,8,0,0,3,10,9,1,7,14,8,0,0,2,3,8,0,0,3,2,12,15,2,15,2,3,2,12,7,14,8,0,0,2,3,8,0,0,3,14,9,2,2,3,9,1,3,2,12,7,14,8,0,0,2,3,8,0,0,3,2,12,15,2,15,2,2,67,0,8,9,2,7,6,"1",7,11,"car",21,22,7,0,49,0,8,9,1,7,6,"1",7,11,"car",21,22,7,0,33,0,8,9,2,7,6,"1",7,11,"cdr",21,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,0,8,9,0,7,6,"1",7,11,"car",21,22,7,6,"3",7,11,"zip",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,4,22,3,2,12,23,4,19,"zip",25],
[1,0,32,1,-1,0,8,9,0,7,6,"1",7,11,"acons",21,22,2,17,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"dotted",21,5,2,2,22,3,6,9,0,2,3,13,3,2,12,23,2,19,"dotted",25],
[1,0,58,1,-1,0,15,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"no",21,22,2,10,9,0,7,6,"1",7,11,"car",21,5,2,2,22,3,32,0,8,9,0,7,6,"1",7,11,"car",21,22,7,0,15,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"dottify",21,22,7,6,"2",7,11,"cons",21,5,3,2,22,23,2,19,"dottify",25],
[1,0,57,1,-1,0,8,9,0,7,6,"1",7,11,"acons",21,22,2,33,0,8,9,0,7,6,"1",7,11,"car",21,22,7,0,15,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"undottify",21,22,7,6,"2",7,11,"cons",21,5,3,2,22,3,15,9,0,2,12,9,0,7,12,7,6,"2",7,11,"cons",21,5,3,2,22,3,2,12,23,2,19,"undottify",25],
[1,0,71,1,-1,0,17,0,8,9,0,7,6,"1",7,11,"type",21,22,7,6,"cons",7,6,"2",7,11,"is",21,22,2,20,0,18,11,"%___macros___",21,7,0,8,9,0,7,6,"1",7,11,"car",21,22,7,6,"2",7,11,"ref",21,22,3,2,12,7,14,8,0,0,2,26,0,8,8,0,0,7,6,"1",7,11,"rep",21,22,7,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,5,3,4,22,3,2,9,0,15,2,23,2,19,"macex1",25],
[1,0,771,2,-1,0,8,9,1,7,6,"1",7,11,"type",21,22,7,14,0,10,8,0,0,7,6,"cons",7,6,"2",7,11,"is",21,22,2,747,0,8,9,1,7,6,"1",7,11,"car",21,22,7,14,0,10,8,0,0,7,6,"quote",7,6,"2",7,11,"is",21,22,2,29,0,27,1,0,11,1,0,6,"quote",7,9,0,7,6,"2",7,11,"cons",21,5,3,2,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,696,0,10,8,0,0,7,6,"fn",7,6,"2",7,11,"is",21,22,2,241,0,239,9,0,7,1,1,221,2,1,0,8,9,1,7,6,"1",7,11,"%complex-args?",21,22,2,91,0,8,6,"arg",7,6,"1",7,11,"uniq",21,22,7,14,0,69,6,"fn",7,0,60,8,0,0,7,0,51,0,42,6,"with",7,0,33,0,24,0,8,9,1,7,6,"1",7,11,"list",21,22,7,0,8,8,0,0,7,6,"1",7,11,"list",21,22,7,6,"2",7,11,"%complex-args",21,22,7,9,0,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,15,2,7,10,0,7,6,"2",7,11,"%macex",21,5,3,3,22,3,121,6,"fn",7,0,111,9,1,7,0,102,0,17,0,8,9,0,7,6,"1",7,11,"len",21,22,7,6,"2",7,6,"2",7,11,"<",21,22,2,38,0,36,0,8,9,0,7,6,"1",7,11,"car",21,22,7,0,20,11,"is",21,7,0,8,9,1,7,6,"1",7,11,"dotted-to-proper",21,22,7,10,0,7,6,"3",7,11,"union",21,22,7,6,"2",7,11,"%macex",21,22,3,39,0,38,0,10,6,"do",7,9,0,7,6,"2",7,11,"cons",21,22,7,0,20,11,"is",21,7,0,8,9,1,7,6,"1",7,11,"dotted-to-proper",21,22,7,10,0,7,6,"3",7,11,"union",21,22,7,6,"2",7,11,"%macex",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,3,22,23,3,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,445,0,10,8,0,0,7,6,"with",7,6,"2",7,11,"is",21,22,2,311,0,309,9,0,7,1,1,291,2,1,0,8,9,1,7,6,"1",7,11,"%pair",21,22,7,14,0,11,11,"car",21,7,8,0,0,7,6,"2",7,11,"map1",21,22,7,14,0,8,8,0,0,7,6,"1",7,11,"%complex-args?",21,22,2,107,0,11,11,"cadr",21,7,8,1,0,7,6,"2",7,11,"map1",21,22,7,14,0,16,1,0,7,1,-1,6,"0",7,11,"uniq",21,5,1,2,22,7,8,0,0,7,6,"2",7,11,"map1",21,22,7,14,0,73,0,64,6,"with",7,0,55,0,10,8,0,0,7,8,1,0,7,6,"2",7,11,"zip",21,22,7,0,37,0,28,6,"with",7,0,19,0,10,8,2,0,7,8,0,0,7,6,"2",7,11,"%complex-args",21,22,7,9,0,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,10,0,7,6,"2",7,11,"%macex",21,22,15,4,3,151,6,"with",7,0,141,0,45,10,0,7,1,1,34,1,-1,0,8,9,0,7,6,"1",7,11,"car",21,22,7,0,17,0,8,9,0,7,6,"1",7,11,"cadr",21,22,7,10,0,7,6,"2",7,11,"%macex",21,22,7,6,"2",7,11,"list",21,5,3,2,22,7,8,1,0,7,6,"2",7,11,"mappend",21,22,7,0,88,0,17,0,8,9,0,7,6,"1",7,11,"len",21,22,7,6,"2",7,6,"2",7,11,"<",21,22,2,31,0,29,0,8,9,0,7,6,"1",7,11,"car",21,22,7,0,13,11,"is",21,7,8,0,0,7,10,0,7,6,"3",7,11,"union",21,22,7,6,"2",7,11,"%macex",21,22,3,32,0,31,0,10,6,"do",7,9,0,7,6,"2",7,11,"cons",21,22,7,0,13,11,"is",21,7,8,0,0,7,10,0,7,6,"3",7,11,"union",21,22,7,6,"2",7,11,"%macex",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,7,22,15,4,23,3,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,124,0,8,9,1,7,6,"1",7,11,"car",21,22,7,14,0,17,0,8,8,0,0,7,6,"1",7,11,"type",21,22,7,6,"sym",7,6,"2",7,11,"is",21,22,2,33,0,17,0,10,8,0,0,7,9,0,7,6,"2",7,11,"mem",21,22,7,6,"1",7,11,"no",21,22,2,13,0,11,11,"%___macros___",21,7,8,0,0,7,6,"2",7,11,"ref",21,22,3,2,12,3,2,12,15,2,7,14,8,0,0,2,35,0,33,0,24,0,8,8,0,0,7,6,"1",7,11,"rep",21,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,7,9,0,7,6,"2",7,11,"%macex",21,22,3,23,0,22,9,0,7,1,1,11,1,-1,9,0,7,10,0,7,6,"2",7,11,"%macex",21,5,3,2,22,7,9,1,7,6,"2",7,11,"map1",21,22,15,2,15,2,3,2,9,1,15,2,23,3,19,"%macex",25],
[1,0,11,2,1,9,1,7,9,0,7,6,"2",7,11,"%macex",21,5,3,3,22,19,"macex",25],
[1,0,329,2,-1,9,1,2,325,0,8,9,1,7,6,"1",7,11,"type",21,22,7,14,0,10,8,0,0,7,6,"sym",7,6,"2",7,11,"is",21,22,2,21,0,19,9,1,7,0,10,9,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,3,282,0,10,8,0,0,7,6,"cons",7,6,"2",7,11,"is",21,22,2,254,0,15,0,8,9,1,7,6,"1",7,11,"car",21,22,7,6,"1",7,11,"acons",21,22,2,19,0,17,0,8,9,1,7,6,"1",7,11,"caar",21,22,7,6,"o",7,6,"2",7,11,"is",21,22,3,2,12,2,125,0,123,0,8,9,1,7,6,"1",7,11,"cadar",21,22,7,0,107,0,98,6,"if",7,0,89,0,19,6,"acons",7,0,10,9,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,62,0,19,6,"car",7,0,10,9,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,35,0,15,0,8,9,1,7,6,"1",7,11,"cddar",21,22,7,6,"1",7,11,"acons",21,22,2,10,0,8,9,1,7,6,"1",7,11,"caddar",21,22,3,2,12,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,3,36,0,35,0,8,9,1,7,6,"1",7,11,"car",21,22,7,0,19,6,"car",7,0,10,9,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"%%complex-args",21,22,7,14,0,8,8,0,0,7,6,"1",7,11,"car",21,22,7,14,0,44,8,1,0,7,0,35,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,0,19,6,"cdr",7,0,10,9,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"%%complex-args",21,22,7,6,"2",7,11,"+",21,22,15,4,3,18,0,17,0,10,6,"\"Can't understand vars list\"",7,9,1,7,6,"2",7,11,"+",21,22,7,6,"1",7,11,"err",21,22,15,2,3,2,12,23,3,19,"%%complex-args",25],
[1,0,56,2,-1,1,0,25,1,-1,0,8,9,0,7,6,"1",7,11,"car",21,22,7,0,8,9,0,7,6,"1",7,11,"cadr",21,22,7,6,"2",7,11,"%%complex-args",21,5,3,2,22,7,0,22,1,0,11,2,-1,9,1,7,9,0,7,6,"2",7,11,"list",21,5,3,3,22,7,9,1,7,9,0,7,6,"3",7,11,"map",21,22,7,6,"2",7,11,"mappend",21,5,3,3,22,19,"%complex-args",25],
[1,0,82,1,-1,0,8,9,0,7,6,"1",7,11,"acons",21,22,2,26,0,24,0,15,0,8,9,0,7,6,"1",7,11,"car",21,22,7,6,"1",7,11,"type",21,22,7,6,"sym",7,6,"2",7,11,"is",21,22,3,2,12,2,17,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"%complex-args?",21,5,2,2,22,3,29,9,0,2,26,0,17,0,8,9,0,7,6,"1",7,11,"type",21,22,7,6,"sym",7,6,"2",7,11,"is",21,22,7,6,"1",7,11,"no",21,5,2,2,22,3,2,12,23,2,19,"%complex-args?",25],
[1,0,157,1,-1,9,0,2,153,0,8,9,0,7,6,"1",7,11,"type",21,22,7,14,0,10,8,0,0,7,6,"sym",7,6,"2",7,11,"is",21,22,2,10,0,8,9,0,7,6,"1",7,11,"list",21,22,3,121,0,10,8,0,0,7,6,"cons",7,6,"2",7,11,"is",21,22,2,93,0,8,9,0,7,6,"1",7,11,"car",21,22,7,14,0,8,8,0,0,7,6,"1",7,11,"acons",21,22,2,19,0,17,0,8,8,0,0,7,6,"1",7,11,"car",21,22,7,6,"o",7,6,"2",7,11,"is",21,22,3,2,12,2,17,0,15,0,8,8,0,0,7,6,"1",7,11,"cadr",21,22,7,6,"1",7,11,"list",21,22,3,9,0,8,8,0,0,7,6,"1",7,11,"%complex-args-get-var",21,22,15,2,7,14,0,24,0,15,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"%complex-args-get-var",21,22,7,8,0,0,7,6,"2",7,11,"+",21,22,15,2,3,18,0,17,0,10,6,"\"Can't understand vars list\"",7,9,0,7,6,"2",7,11,"+",21,22,7,6,"1",7,11,"err",21,22,15,2,3,2,12,23,2,19,"%complex-args-get-var",25],
[1,0,71,4,-1,9,2,2,67,0,8,9,2,7,6,"1",7,11,"car",21,22,7,14,0,10,9,3,7,8,0,0,7,6,"2",7,11,"pos",21,22,7,14,8,0,0,2,11,0,9,9,1,7,8,0,0,7,6,"2",7,9,0,22,3,31,0,30,9,3,7,0,8,9,2,7,6,"1",7,11,"cdr",21,22,7,0,10,6,"1",7,9,1,7,6,"2",7,11,"+",21,22,7,9,0,7,6,"4",7,11,"compile-lookup-let",21,22,15,4,3,2,12,23,5,19,"compile-lookup-let",25],
[1,0,97,7,-1,0,21,9,6,7,0,8,9,5,7,6,"1",7,11,"car",21,22,7,6,"0",7,9,3,7,6,"4",7,11,"compile-lookup-let",21,22,7,14,8,0,0,2,3,8,0,0,3,68,0,17,9,6,7,0,8,9,5,7,6,"1",7,11,"cadr",21,22,7,6,"2",7,11,"pos",21,22,7,14,8,0,0,2,9,0,7,8,0,0,7,6,"1",7,9,2,22,3,38,0,17,9,6,7,0,8,9,5,7,6,"1",7,11,"cddr",21,22,7,6,"2",7,11,"pos",21,22,7,14,8,0,0,2,9,0,7,8,0,0,7,6,"1",7,9,1,22,3,8,0,7,9,6,7,6,"1",7,9,0,22,15,2,15,2,15,2,23,8,19,"compile-lookup",25],
[1,0,235,3,-1,9,2,7,9,1,7,9,0,7,9,0,7,1,1,38,2,-1,6,"refer-let",7,0,28,9,1,7,0,19,9,0,7,0,10,10,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,3,22,7,9,0,7,1,1,29,1,-1,6,"refer-local",7,0,19,9,0,7,0,10,10,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,2,22,7,9,0,7,1,1,29,1,-1,6,"refer-free",7,0,19,9,0,7,0,10,10,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,2,22,7,9,0,7,1,1,114,1,-1,9,0,7,14,0,10,8,0,0,7,12,7,6,"2",7,11,"is",21,22,2,21,6,"refer-nil",7,0,10,10,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,4,22,3,78,0,10,8,0,0,7,13,7,6,"2",7,11,"is",21,22,2,21,6,"refer-t",7,0,10,10,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,4,22,3,47,6,"refer-global",7,0,37,9,0,7,0,28,0,19,6,"indirect",7,0,10,10,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,4,22,15,2,23,2,7,6,"7",7,11,"compile-lookup",21,5,8,4,22,19,"compile-refer",25],
[1,0,598,2,-1,0,8,9,1,7,6,"1",7,11,"type",21,22,7,14,0,10,8,0,0,7,6,"sym",7,6,"2",7,11,"is",21,22,2,30,0,17,0,10,9,1,7,9,0,7,6,"2",7,11,"mem",21,22,7,6,"1",7,11,"no",21,22,2,10,9,1,7,6,"1",7,11,"list",21,5,2,5,22,3,2,12,3,546,0,10,8,0,0,7,6,"cons",7,6,"2",7,11,"is",21,22,2,534,0,8,9,1,7,6,"1",7,11,"car",21,22,7,14,0,10,8,0,0,7,6,"quote",7,6,"2",7,11,"is",21,22,2,21,0,19,1,0,3,1,0,12,23,2,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,491,0,10,8,0,0,7,6,"fn",7,6,"2",7,11,"is",21,22,2,50,0,48,9,0,7,1,1,30,2,-1,9,0,7,0,20,11,"is",21,7,0,8,9,1,7,6,"1",7,11,"dotted-to-proper",21,22,7,10,0,7,6,"3",7,11,"union",21,22,7,6,"2",7,11,"find-free",21,5,3,3,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,431,0,10,8,0,0,7,6,"with",7,6,"2",7,11,"is",21,22,2,129,0,127,9,0,7,1,1,109,2,-1,0,18,11,"car",21,7,0,8,9,1,7,6,"1",7,11,"%pair",21,22,7,6,"2",7,11,"map1",21,22,7,0,18,11,"cadr",21,7,0,8,9,1,7,6,"1",7,11,"%pair",21,22,7,6,"2",7,11,"map1",21,22,7,14,11,"is",21,7,0,36,0,29,0,22,10,0,7,1,1,11,1,-1,9,0,7,10,0,7,6,"2",7,11,"find-free",21,5,3,2,22,7,8,0,0,7,6,"2",7,11,"map1",21,22,7,6,"1",7,11,"flat",21,22,7,6,"1",7,11,"dedup",21,22,7,0,22,9,0,7,0,13,11,"is",21,7,8,0,1,7,10,0,7,6,"3",7,11,"union",21,22,7,6,"2",7,11,"find-free",21,22,7,6,"3",7,11,"union",21,5,4,6,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,292,0,10,8,0,0,7,6,"do",7,6,"2",7,11,"is",21,22,2,57,0,55,9,0,7,1,1,37,1,0,0,29,0,22,10,0,7,1,1,11,1,-1,9,0,7,10,0,7,6,"2",7,11,"find-free",21,5,3,2,22,7,9,0,7,6,"2",7,11,"map1",21,22,7,6,"1",7,11,"flat",21,22,7,6,"1",7,11,"dedup",21,5,2,2,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,225,0,10,8,0,0,7,6,"%if",7,6,"2",7,11,"is",21,22,2,57,0,55,9,0,7,1,1,37,1,0,0,29,0,22,10,0,7,1,1,11,1,-1,9,0,7,10,0,7,6,"2",7,11,"find-free",21,5,3,2,22,7,9,0,7,6,"2",7,11,"map1",21,22,7,6,"1",7,11,"flat",21,22,7,6,"1",7,11,"dedup",21,5,2,2,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,158,0,10,8,0,0,7,6,"assign",7,6,"2",7,11,"is",21,22,2,70,0,68,9,0,7,1,1,50,2,-1,11,"is",21,7,0,17,0,10,9,1,7,10,0,7,6,"2",7,11,"mem",21,22,7,6,"1",7,11,"no",21,22,2,10,0,8,9,1,7,6,"1",7,11,"list",21,22,3,2,12,7,0,10,9,0,7,10,0,7,6,"2",7,11,"find-free",21,22,7,6,"3",7,11,"union",21,5,4,3,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,78,0,10,8,0,0,7,6,"ccc",7,6,"2",7,11,"is",21,22,2,31,0,29,9,0,7,1,1,11,1,-1,9,0,7,10,0,7,6,"2",7,11,"find-free",21,5,3,2,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,37,0,36,0,29,0,22,9,0,7,1,1,11,1,-1,9,0,7,10,0,7,6,"2",7,11,"find-free",21,5,3,2,22,7,9,1,7,6,"2",7,11,"map1",21,22,7,6,"1",7,11,"flat",21,22,7,6,"1",7,11,"dedup",21,22,15,2,3,2,12,15,2,23,3,19,"find-free",25],
[1,0,545,2,-1,0,8,9,1,7,6,"1",7,11,"type",21,22,7,14,0,10,8,0,0,7,6,"cons",7,6,"2",7,11,"is",21,22,2,521,0,8,9,1,7,6,"1",7,11,"car",21,22,7,14,0,10,8,0,0,7,6,"quote",7,6,"2",7,11,"is",21,22,2,21,0,19,1,0,3,1,-1,12,23,2,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,478,0,10,8,0,0,7,6,"fn",7,6,"2",7,11,"is",21,22,2,47,0,45,9,0,7,1,1,27,2,-1,9,0,7,0,17,10,0,7,0,8,9,1,7,6,"1",7,11,"dotted-to-proper",21,22,7,6,"2",7,11,"set-minus",21,22,7,6,"2",7,11,"find-sets",21,5,3,3,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,421,0,10,8,0,0,7,6,"with",7,6,"2",7,11,"is",21,22,2,126,0,124,9,0,7,1,1,106,2,-1,0,18,11,"car",21,7,0,8,9,1,7,6,"1",7,11,"%pair",21,22,7,6,"2",7,11,"map1",21,22,7,0,18,11,"cadr",21,7,0,8,9,1,7,6,"1",7,11,"%pair",21,22,7,6,"2",7,11,"map1",21,22,7,14,11,"is",21,7,0,36,0,29,0,22,10,0,7,1,1,11,1,-1,9,0,7,10,0,7,6,"2",7,11,"find-sets",21,5,3,2,22,7,8,0,0,7,6,"2",7,11,"map1",21,22,7,6,"1",7,11,"flat",21,22,7,6,"1",7,11,"dedup",21,22,7,0,19,9,0,7,0,10,10,0,7,8,0,1,7,6,"2",7,11,"set-minus",21,22,7,6,"2",7,11,"find-sets",21,22,7,6,"3",7,11,"union",21,5,4,6,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,285,0,10,8,0,0,7,6,"do",7,6,"2",7,11,"is",21,22,2,57,0,55,9,0,7,1,1,37,1,0,0,29,0,22,10,0,7,1,1,11,1,-1,9,0,7,10,0,7,6,"2",7,11,"find-sets",21,5,3,2,22,7,9,0,7,6,"2",7,11,"map1",21,22,7,6,"1",7,11,"flat",21,22,7,6,"1",7,11,"dedup",21,5,2,2,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,218,0,10,8,0,0,7,6,"%if",7,6,"2",7,11,"is",21,22,2,57,0,55,9,0,7,1,1,37,1,0,0,29,0,22,10,0,7,1,1,11,1,-1,9,0,7,10,0,7,6,"2",7,11,"find-sets",21,5,3,2,22,7,9,0,7,6,"2",7,11,"map1",21,22,7,6,"1",7,11,"flat",21,22,7,6,"1",7,11,"dedup",21,5,2,2,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,151,0,10,8,0,0,7,6,"assign",7,6,"2",7,11,"is",21,22,2,63,0,61,9,0,7,1,1,43,2,-1,11,"is",21,7,0,10,9,1,7,10,0,7,6,"2",7,11,"mem",21,22,2,10,0,8,9,1,7,6,"1",7,11,"list",21,22,3,2,12,7,0,10,9,0,7,10,0,7,6,"2",7,11,"find-sets",21,22,7,6,"3",7,11,"union",21,5,4,3,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,78,0,10,8,0,0,7,6,"ccc",7,6,"2",7,11,"is",21,22,2,31,0,29,9,0,7,1,1,11,1,-1,9,0,7,10,0,7,6,"2",7,11,"find-sets",21,5,3,2,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,37,0,36,0,29,0,22,9,0,7,1,1,11,1,-1,9,0,7,10,0,7,6,"2",7,11,"find-sets",21,5,3,2,22,7,9,1,7,6,"2",7,11,"map1",21,22,7,6,"1",7,11,"flat",21,22,7,6,"1",7,11,"dedup",21,22,15,2,3,2,12,15,2,23,3,19,"find-sets",25],
[1,0,125,3,-1,9,1,7,6,"0",7,6,"2",7,12,7,14,20,0,9,0,7,8,0,0,7,9,2,7,1,3,104,2,-1,9,1,2,100,0,17,0,8,9,1,7,6,"1",7,11,"car",21,22,7,10,0,7,6,"2",7,11,"mem",21,22,2,55,6,"box",7,0,44,9,0,7,0,35,0,26,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,0,10,9,0,7,6,"1",7,6,"2",7,11,"+",21,22,7,6,"2",7,10,1,21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,3,22,3,27,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,0,10,9,0,7,6,"1",7,6,"2",7,11,"+",21,22,7,6,"2",7,10,1,21,5,3,3,22,3,2,10,2,23,3,16,0,0,15,2,5,3,4,22,19,"make-boxes",25],
[1,0,148,1,-1,0,17,0,8,9,0,7,6,"1",7,11,"car",21,22,7,6,"ignore",7,6,"2",7,11,"is",21,22,2,17,0,8,9,0,7,6,"1",7,11,"cadr",21,22,7,6,"1",7,11,"tailp",21,5,2,2,22,3,113,0,17,0,8,9,0,7,6,"1",7,11,"car",21,22,7,6,"return",7,6,"2",7,11,"is",21,22,2,10,9,0,7,6,"1",7,11,"cadr",21,5,2,2,22,3,86,0,17,0,8,9,0,7,6,"1",7,11,"car",21,22,7,6,"exit-let",7,6,"2",7,11,"is",21,22,2,26,0,24,0,15,0,8,9,0,7,6,"1",7,11,"cddr",21,22,7,6,"1",7,11,"caar",21,22,7,6,"return",7,6,"2",7,11,"is",21,22,3,2,12,2,40,0,8,9,0,7,6,"1",7,11,"cadr",21,22,7,0,22,0,15,0,8,9,0,7,6,"1",7,11,"cddr",21,22,7,6,"1",7,11,"car",21,22,7,6,"1",7,11,"cadr",21,22,7,6,"2",7,11,"+",21,5,3,2,22,3,2,12,23,2,19,"tailp",25],
[1,0,59,1,-1,0,8,9,0,7,6,"1",7,11,"car",21,22,7,14,0,10,8,0,0,7,6,"exit-let",7,6,"2",7,11,"is",21,22,2,26,0,8,9,0,7,6,"1",7,11,"cadr",21,22,7,0,8,9,0,7,6,"1",7,11,"caddr",21,22,7,6,"2",7,11,"list",21,5,3,4,22,3,11,6,"0",7,9,0,7,6,"2",7,11,"list",21,5,3,4,22,15,2,23,2,19,"reduce-nest-exit",25],
[1,0,59,3,-1,0,8,9,2,7,6,"1",7,11,"no",21,22,2,3,9,0,3,47,0,8,9,2,7,6,"1",7,11,"cdr",21,22,7,9,1,7,0,28,0,8,9,2,7,6,"1",7,11,"car",21,22,7,9,1,7,0,10,6,"argument",7,9,0,7,6,"2",7,11,"list",21,22,7,6,"3",7,11,"compile-refer",21,22,7,6,"3",7,11,"collect-free",21,5,4,4,22,23,4,19,"collect-free",25],
[1,0,111,2,-1,9,1,2,107,0,8,9,0,7,6,"1",7,11,"car",21,22,7,0,8,9,0,7,6,"1",7,11,"cadr",21,22,7,0,8,9,0,7,6,"1",7,11,"cddr",21,22,7,14,0,76,8,0,0,7,8,0,1,7,8,0,2,7,1,3,61,1,-1,0,17,9,0,7,0,8,10,0,7,6,"1",7,11,"flat",21,22,7,6,"2",7,11,"mem",21,22,7,14,8,0,0,2,3,8,0,0,3,36,0,10,9,0,7,10,1,7,6,"2",7,11,"mem",21,22,7,14,8,0,0,2,3,8,0,0,3,19,0,10,9,0,7,10,2,7,6,"2",7,11,"mem",21,22,7,14,8,0,0,2,3,8,0,0,3,2,12,15,2,15,2,15,2,23,2,7,9,1,7,6,"2",7,11,"keep",21,22,15,4,3,2,12,23,3,19,"remove-globs",25],
[1,0,1989,4,-1,0,8,9,3,7,6,"1",7,11,"type",21,22,7,14,0,10,8,0,0,7,6,"sym",7,6,"2",7,11,"is",21,22,2,45,9,3,7,9,2,7,0,10,9,3,7,9,1,7,6,"2",7,11,"mem",21,22,2,21,0,19,6,"indirect",7,0,10,9,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,3,2,9,0,7,6,"3",7,11,"compile-refer",21,5,4,7,22,3,1922,0,10,8,0,0,7,6,"cons",7,6,"2",7,11,"is",21,22,2,1821,0,8,9,3,7,6,"1",7,11,"car",21,22,7,14,0,10,8,0,0,7,6,"quote",7,6,"2",7,11,"is",21,22,2,112,0,110,9,0,7,1,1,92,1,-1,0,10,9,0,7,12,7,6,"2",7,11,"is",21,22,2,21,6,"refer-nil",7,0,10,10,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,2,22,3,60,0,10,9,0,7,13,7,6,"2",7,11,"is",21,22,2,21,6,"refer-t",7,0,10,10,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,2,22,3,29,6,"constant",7,0,19,9,0,7,0,10,10,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,2,22,23,2,7,0,8,9,3,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,1687,0,10,8,0,0,7,6,"fn",7,6,"2",7,11,"is",21,22,2,270,0,268,9,0,7,9,1,7,9,2,7,1,3,246,2,-1,0,8,9,1,7,6,"1",7,11,"dotted-pos",21,22,7,0,8,9,1,7,6,"1",7,11,"dotted-to-proper",21,22,7,14,0,10,9,0,7,8,0,0,7,6,"2",7,11,"find-free",21,22,7,0,10,9,0,7,8,0,0,7,6,"2",7,11,"find-sets",21,22,7,14,0,10,8,0,1,7,10,0,7,6,"2",7,11,"remove-globs",21,22,7,14,8,0,0,7,10,0,7,0,180,6,"close",7,0,171,0,8,8,0,0,7,6,"1",7,11,"len",21,22,7,0,155,0,8,8,2,0,7,6,"1",7,11,"len",21,22,7,0,139,8,2,1,7,0,130,0,112,8,1,0,7,0,8,8,2,0,7,6,"1",7,11,"rev",21,22,7,0,94,9,0,7,0,26,12,7,0,17,0,8,8,2,0,7,6,"1",7,11,"rev",21,22,7,8,0,0,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,22,11,"is",21,7,8,1,0,7,0,10,10,1,7,8,0,0,7,6,"2",7,11,"set-intersect",21,22,7,6,"3",7,11,"union",21,22,7,0,35,6,"return",7,0,26,0,17,0,8,8,2,0,7,6,"1",7,11,"len",21,22,7,6,"1",7,6,"2",7,11,"+",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"4",7,11,"compile",21,22,7,6,"3",7,11,"make-boxes",21,22,7,0,10,10,2,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"3",7,11,"collect-free",21,5,4,11,22,7,0,8,9,3,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,1407,0,10,8,0,0,7,6,"with",7,6,"2",7,11,"is",21,22,2,371,0,369,9,0,7,9,1,7,9,2,7,1,3,347,2,-1,0,18,11,"car",21,7,0,8,9,1,7,6,"1",7,11,"%pair",21,22,7,6,"2",7,11,"map1",21,22,7,0,18,11,"cadr",21,7,0,8,9,1,7,6,"1",7,11,"%pair",21,22,7,6,"2",7,11,"map1",21,22,7,14,0,8,8,0,0,7,6,"1",7,11,"rev",21,22,7,0,40,0,24,0,8,8,0,1,7,6,"1",7,11,"rev",21,22,7,0,8,10,0,7,6,"1",7,11,"car",21,22,7,6,"2",7,11,"cons",21,22,7,0,8,10,0,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"cons",21,22,7,0,8,10,2,7,6,"1",7,11,"reduce-nest-exit",21,22,7,0,10,9,0,7,8,0,1,7,6,"2",7,11,"find-sets",21,22,7,0,19,0,10,9,0,7,8,0,1,7,6,"2",7,11,"find-free",21,22,7,10,0,7,6,"2",7,11,"remove-globs",21,22,7,14,0,130,6,"enter-let",7,0,121,0,112,8,0,1,7,0,8,8,1,1,7,6,"1",7,11,"rev",21,22,7,0,94,9,0,7,8,0,3,7,0,22,11,"is",21,7,8,0,1,7,0,10,10,1,7,8,0,0,7,6,"2",7,11,"set-intersect",21,22,7,6,"3",7,11,"union",21,22,7,0,60,6,"exit-let",7,0,51,0,26,0,8,8,1,1,7,6,"1",7,11,"len",21,22,7,6,"1",7,0,8,8,0,2,7,6,"1",7,11,"car",21,22,7,6,"3",7,11,"+",21,22,7,0,17,0,8,8,0,2,7,6,"1",7,11,"cadr",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"4",7,11,"compile",21,22,7,6,"3",7,11,"make-boxes",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,15,5,7,6,"2",7,12,7,14,20,0,10,1,7,10,0,7,8,0,0,7,1,3,68,2,-1,0,8,9,1,7,6,"1",7,11,"no",21,22,2,3,9,0,3,56,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,0,39,0,8,9,1,7,6,"1",7,11,"car",21,22,7,10,1,7,10,2,7,0,19,6,"argument",7,0,10,9,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"4",7,11,"compile",21,22,7,6,"2",7,10,0,21,5,3,3,22,23,3,16,0,0,15,2,5,3,6,22,7,0,8,9,3,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,1026,0,10,8,0,0,7,6,"do",7,6,"2",7,11,"is",21,22,2,102,0,100,9,0,7,9,1,7,9,2,7,1,3,78,1,0,0,8,9,0,7,6,"1",7,11,"rev",21,22,7,10,2,7,6,"2",7,12,7,14,20,0,10,1,7,10,0,7,8,0,0,7,1,3,50,2,-1,0,8,9,1,7,6,"1",7,11,"no",21,22,2,3,9,0,3,38,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,0,21,0,8,9,1,7,6,"1",7,11,"car",21,22,7,10,1,7,10,2,7,9,0,7,6,"4",7,11,"compile",21,22,7,6,"2",7,10,0,21,5,3,3,22,23,3,16,0,0,15,2,5,3,2,22,7,0,8,9,3,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,914,0,10,8,0,0,7,6,"%if",7,6,"2",7,11,"is",21,22,2,142,0,140,9,0,7,9,1,7,9,2,7,1,3,118,3,-1,0,32,9,1,7,10,0,7,10,1,7,0,19,6,"ignore",7,0,10,10,2,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"4",7,11,"compile",21,22,7,0,32,9,0,7,10,0,7,10,1,7,0,19,6,"ignore",7,0,10,10,2,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"4",7,11,"compile",21,22,7,14,9,2,7,10,0,7,10,1,7,0,37,6,"test",7,0,28,8,0,1,7,0,19,8,0,0,7,0,10,10,2,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"4",7,11,"compile",21,5,5,7,22,7,0,8,9,3,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,762,0,10,8,0,0,7,6,"assign",7,6,"2",7,11,"is",21,22,2,250,0,248,9,1,7,9,0,7,9,2,7,1,3,226,2,-1,9,1,7,10,0,7,10,1,7,10,1,7,10,2,7,10,0,7,9,0,7,1,4,51,2,-1,10,0,7,10,1,7,10,2,7,0,37,6,"assign-let",7,0,28,9,1,7,0,19,9,0,7,0,10,10,3,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"4",7,11,"compile",21,5,5,3,22,7,10,1,7,10,2,7,10,0,7,9,0,7,1,4,42,1,-1,10,0,7,10,1,7,10,2,7,0,28,6,"assign-local",7,0,19,9,0,7,0,10,10,3,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"4",7,11,"compile",21,5,5,2,22,7,10,1,7,10,2,7,10,0,7,9,0,7,1,4,42,1,-1,10,0,7,10,1,7,10,2,7,0,28,6,"assign-free",7,0,19,9,0,7,0,10,10,3,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"4",7,11,"compile",21,5,5,2,22,7,10,1,7,10,2,7,10,0,7,9,0,7,1,4,42,1,-1,10,0,7,10,1,7,10,2,7,0,28,6,"assign-global",7,0,19,9,0,7,0,10,10,3,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"4",7,11,"compile",21,5,5,2,22,7,6,"7",7,11,"compile-lookup",21,5,8,3,22,7,0,8,9,3,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,502,0,10,8,0,0,7,6,"ccc",7,6,"2",7,11,"is",21,22,2,234,0,232,9,0,7,9,1,7,9,2,7,1,3,210,1,-1,10,1,7,10,0,7,9,0,7,1,3,145,1,-1,6,"conti",7,0,135,9,0,7,0,126,0,117,6,"argument",7,0,108,0,99,6,"constant",7,0,90,6,"1",7,0,81,0,72,6,"argument",7,0,63,0,54,10,0,7,10,1,7,10,2,7,0,10,6,"0",7,9,0,7,6,"2",7,11,"<",21,22,2,30,0,28,6,"shift",7,0,19,6,"2",7,0,10,9,0,7,6,"((apply))",7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,3,2,6,"(apply)",7,6,"4",7,11,"compile",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,2,22,7,14,0,8,10,2,7,6,"1",7,11,"tailp",21,22,7,14,8,0,0,2,9,8,0,0,7,6,"1",7,8,1,0,5,2,6,22,3,35,6,"frame",7,0,25,10,2,7,0,16,0,7,6,"0",7,6,"1",7,8,1,0,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,6,22,15,4,23,2,7,0,8,9,3,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,258,0,257,0,45,0,38,0,8,9,3,7,6,"1",7,11,"cdr",21,22,7,0,22,0,15,0,8,9,3,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"len",21,22,7,6,"1",7,11,"list",21,22,7,6,"2",7,11,"+",21,22,7,6,"1",7,11,"rev",21,22,7,0,86,0,8,9,3,7,6,"1",7,11,"car",21,22,7,9,2,7,9,1,7,0,8,9,0,7,6,"1",7,11,"tailp",21,22,7,14,8,0,0,2,53,0,51,6,"shift",7,0,42,0,24,0,15,0,8,9,3,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"len",21,22,7,6,"1",7,6,"2",7,11,"+",21,22,7,0,10,8,0,0,7,6,"((apply))",7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,3,2,6,"(apply)",15,2,7,6,"4",7,11,"compile",21,22,7,6,"2",7,12,7,14,20,0,9,1,7,9,2,7,8,0,0,7,9,0,7,1,4,106,2,-1,0,8,9,1,7,6,"1",7,11,"no",21,22,2,41,0,8,10,0,7,6,"1",7,11,"tailp",21,22,2,3,9,0,3,29,6,"frame",7,0,19,10,0,7,0,10,9,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,3,22,3,56,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,0,39,0,8,9,1,7,6,"1",7,11,"car",21,22,7,10,2,7,10,3,7,0,19,6,"argument",7,0,10,9,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"4",7,11,"compile",21,22,7,6,"2",7,10,1,21,5,3,3,22,23,3,16,0,0,15,2,22,15,2,3,91,0,10,9,3,7,12,7,6,"2",7,11,"is",21,22,2,21,6,"refer-nil",7,0,10,9,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,7,22,3,60,0,10,9,3,7,13,7,6,"2",7,11,"is",21,22,2,21,6,"refer-t",7,0,10,9,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,7,22,3,29,6,"constant",7,0,19,9,3,7,0,10,9,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,7,22,15,2,23,5,19,"compile",25],
[1,0,1986,2,-1,0,8,9,1,7,6,"1",7,11,"car",21,22,7,14,0,10,8,0,0,7,6,"frame",7,6,"2",7,11,"is",21,22,2,122,9,0,7,1,1,102,2,-1,0,19,9,0,7,0,10,10,0,7,6,"1",7,6,"2",7,11,"+",21,22,7,6,"2",7,11,"preproc",21,22,7,14,0,35,6,"frame",7,0,26,0,17,0,8,8,0,0,7,6,"1",7,11,"len",21,22,7,6,"1",7,6,"2",7,11,"+",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,37,8,0,0,7,0,28,9,1,7,0,19,10,0,7,0,8,8,0,0,7,6,"1",7,11,"len",21,22,7,6,"1",7,6,"3",7,11,"+",21,22,7,6,"2",7,11,"preproc",21,22,7,6,"2",7,11,"+",21,22,7,6,"2",7,11,"cons",21,5,3,5,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,5,3,5,22,3,1842,0,10,8,0,0,7,6,"close",7,6,"2",7,11,"is",21,22,2,149,9,0,7,1,1,129,5,-1,0,19,9,1,7,0,10,10,0,7,6,"1",7,6,"2",7,11,"+",21,22,7,6,"2",7,11,"preproc",21,22,7,14,0,62,6,"close",7,0,53,9,4,7,0,44,0,17,0,8,8,0,0,7,6,"1",7,11,"len",21,22,7,6,"1",7,6,"2",7,11,"+",21,22,7,0,19,9,3,7,0,10,9,2,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,37,8,0,0,7,0,28,9,0,7,0,19,10,0,7,0,8,8,0,0,7,6,"1",7,11,"len",21,22,7,6,"1",7,6,"3",7,11,"+",21,22,7,6,"2",7,11,"preproc",21,22,7,6,"2",7,11,"+",21,22,7,6,"2",7,11,"cons",21,5,3,8,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,5,3,5,22,3,1683,0,10,8,0,0,7,6,"test",7,6,"2",7,11,"is",21,22,2,198,9,0,7,1,1,178,3,-1,0,19,9,2,7,0,10,10,0,7,6,"1",7,6,"2",7,11,"+",21,22,7,6,"2",7,11,"preproc",21,22,7,14,0,8,8,0,0,7,6,"1",7,11,"len",21,22,7,14,0,21,9,1,7,0,12,10,0,7,8,0,0,7,6,"2",7,6,"3",7,11,"+",21,22,7,6,"2",7,11,"preproc",21,22,7,14,0,8,8,0,0,7,6,"1",7,11,"len",21,22,7,14,0,28,6,"test",7,0,19,0,10,8,2,0,7,6,"2",7,6,"2",7,11,"+",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,77,8,3,0,7,0,68,0,28,6,"jump",7,0,19,0,10,8,0,0,7,6,"1",7,6,"2",7,11,"+",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,32,8,1,0,7,0,23,9,0,7,0,14,10,0,7,8,2,0,7,8,0,0,7,6,"2",7,6,"4",7,11,"+",21,22,7,6,"2",7,11,"preproc",21,22,7,6,"2",7,11,"+",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"+",21,22,7,6,"2",7,11,"cons",21,5,3,12,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,5,3,5,22,3,1475,0,10,8,0,0,7,6,"conti",7,6,"2",7,11,"is",21,22,2,67,9,0,7,1,1,47,2,-1,0,19,6,"conti",7,0,10,9,1,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,19,9,0,7,0,10,10,0,7,6,"1",7,6,"2",7,11,"+",21,22,7,6,"2",7,11,"preproc",21,22,7,6,"2",7,11,"cons",21,5,3,3,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,5,3,5,22,3,1398,0,10,8,0,0,7,6,"shift",7,6,"2",7,11,"is",21,22,2,76,9,0,7,1,1,56,3,-1,0,28,6,"shift",7,0,19,9,2,7,0,10,9,1,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,19,9,0,7,0,10,10,0,7,6,"1",7,6,"2",7,11,"+",21,22,7,6,"2",7,11,"preproc",21,22,7,6,"2",7,11,"cons",21,5,3,4,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,5,3,5,22,3,1312,0,10,8,0,0,7,6,"constant",7,6,"2",7,11,"is",21,22,2,67,9,0,7,1,1,47,2,-1,0,19,6,"constant",7,0,10,9,1,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,19,9,0,7,0,10,10,0,7,6,"1",7,6,"2",7,11,"+",21,22,7,6,"2",7,11,"preproc",21,22,7,6,"2",7,11,"cons",21,5,3,3,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,5,3,5,22,3,1235,0,10,8,0,0,7,6,"argument",7,6,"2",7,11,"is",21,22,2,49,9,0,7,1,1,29,1,-1,6,"(argument)",7,0,19,9,0,7,0,10,10,0,7,6,"1",7,6,"2",7,11,"+",21,22,7,6,"2",7,11,"preproc",21,22,7,6,"2",7,11,"cons",21,5,3,2,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,5,3,5,22,3,1176,0,10,8,0,0,7,6,"refer-let",7,6,"2",7,11,"is",21,22,2,76,9,0,7,1,1,56,3,-1,0,28,6,"refer-let",7,0,19,9,2,7,0,10,9,1,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,19,9,0,7,0,10,10,0,7,6,"1",7,6,"2",7,11,"+",21,22,7,6,"2",7,11,"preproc",21,22,7,6,"2",7,11,"cons",21,5,3,4,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,5,3,5,22,3,1090,0,10,8,0,0,7,6,"refer-local",7,6,"2",7,11,"is",21,22,2,67,9,0,7,1,1,47,2,-1,0,19,6,"refer-local",7,0,10,9,1,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,19,9,0,7,0,10,10,0,7,6,"1",7,6,"2",7,11,"+",21,22,7,6,"2",7,11,"preproc",21,22,7,6,"2",7,11,"cons",21,5,3,3,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,5,3,5,22,3,1013,0,10,8,0,0,7,6,"refer-free",7,6,"2",7,11,"is",21,22,2,67,9,0,7,1,1,47,2,-1,0,19,6,"refer-free",7,0,10,9,1,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,19,9,0,7,0,10,10,0,7,6,"1",7,6,"2",7,11,"+",21,22,7,6,"2",7,11,"preproc",21,22,7,6,"2",7,11,"cons",21,5,3,3,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,5,3,5,22,3,936,0,10,8,0,0,7,6,"refer-global",7,6,"2",7,11,"is",21,22,2,67,9,0,7,1,1,47,2,-1,0,19,6,"refer-global",7,0,10,9,1,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,19,9,0,7,0,10,10,0,7,6,"1",7,6,"2",7,11,"+",21,22,7,6,"2",7,11,"preproc",21,22,7,6,"2",7,11,"cons",21,5,3,3,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,5,3,5,22,3,859,0,10,8,0,0,7,6,"refer-nil",7,6,"2",7,11,"is",21,22,2,49,9,0,7,1,1,29,1,-1,6,"(refer-nil)",7,0,19,9,0,7,0,10,10,0,7,6,"1",7,6,"2",7,11,"+",21,22,7,6,"2",7,11,"preproc",21,22,7,6,"2",7,11,"cons",21,5,3,2,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,5,3,5,22,3,800,0,10,8,0,0,7,6,"refer-t",7,6,"2",7,11,"is",21,22,2,49,9,0,7,1,1,29,1,-1,6,"(refer-t)",7,0,19,9,0,7,0,10,10,0,7,6,"1",7,6,"2",7,11,"+",21,22,7,6,"2",7,11,"preproc",21,22,7,6,"2",7,11,"cons",21,5,3,2,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,5,3,5,22,3,741,0,10,8,0,0,7,6,"enter-let",7,6,"2",7,11,"is",21,22,2,49,9,0,7,1,1,29,1,-1,6,"(enter-let)",7,0,19,9,0,7,0,10,10,0,7,6,"1",7,6,"2",7,11,"+",21,22,7,6,"2",7,11,"preproc",21,22,7,6,"2",7,11,"cons",21,5,3,2,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,5,3,5,22,3,682,0,10,8,0,0,7,6,"exit-let",7,6,"2",7,11,"is",21,22,2,67,9,0,7,1,1,47,2,-1,0,19,6,"exit-let",7,0,10,9,1,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,19,9,0,7,0,10,10,0,7,6,"1",7,6,"2",7,11,"+",21,22,7,6,"2",7,11,"preproc",21,22,7,6,"2",7,11,"cons",21,5,3,3,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,5,3,5,22,3,605,0,10,8,0,0,7,6,"assign-let",7,6,"2",7,11,"is",21,22,2,76,9,0,7,1,1,56,3,-1,0,28,6,"assign-let",7,0,19,9,2,7,0,10,9,1,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,19,9,0,7,0,10,10,0,7,6,"1",7,6,"2",7,11,"+",21,22,7,6,"2",7,11,"preproc",21,22,7,6,"2",7,11,"cons",21,5,3,4,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,5,3,5,22,3,519,0,10,8,0,0,7,6,"assign-local",7,6,"2",7,11,"is",21,22,2,67,9,0,7,1,1,47,2,-1,0,19,6,"assign-local",7,0,10,9,1,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,19,9,0,7,0,10,10,0,7,6,"1",7,6,"2",7,11,"+",21,22,7,6,"2",7,11,"preproc",21,22,7,6,"2",7,11,"cons",21,5,3,3,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,5,3,5,22,3,442,0,10,8,0,0,7,6,"assign-free",7,6,"2",7,11,"is",21,22,2,67,9,0,7,1,1,47,2,-1,0,19,6,"assign-free",7,0,10,9,1,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,19,9,0,7,0,10,10,0,7,6,"1",7,6,"2",7,11,"+",21,22,7,6,"2",7,11,"preproc",21,22,7,6,"2",7,11,"cons",21,5,3,3,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,5,3,5,22,3,365,0,10,8,0,0,7,6,"assign-global",7,6,"2",7,11,"is",21,22,2,67,9,0,7,1,1,47,2,-1,0,19,6,"assign-global",7,0,10,9,1,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,19,9,0,7,0,10,10,0,7,6,"1",7,6,"2",7,11,"+",21,22,7,6,"2",7,11,"preproc",21,22,7,6,"2",7,11,"cons",21,5,3,3,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,5,3,5,22,3,288,0,10,8,0,0,7,6,"box",7,6,"2",7,11,"is",21,22,2,67,9,0,7,1,1,47,2,-1,0,19,6,"box",7,0,10,9,1,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,19,9,0,7,0,10,10,0,7,6,"1",7,6,"2",7,11,"+",21,22,7,6,"2",7,11,"preproc",21,22,7,6,"2",7,11,"cons",21,5,3,3,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,5,3,5,22,3,211,0,10,8,0,0,7,6,"indirect",7,6,"2",7,11,"is",21,22,2,49,9,0,7,1,1,29,1,-1,6,"(indirect)",7,0,19,9,0,7,0,10,10,0,7,6,"1",7,6,"2",7,11,"+",21,22,7,6,"2",7,11,"preproc",21,22,7,6,"2",7,11,"cons",21,5,3,2,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,5,3,5,22,3,152,0,10,8,0,0,7,6,"apply",7,6,"2",7,11,"is",21,22,2,21,1,0,3,0,-1,6,"((apply))",23,1,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,5,3,5,22,3,121,0,10,8,0,0,7,6,"return",7,6,"2",7,11,"is",21,22,2,47,1,0,29,1,-1,0,19,6,"return",7,0,10,9,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,5,3,2,22,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,5,3,5,22,3,64,0,10,8,0,0,7,6,"halt",7,6,"2",7,11,"is",21,22,2,21,1,0,3,0,-1,6,"((halt))",23,1,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,5,3,5,22,3,33,0,10,8,0,0,7,6,"ignore",7,6,"2",7,11,"is",21,22,2,21,1,0,3,1,-1,12,23,2,7,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,5,3,5,22,3,2,12,15,2,23,3,19,"preproc",25],
[1,0,33,1,-1,0,23,0,10,9,0,7,12,7,6,"2",7,11,"%macex",21,22,7,12,7,12,7,6,"(halt)",7,6,"4",7,11,"compile",21,22,7,6,"0",7,6,"2",7,11,"preproc",21,5,3,2,22,19,"do-compile",25],
]);/** @} */
// arclib
/** @file arc.fasl { */
// This is an auto generated file.
// Compiled from ['/Users/smihica/code/arc-js/src/arc/compiler.arc'].
// DON'T EDIT !!!
preload.push.apply(preload, [
[1,0,185,1,0,0,8,9,0,7,6,"1",7,11,"car",21,22,7,0,15,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"acons",21,22,2,17,0,15,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"car",21,22,3,3,11,"list",21,7,14,0,11,8,0,0,7,11,"list",21,7,6,"2",7,11,"is",21,22,2,10,8,0,1,7,6,"1",7,11,"%pair",21,5,2,5,22,3,117,8,0,1,7,8,0,0,7,6,"2",7,12,7,14,20,0,8,0,0,7,1,1,100,2,-1,0,8,9,1,7,6,"1",7,11,"no",21,22,2,3,12,3,88,0,15,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"no",21,22,2,24,0,15,0,8,9,1,7,6,"1",7,11,"car",21,22,7,6,"1",7,11,"list",21,22,7,6,"1",7,11,"list",21,5,2,3,22,3,49,0,23,0,8,9,1,7,6,"1",7,11,"car",21,22,7,0,8,9,1,7,6,"1",7,11,"cadr",21,22,7,6,"2",7,9,0,22,7,0,17,0,8,9,1,7,6,"1",7,11,"cddr",21,22,7,9,0,7,6,"2",7,10,0,21,22,7,6,"2",7,11,"cons",21,5,3,3,22,23,3,16,0,0,15,2,5,3,5,22,15,3,23,2,19,"pair",25],
[1,0,23,1,-1,0,17,0,8,9,0,7,6,"1",7,11,"type",21,22,7,6,"int",7,6,"2",7,11,"is",21,22,2,3,13,3,2,12,23,2,19,"exact",25],
[0,130,11,"%___macros___",21,7,0,118,6,"mac",7,1,0,109,2,1,0,6,6,"0",7,11,"uniq",21,22,7,14,6,"let",7,0,91,8,0,0,7,0,82,0,55,6,"do",7,0,46,0,37,6,"in-ns",7,0,28,0,19,6,"quote",7,0,10,9,1,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,9,0,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,19,6,"(exit-ns)",7,0,10,8,0,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,5,22,7,6,"2",7,11,"annotate",21,22,7,6,"ns",7,6,"3",7,11,"sref",21,22,19,"ns",25],
[0,50,11,"%___macros___",21,7,0,38,6,"mac",7,1,0,29,1,-1,6,"fn",7,0,19,6,"(_)",7,0,10,9,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,2,22,7,6,"2",7,11,"annotate",21,22,7,6,"make-br-fn",7,6,"3",7,11,"sref",21,22,19,"make-br-fn",25],
[1,0,75,2,-1,0,8,9,0,7,6,"1",7,11,"atom",21,22,2,3,12,3,63,0,15,0,8,9,0,7,6,"1",7,11,"car",21,22,7,6,"1",7,11,"acons",21,22,2,19,0,17,0,8,9,0,7,6,"1",7,11,"caar",21,22,7,9,1,7,6,"2",7,11,"is",21,22,3,2,12,2,10,9,0,7,6,"1",7,11,"car",21,5,2,3,22,3,18,9,1,7,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"assoc",21,5,3,3,22,23,3,19,"assoc",25],
[1,0,18,2,-1,0,10,9,0,7,9,1,7,6,"2",7,11,"assoc",21,22,7,6,"1",7,11,"cadr",21,5,2,3,22,19,"alref",25],
[1,0,95,1,0,0,8,9,0,7,6,"1",7,11,"no",21,22,2,3,12,3,83,0,8,9,0,7,6,"1",7,11,"car",21,22,7,14,0,8,8,0,0,7,6,"1",7,11,"no",21,22,2,20,0,18,11,"join",21,7,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"apply",21,22,3,44,0,43,0,8,8,0,0,7,6,"1",7,11,"car",21,22,7,0,27,11,"join",21,7,0,8,8,0,0,7,6,"1",7,11,"cdr",21,22,7,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"3",7,11,"apply",21,22,7,6,"2",7,11,"cons",21,22,15,2,23,2,19,"join",25],
[1,0,18,2,-1,0,10,9,1,7,9,0,7,6,"2",7,11,"is",21,22,7,6,"1",7,11,"no",21,5,2,3,22,19,"isnt",25],
[1,0,42,1,-1,0,8,9,0,7,6,"1",7,11,"no",21,22,7,14,8,0,0,2,3,8,0,0,3,26,0,17,0,8,9,0,7,6,"1",7,11,"type",21,22,7,6,"cons",7,6,"2",7,11,"is",21,22,7,14,8,0,0,2,3,8,0,0,3,2,12,15,2,15,2,23,2,19,"alist",25],
[0,68,11,"%___macros___",21,7,0,56,6,"mac",7,1,0,47,3,2,6,"let",7,0,37,9,2,7,0,28,9,1,7,0,19,9,0,7,0,10,9,2,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"+",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,4,22,7,6,"2",7,11,"annotate",21,22,7,6,"ret",7,6,"3",7,11,"sref",21,22,19,"ret",25],
[0,117,11,"%___macros___",21,7,0,105,6,"mac",7,1,0,96,2,1,0,8,6,"g",7,6,"1",7,11,"uniq",21,22,7,14,6,"let",7,0,76,8,0,0,7,0,67,9,1,7,0,58,0,49,6,"or",7,0,40,8,0,0,7,1,1,29,1,-1,6,"is",7,0,19,10,0,7,0,10,9,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,2,22,7,9,0,7,6,"2",7,11,"map1",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,5,22,7,6,"2",7,11,"annotate",21,22,7,6,"in",7,6,"3",7,11,"sref",21,22,19,"in",25],
[1,0,100,2,-1,0,10,9,1,7,9,0,7,6,"2",7,11,"is",21,22,7,14,8,0,0,2,3,8,0,0,3,82,0,8,9,1,7,6,"1",7,11,"acons",21,22,2,64,0,8,9,0,7,6,"1",7,11,"acons",21,22,2,53,0,24,0,8,9,1,7,6,"1",7,11,"car",21,22,7,0,8,9,0,7,6,"1",7,11,"car",21,22,7,6,"2",7,11,"iso",21,22,2,26,0,24,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"iso",21,22,3,2,12,3,2,12,3,2,12,7,14,8,0,0,2,3,8,0,0,3,2,12,15,2,15,2,23,3,19,"iso",25],
[0,59,11,"%___macros___",21,7,0,47,6,"mac",7,1,0,38,2,1,6,"if",7,0,28,9,1,7,0,19,0,10,6,"do",7,9,0,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,3,22,7,6,"2",7,11,"annotate",21,22,7,6,"when",7,6,"3",7,11,"sref",21,22,19,"when",25],
[0,77,11,"%___macros___",21,7,0,65,6,"mac",7,1,0,56,2,1,6,"if",7,0,46,0,19,6,"no",7,0,10,9,1,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,19,0,10,6,"do",7,9,0,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,3,22,7,6,"2",7,11,"annotate",21,22,7,6,"unless",7,6,"3",7,11,"sref",21,22,19,"unless",25],
[0,159,11,"%___macros___",21,7,0,147,6,"mac",7,1,0,138,2,1,0,8,6,"gf",7,6,"1",7,11,"uniq",21,22,7,0,8,6,"gp",7,6,"1",7,11,"uniq",21,22,7,14,0,100,6,"rfn",7,0,91,8,0,1,7,0,82,0,10,8,0,0,7,12,7,6,"2",7,11,"cons",21,22,7,0,64,0,55,6,"when",7,0,46,8,0,0,7,0,37,9,0,7,0,28,0,19,8,0,1,7,0,10,9,1,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"+",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,10,9,1,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,6,22,7,6,"2",7,11,"annotate",21,22,7,6,"while",7,6,"3",7,11,"sref",21,22,19,"while",25],
[1,0,56,2,-1,9,0,2,52,0,7,9,0,7,6,"1",7,9,1,22,7,14,8,0,0,2,3,8,0,0,3,37,0,8,9,0,7,6,"1",7,11,"acons",21,22,2,19,0,17,9,1,7,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"reclist",21,22,3,2,12,7,14,8,0,0,2,3,8,0,0,3,2,12,15,2,15,2,3,2,12,23,3,19,"reclist",25],
[1,0,156,1,0,0,8,9,0,7,6,"1",7,11,"car",21,22,7,0,15,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"car",21,22,7,0,22,0,15,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"acons",21,22,2,24,0,22,0,15,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"car",21,22,3,2,6,"0",7,14,8,0,0,7,0,8,8,0,1,7,6,"1",7,11,"len",21,22,7,6,"2",7,12,7,14,20,0,8,0,0,7,8,1,2,7,1,2,56,2,-1,0,10,9,1,7,9,0,7,6,"2",7,11,"<",21,22,2,43,0,7,9,1,7,6,"1",7,10,0,22,7,14,8,0,0,2,3,8,0,0,3,28,0,19,0,10,9,1,7,6,"1",7,6,"2",7,11,"+",21,22,7,9,0,7,6,"2",7,10,1,21,22,7,14,8,0,0,2,3,8,0,0,3,2,12,15,2,15,2,3,2,12,23,3,16,0,0,15,2,5,3,6,22,19,"recstring",25],
[1,0,28,1,-1,0,10,9,0,7,6,"fn",7,6,"2",7,11,"isa",21,22,2,3,9,0,3,14,9,0,7,1,1,11,1,-1,9,0,7,10,0,7,6,"2",7,11,"iso",21,5,3,2,22,23,2,19,"testify",25],
[1,0,21,1,-1,0,8,9,0,7,6,"1",7,11,"atom",21,22,2,3,9,0,3,9,9,0,7,6,"1",7,11,"car",21,5,2,2,22,23,2,19,"carif",25],
[1,0,82,2,-1,0,8,9,1,7,6,"1",7,11,"testify",21,22,7,14,0,8,9,0,7,6,"1",7,11,"alist",21,22,2,31,8,0,0,7,1,1,18,1,0,0,11,11,"carif",21,7,9,0,7,6,"2",7,11,"apply",21,22,7,6,"1",7,10,0,5,2,2,22,7,9,0,7,6,"2",7,11,"reclist",21,5,3,5,22,3,31,9,0,7,8,0,0,7,1,2,17,1,0,0,10,10,1,7,9,0,7,6,"2",7,11,"apply",21,22,7,6,"1",7,10,0,5,2,2,22,7,9,0,7,6,"2",7,11,"recstring",21,5,3,5,22,15,2,23,3,19,"some",25],
[1,0,32,2,-1,0,15,0,8,9,1,7,6,"1",7,11,"testify",21,22,7,6,"1",7,11,"complement",21,22,7,9,0,7,6,"2",7,0,9,11,"some",21,7,6,"1",7,11,"complement",21,22,5,3,3,22,19,"all",25],
[1,0,125,2,-1,0,8,9,1,7,6,"1",7,11,"testify",21,22,7,14,0,8,9,0,7,6,"1",7,11,"alist",21,22,2,52,8,0,0,7,1,1,39,1,-1,0,26,9,0,7,6,"1",7,10,0,7,1,1,18,1,0,0,11,11,"carif",21,7,9,0,7,6,"2",7,11,"apply",21,22,7,6,"1",7,10,0,5,2,2,22,22,2,10,9,0,7,6,"1",7,11,"carif",21,5,2,2,22,3,2,12,23,2,7,9,0,7,6,"2",7,11,"reclist",21,5,3,5,22,3,53,9,0,7,8,0,0,7,1,2,39,1,-1,0,27,9,0,7,6,"1",7,10,1,7,10,0,7,1,2,17,1,0,0,10,10,1,7,9,0,7,6,"2",7,11,"apply",21,22,7,6,"1",7,10,0,5,2,2,22,22,2,9,9,0,7,6,"1",7,10,1,5,2,2,22,3,2,12,23,2,7,9,0,7,6,"2",7,11,"recstring",21,5,3,5,22,15,2,23,3,19,"find",25],
[1,0,25,2,-1,0,17,9,1,7,0,8,9,0,7,6,"1",7,11,"rev",21,22,7,6,"2",7,11,"firstn",21,22,7,6,"1",7,11,"rev",21,5,2,3,22,19,"lastn",25],
[1,0,35,1,-1,0,15,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"acons",21,22,2,17,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"lastcons",21,5,2,2,22,3,2,9,0,23,2,19,"lastcons",25],
[1,0,152,1,0,0,8,9,0,7,6,"1",7,11,"car",21,22,7,0,15,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"acons",21,22,2,17,0,15,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"car",21,22,3,2,6,"2",7,0,22,0,15,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"acons",21,22,2,24,0,22,0,15,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"car",21,22,3,2,12,7,14,0,8,8,0,2,7,6,"1",7,11,"no",21,22,2,10,8,0,0,7,6,"1",7,11,"rev",21,5,2,6,22,3,40,0,10,8,0,1,7,8,0,2,7,6,"2",7,11,"nthcdr",21,22,7,8,0,1,7,0,19,0,10,8,0,1,7,8,0,2,7,6,"2",7,11,"firstn",21,22,7,8,0,0,7,6,"2",7,11,"cons",21,22,7,6,"3",7,11,"tuples",21,5,4,6,22,15,4,23,2,19,"tuples",25],
[0,60,11,"%___macros___",21,7,0,48,6,"mac",7,1,0,39,1,0,6,"do",7,0,29,1,0,11,1,-1,6,"def",7,9,0,7,6,"2",7,11,"cons",21,5,3,2,22,7,0,10,9,0,7,6,"3",7,6,"2",7,11,"tuples",21,22,7,6,"2",7,11,"map",21,22,7,6,"2",7,11,"cons",21,5,3,2,22,7,6,"2",7,11,"annotate",21,22,7,6,"defs",7,6,"3",7,11,"sref",21,22,19,"defs",25],
[1,0,30,2,-1,0,8,9,1,7,6,"1",7,11,"acons",21,22,2,19,0,8,9,1,7,6,"1",7,11,"car",21,22,7,9,0,7,6,"2",7,11,"is",21,5,3,3,22,3,2,12,23,3,19,"caris",25],
[1,0,57,2,1,0,19,0,12,6,"\"Warning: \"",7,9,1,7,6,"\". \"",7,6,"3",7,11,"+",21,22,7,6,"1",7,11,"disp",21,22,0,26,1,0,17,1,-1,0,8,9,0,7,6,"1",7,11,"write",21,22,6,"\" \"",7,6,"1",7,11,"disp",21,5,2,2,22,7,9,0,7,6,"2",7,11,"map",21,22,6,"#\\n",7,11,"ewline",21,7,6,"2",7,11,"disp",21,5,3,3,22,19,"warn",25],
[0,6,6,"0",7,11,"table",21,22,19,"setter",25],
[0,168,11,"%___macros___",21,7,0,156,6,"mac",7,1,0,147,3,2,0,8,6,"gexpr",7,6,"1",7,11,"uniq",21,22,7,14,6,"sref",7,0,127,6,"setter",7,0,118,0,82,6,"fn",7,0,73,0,10,8,0,0,7,12,7,6,"2",7,11,"cons",21,22,7,0,55,0,46,6,"let",7,0,37,9,1,7,0,28,0,19,6,"cdr",7,0,10,8,0,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,9,0,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,28,0,19,6,"quote",7,0,10,9,2,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,6,22,7,6,"2",7,11,"annotate",21,22,7,6,"defset",7,6,"3",7,11,"sref",21,22,19,"defset",25],
[0,127,11,"setter",21,7,1,0,115,1,-1,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,14,0,8,8,0,0,7,6,"1",7,11,"car",21,22,7,14,0,8,6,"g",7,6,"1",7,11,"uniq",21,22,7,14,0,10,8,0,0,7,8,1,0,7,6,"2",7,11,"list",21,22,7,0,19,6,"car",7,0,10,8,0,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,46,6,"fn",7,0,37,6,"(val)",7,0,28,0,19,6,"scar",7,0,10,8,0,0,7,6,"(val)",7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"3",7,11,"list",21,5,4,8,22,7,6,"car",7,6,"3",7,11,"sref",21,22,25],
[0,127,11,"setter",21,7,1,0,115,1,-1,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,14,0,8,8,0,0,7,6,"1",7,11,"car",21,22,7,14,0,8,6,"g",7,6,"1",7,11,"uniq",21,22,7,14,0,10,8,0,0,7,8,1,0,7,6,"2",7,11,"list",21,22,7,0,19,6,"cdr",7,0,10,8,0,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,46,6,"fn",7,0,37,6,"(val)",7,0,28,0,19,6,"scdr",7,0,10,8,0,0,7,6,"(val)",7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"3",7,11,"list",21,5,4,8,22,7,6,"cdr",7,6,"3",7,11,"sref",21,22,25],
[0,145,11,"setter",21,7,1,0,133,1,-1,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,14,0,8,8,0,0,7,6,"1",7,11,"car",21,22,7,14,0,8,6,"g",7,6,"1",7,11,"uniq",21,22,7,14,0,10,8,0,0,7,8,1,0,7,6,"2",7,11,"list",21,22,7,0,19,6,"caar",7,0,10,8,0,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,64,6,"fn",7,0,55,6,"(val)",7,0,46,0,37,6,"scar",7,0,28,0,19,6,"car",7,0,10,8,0,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"(val)",7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"3",7,11,"list",21,5,4,8,22,7,6,"caar",7,6,"3",7,11,"sref",21,22,25],
[0,145,11,"setter",21,7,1,0,133,1,-1,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,14,0,8,8,0,0,7,6,"1",7,11,"car",21,22,7,14,0,8,6,"g",7,6,"1",7,11,"uniq",21,22,7,14,0,10,8,0,0,7,8,1,0,7,6,"2",7,11,"list",21,22,7,0,19,6,"cadr",7,0,10,8,0,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,64,6,"fn",7,0,55,6,"(val)",7,0,46,0,37,6,"scar",7,0,28,0,19,6,"cdr",7,0,10,8,0,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"(val)",7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"3",7,11,"list",21,5,4,8,22,7,6,"cadr",7,6,"3",7,11,"sref",21,22,25],
[0,145,11,"setter",21,7,1,0,133,1,-1,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,14,0,8,8,0,0,7,6,"1",7,11,"car",21,22,7,14,0,8,6,"g",7,6,"1",7,11,"uniq",21,22,7,14,0,10,8,0,0,7,8,1,0,7,6,"2",7,11,"list",21,22,7,0,19,6,"cddr",7,0,10,8,0,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,64,6,"fn",7,0,55,6,"(val)",7,0,46,0,37,6,"scdr",7,0,28,0,19,6,"cdr",7,0,10,8,0,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"(val)",7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"3",7,11,"list",21,5,4,8,22,7,6,"cddr",7,6,"3",7,11,"sref",21,22,25],
[1,0,521,1,-1,0,10,9,0,7,6,"compose",7,6,"2",7,11,"macex",21,22,7,14,0,10,8,0,0,7,6,"sym",7,6,"2",7,11,"isa",21,22,2,106,0,8,6,"g",7,6,"1",7,11,"uniq",21,22,7,0,8,6,"h",7,6,"1",7,11,"uniq",21,22,7,14,0,84,0,10,8,0,1,7,8,1,0,7,6,"2",7,11,"list",21,22,7,8,0,1,7,0,64,6,"fn",7,0,55,0,10,8,0,0,7,12,7,6,"2",7,11,"cons",21,22,7,0,37,0,28,6,"assign",7,0,19,8,1,0,7,0,10,8,0,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"3",7,11,"list",21,22,15,3,3,391,0,8,8,0,0,7,6,"1",7,11,"acons",21,22,2,17,0,15,0,8,8,0,0,7,6,"1",7,11,"car",21,22,7,6,"1",7,11,"metafn",21,22,3,2,12,2,33,0,24,0,8,8,0,0,7,6,"1",7,11,"car",21,22,7,0,8,8,0,0,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"expand-metafn-call",21,22,7,6,"1",7,11,"setforms",21,5,2,4,22,3,332,0,8,8,0,0,7,6,"1",7,11,"acons",21,22,2,37,0,15,0,8,8,0,0,7,6,"1",7,11,"car",21,22,7,6,"1",7,11,"acons",21,22,2,19,0,17,0,8,8,0,0,7,6,"1",7,11,"caar",21,22,7,6,"get",7,6,"2",7,11,"is",21,22,3,2,12,3,2,12,2,33,0,24,0,8,8,0,0,7,6,"1",7,11,"cadr",21,22,7,0,8,8,0,0,7,6,"1",7,11,"cadar",21,22,7,6,"2",7,11,"list",21,22,7,6,"1",7,11,"setforms",21,5,2,4,22,3,253,0,18,11,"setter",21,7,0,8,8,0,0,7,6,"1",7,11,"car",21,22,7,6,"2",7,11,"ref",21,22,7,14,8,0,0,2,9,0,7,8,1,0,7,6,"1",7,8,0,0,22,3,222,0,17,0,8,8,1,0,7,6,"1",7,11,"car",21,22,7,6,"fn",7,6,"2",7,11,"caris",21,22,2,14,0,12,6,"\"Inverting what looks like a function call\"",7,9,0,7,8,1,0,7,6,"3",7,11,"warn",21,22,3,2,12,0,8,6,"g",7,6,"1",7,11,"uniq",21,22,7,0,8,6,"h",7,6,"1",7,11,"uniq",21,22,7,14,0,23,1,0,7,1,-1,6,"0",7,11,"uniq",21,5,1,2,22,7,0,8,8,2,0,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"map",21,22,7,14,0,144,0,45,0,17,8,1,1,7,0,8,8,3,0,7,6,"1",7,11,"car",21,22,7,6,"2",7,11,"list",21,22,7,0,20,11,"list",21,7,8,0,0,7,0,8,8,3,0,7,6,"1",7,11,"cdr",21,22,7,6,"3",7,11,"mappend",21,22,7,6,"2",7,11,"+",21,22,7,0,10,8,1,1,7,8,0,0,7,6,"2",7,11,"cons",21,22,7,0,80,6,"fn",7,0,71,0,10,8,1,0,7,12,7,6,"2",7,11,"cons",21,22,7,0,53,0,44,6,"sref",7,0,35,8,1,1,7,0,26,8,1,0,7,0,17,0,8,8,0,0,7,6,"1",7,11,"car",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"3",7,11,"list",21,22,15,5,15,2,15,2,23,2,19,"setforms",25],
[1,0,58,1,-1,0,8,9,0,7,6,"1",7,11,"acons",21,22,2,47,0,8,9,0,7,6,"1",7,11,"car",21,22,7,14,0,10,8,0,0,7,6,"compose",7,6,"2",7,11,"is",21,22,7,14,8,0,0,2,3,8,0,0,3,19,0,10,8,1,0,7,6,"complement",7,6,"2",7,11,"is",21,22,7,14,8,0,0,2,3,8,0,0,3,2,12,15,2,15,4,3,2,12,23,2,19,"metafn",25],
[1,0,209,2,-1,0,17,0,8,9,1,7,6,"1",7,11,"car",21,22,7,6,"compose",7,6,"2",7,11,"is",21,22,2,142,0,8,9,1,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,12,7,14,20,0,9,0,7,8,0,0,7,1,2,117,1,-1,0,17,0,8,9,0,7,6,"1",7,11,"car",21,22,7,6,"compose",7,6,"2",7,11,"caris",21,22,2,40,0,31,0,15,0,8,9,0,7,6,"1",7,11,"car",21,22,7,6,"1",7,11,"cdr",21,22,7,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"2",7,11,"join",21,22,7,6,"1",7,10,0,21,5,2,2,22,3,59,0,8,9,0,7,6,"1",7,11,"cdr",21,22,2,33,0,8,9,0,7,6,"1",7,11,"car",21,22,7,0,15,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,10,0,21,22,7,6,"2",7,11,"list",21,5,3,2,22,3,18,0,8,9,0,7,6,"1",7,11,"car",21,22,7,10,1,7,6,"2",7,11,"cons",21,5,3,2,22,23,2,16,0,0,15,2,5,2,3,22,3,49,0,17,0,8,9,1,7,6,"1",7,11,"car",21,22,7,6,"no",7,6,"2",7,11,"is",21,22,2,21,6,"\"Can't invert \"",7,0,10,9,1,7,9,0,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"err",21,5,3,3,22,3,11,9,1,7,9,0,7,6,"2",7,11,"cons",21,5,3,3,22,23,3,19,"expand-metafn-call",25],
[1,0,176,2,-1,0,10,9,1,7,6,"sym",7,6,"2",7,11,"isa",21,22,2,30,6,"assign",7,0,19,9,1,7,0,10,9,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,3,22,3,135,0,8,9,1,7,6,"1",7,11,"setforms",21,22,7,14,0,8,8,0,0,7,6,"1",7,11,"car",21,22,7,0,15,0,8,8,0,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"car",21,22,7,0,22,0,15,0,8,8,0,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"car",21,22,7,14,0,8,6,"g",7,6,"1",7,11,"uniq",21,22,7,14,0,64,6,"with",7,0,55,0,19,8,1,2,7,0,10,8,0,0,7,9,0,7,6,"2",7,11,"list",21,22,7,6,"2",7,11,"+",21,22,7,0,28,0,19,8,1,0,7,0,10,8,0,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,15,8,23,3,19,"expand=",25],
[1,0,77,1,-1,6,"do",7,0,67,1,0,51,1,0,0,15,0,8,9,0,7,6,"1",7,11,"car",21,22,7,6,"1",7,11,"car",21,22,7,0,22,0,15,0,8,9,0,7,6,"1",7,11,"car",21,22,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,11,"car",21,22,7,14,8,0,1,7,8,0,0,7,6,"2",7,11,"expand=",21,5,3,5,22,7,0,8,9,0,7,6,"1",7,11,"pair",21,22,7,6,"2",7,11,"map",21,22,7,6,"2",7,11,"cons",21,5,3,2,22,19,"expand=list",25],
[0,30,11,"%___macros___",21,7,0,18,6,"mac",7,1,0,9,1,0,9,0,7,6,"1",7,11,"expand=list",21,5,2,2,22,7,6,"2",7,11,"annotate",21,22,7,6,"=",7,6,"3",7,11,"sref",21,22,19,"=",25],
[0,213,11,"%___macros___",21,7,0,201,6,"mac",7,1,0,192,4,3,0,8,6,"gfn",7,6,"1",7,11,"uniq",21,22,7,0,8,6,"gparm",7,6,"1",7,11,"uniq",21,22,7,14,6,"do",7,0,163,9,3,7,0,154,0,145,0,127,6,"rfn",7,0,118,8,0,1,7,0,109,0,10,8,0,0,7,12,7,6,"2",7,11,"cons",21,22,7,0,91,0,82,6,"if",7,0,73,8,0,0,7,0,64,0,55,6,"do",7,0,46,9,0,7,0,37,9,1,7,0,28,0,19,8,0,1,7,0,10,9,2,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"+",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,10,9,2,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,8,22,7,6,"2",7,11,"annotate",21,22,7,6,"loop",7,6,"3",7,11,"sref",21,22,19,"loop",25],
[0,276,11,"%___macros___",21,7,0,264,6,"mac",7,1,0,255,4,3,0,8,6,"gi",7,6,"1",7,11,"uniq",21,22,7,0,8,6,"gm",7,6,"1",7,11,"uniq",21,22,7,14,6,"with",7,0,226,0,73,9,3,7,0,64,12,7,0,55,8,0,1,7,0,46,9,2,7,0,37,8,0,0,7,0,28,0,19,6,"+",7,0,10,9,1,7,6,"(1)",7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,145,0,136,6,"loop",7,0,127,0,28,6,"assign",7,0,19,9,3,7,0,10,8,0,1,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,91,0,28,6,"<",7,0,19,9,3,7,0,10,8,0,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,55,0,46,6,"assign",7,0,37,9,3,7,0,28,0,19,6,"+",7,0,10,9,3,7,6,"(1)",7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,9,0,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,8,22,7,6,"2",7,11,"annotate",21,22,7,6,"for",7,6,"3",7,11,"sref",21,22,19,"for",25],
[0,276,11,"%___macros___",21,7,0,264,6,"mac",7,1,0,255,4,3,0,8,6,"gi",7,6,"1",7,11,"uniq",21,22,7,0,8,6,"gm",7,6,"1",7,11,"uniq",21,22,7,14,6,"with",7,0,226,0,73,9,3,7,0,64,12,7,0,55,8,0,1,7,0,46,9,2,7,0,37,8,0,0,7,0,28,0,19,6,"-",7,0,10,9,1,7,6,"(1)",7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,145,0,136,6,"loop",7,0,127,0,28,6,"assign",7,0,19,9,3,7,0,10,8,0,1,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,91,0,28,6,">",7,0,19,9,3,7,0,10,8,0,0,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,0,55,0,46,6,"assign",7,0,37,9,3,7,0,28,0,19,6,"-",7,0,10,9,3,7,6,"(1)",7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,9,0,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,8,22,7,6,"2",7,11,"annotate",21,22,7,6,"down",7,6,"3",7,11,"sref",21,22,19,"down",25],
[0,64,11,"%___macros___",21,7,0,52,6,"mac",7,1,0,43,2,1,6,"for",7,0,33,0,6,6,"0",7,11,"uniq",21,22,7,0,19,6,"1",7,0,10,9,1,7,9,0,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,3,22,7,6,"2",7,11,"annotate",21,22,7,6,"repeat",7,6,"3",7,11,"sref",21,22,19,"repeat",25],
[0,95,11,"%___macros___",21,7,0,83,6,"mac",7,1,0,74,3,2,6,"for",7,0,64,9,2,7,0,55,6,"0",7,0,46,0,37,6,"-",7,0,28,0,19,6,"len",7,0,10,9,1,7,12,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"(1)",7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,9,0,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,22,7,6,"2",7,11,"cons",21,5,3,4,22,7,6,"2",7,11,"annotate",21,22,7,6,"forlen",7,6,"3",7,11,"sref",21,22,19,"forlen",25],
[1,0,51,2,-1,0,10,9,0,7,6,"cons",7,6,"2",7,11,"coerce",21,22,7,14,0,35,9,1,7,1,1,24,1,-1,0,8,9,0,7,6,"1",7,11,"car",21,22,7,0,8,9,0,7,6,"1",7,11,"cadr",21,22,7,6,"2",7,10,0,5,3,2,22,7,8,0,0,7,6,"2",7,11,"map1",21,22,12,15,2,23,3,19,"maptable",25],
[1,0,228,2,-1,0,8,9,1,7,6,"1",7,11,"alist",21,22,2,60,9,1,7,6,"1",7,12,7,14,20,0,8,0,0,7,9,0,7,1,2,42,1,-1,0,8,9,0,7,6,"1",7,11,"acons",21,22,2,31,0,14,0,8,9,0,7,6,"1",7,11,"car",21,22,7,6,"1",7,10,0,22,0,8,9,0,7,6,"1",7,11,"cdr",21,22,7,6,"1",7,10,1,21,5,2,2,22,3,2,12,23,2,16,0,0,15,2,5,2,3,22,3,159,0,10,9,1,7,6,"table",7,6,"2",7,11,"isa",21,22,2,30,9,0,7,1,1,17,2,-1,0,10,9,1,7,9,0,7,6,"2",7,11,"list",21,22,7,6,"1",7,10,0,5,2,3,22,7,9,1,7,6,"2",7,11,"maptable",21,5,3,3,22,3,119,12,7,6,"0",7,0,26,0,17,0,8,9,1,7,6,"1",7,11,"len",21,22,7,6,"1",7,6,"2",7,11,"-",21,22,7,6,"1",7,6,"2",7,11,"+",21,22,7,14,20,2,8,0,1,16,0,2,0,82,0,11,8,0,2,21,7,8,0,0,7,6,"2",7,11,"<",21,22,7,6,"1",7,12,7,14,20,0,8,1,0,7,8,0,0,7,8,1,2,7,9,1,7,9,0,7,1,5,50,1,-1,9,0,2,46,0,14,0,8,10,2,21,7,6,"1",7,10,1,22,7,6,"1",7,10,0,22,0,11,10,2,21,7,6,"1",7,6,"2",7,11,"+",21,22,18,2,0,11,10,2,21,7,10,4,7,6,"2",7,11,"<",21,22,7,6,"1",7,10,3,21,5,2,2,22,3,2,12,23,2,16,0,0,15,2,22,15,4,23,3,19,"walk",25],
]);/** @} */
/** @} */
/** @file namespace.js { */
var NameSpace = classify('NameSpace', {
  property: {
    name:   null,
    upper:  null,
    lowers: {},
    vars:   {}
  },
  static: {
    root: null,
    stack: [null],
    push: function(x) {
      this.stack.push(x);
      return x;
    },
    pop: function() {
      return this.stack.pop();
    }
  },
  method: {
    init: function(name, upper) {
      this.name = name;
      this.upper = upper;
    },
    extend: function(name) {
      if (!this.lowers[name]) this.lowers[name] = new NameSpace(name, this);
      return this.lowers[name];
    },
    down: function(name) {
      return this.lowers[name];
    },
    up: function() {
      return this.upper;
    },
    clear_lower: function(name) {
      if (name) {
        delete this.lowers[name];
      } else {
        this.lowers = {};
      }
    }
  }
});
NameSpace.root = new NameSpace('%ROOT', null);
ArcJS.NameSpace = NameSpace;
/** @} */
/** @file vm.js { */
var VM = classify("VM", {
  static: {
    operators:
/** @file operators.js { */
["frame",
 "close",
 "test",
 "jump",
 "conti",
 "shift",
 "constant",
 "argument",
 "refer-let",
 "refer-local",
 "refer-free",
 "refer-global",
 "refer-nil",
 "refer-t",
 "enter-let",
 "exit-let",
 "assign-let",
 "assign-local",
 "assign-free",
 "assign-global",
 "box",
 "indirect",
 "apply",
 "return",
 "continue-return",
 "halt"]
/** @} */
  },
  property: {
    x: null,
    p: 0,
    a: null,
    f: 0,
    l: 0,
    c: null,
    s: 0,
    count: 0,
    stack: null,
    global: null,
    reader: null,
    namespace: null,
  },
  method: {
    init: function() {
      this.namespace = NameSpace.root;
      this.global = this.namespace.vars;
      for (var p in primitives) {
        this.global[p] = new Box(primitives[p]);
      }
      this.reader = new Reader(this);
      this.init_def();
    },
    init_def: function() {
      var ops = VM.operators;
      for (var i=0,l=preload.length; i<l; i++) (function(i) {
        var asm = [], line = preload[i];
        for (var k=0,m=line.length; k<m; k++) {
          var op = ops[line[k]];
          switch (op) {
          case 'refer-local':
          case 'refer-free':
          case 'box':
          case 'test':
          case 'jump':
          case 'assign-local':
          case 'assign-free':
          case 'frame':
          case 'return':
          case 'continue-return':
          case 'exit-let':
          case 'conti':
            asm.push([op, line[++k]|0]);
            break;
          case 'shift':
          case 'refer-let':
          case 'assign-let':
            asm.push([op, line[++k]|0, line[++k]|0]);
            break;
          case 'close':
            asm.push([op, line[++k]|0, line[++k]|0, line[++k]|0, line[++k]|0]);
            break;
          case 'refer-global':
          case 'assign-global':
            asm.push([op, line[++k]]);
            break;
          case 'constant':
            asm.push([op, this.reader.read(line[++k])]);
            break;
          case 'indirect':
          case 'halt':
          case 'argument':
          case 'apply':
          case 'nuate':
          case 'refer-nil':
          case 'refer-t':
          case 'enter-let':
            asm.push([op]);
            break;
          default:
          }
        }
        this.set_asm(asm).run();
      }).call(this, i);
    },
    set_asm: function(asm) {
      this.x = asm;
      return this;
    },
    load: function(codes) {
      this.x = [];
      while (codes !== nil) {
        var code = codes.car;
        var c = list_to_javascript_arr(code);
        c[0] = c[0].name;
        switch (c[0]) {
        case 'refer-local':
        case 'refer-free':
        case 'box':
        case 'test':
        case 'jump':
        case 'assign-local':
        case 'assign-free':
        case 'frame':
        case 'return':
        case 'continue-return':
        case 'exit-let':
        case 'conti':
          c[1] = (c[1]|0);
          break;
        case 'shift':
        case 'refer-let':
        case 'assign-let':
          c[1] = (c[1]|0);
          c[2] = (c[2]|0);
          break;
        case 'close':
          c[1] = (c[1]|0);
          c[2] = (c[2]|0);
          c[3] = (c[3]|0);
          c[4] = (c[4]|0);
          break;
        case 'refer-global':
        case 'assign-global':
          c[1] = (c[1].name);
          break;
        case 'constant':
        case 'indirect':
        case 'halt':
        case 'argument':
        case 'apply':
        case 'nuate':
        case 'refer-nil':
        case 'refer-t':
        case 'enter-let':
          break;
        }
        this.x.push(c);
        codes = codes.cdr;
      }
      return this;
    },
    load_string: function(asm) {
      var codes = this.reader.read(asm);
      this.load(codes);
      return this;
    },
    cleanup: function(globalp) {
      this.p = 0;
      this.a = null;
      this.f = 0;
      this.l = 0;
      this.c = null;
      this.s = 0;
      this.count = 0;
      this.stack = new Stack();
      if (globalp) {
        this.x = null;
        NameSpace.root = new NameSpace('%ROOT', null);
        this.namespace = NameSpace.root;
        this.global = NameSpace.root.vars;
        for (var p in primitives) {
          this.global[p] = new Box(primitives[p]);
        }
      }
    },
    step: function() {
      return this.run(false, false, true);
    },
    arc_apply: function(fn, args) {
      var asm = [['frame', 0]];
      args.push(args.length);
      args.forEach(function(a) {
        asm.push.apply(asm, [['constant', a], ['argument']]);
      });
      asm.push.apply(asm, [['constant', fn], ['apply'], ['halt']]);
      asm[0][1] = asm.length - 1;
      this.cleanup();
      this.set_asm(asm);
      return this.run();
    },
    run: function(asm_string, clean_all, step) {
      if (!step) this.cleanup(clean_all);
      if (asm_string)   this.load_string(asm_string);
      var n = 0, b = 0, v = 0, d = 0, m = 0, l = 0;
      n = n | 0; b = b | 0;
      v = v | 0; d = d | 0;
      m = m | 0; l = l | 0;
      var repeat = !step;
      // var _nest = [];
      do {
        var op = this.x[this.p];
        var code = op[0];
        switch (code) {
        case 'halt':
          return this.a;
        case 'enter-let':
          this.s = this.stack.push(this.l, this.s);
          this.l = this.s;
          this.p++;
          break;
        case 'exit-let':
          n = op[1];
          this.l -= n;
          this.s = this.l;
          this.p++;
          break;
        case 'refer-let':
          n = op[1];
          m = op[2];
          l = this.l;
          while (0 < n) { l = this.stack.index(l, 0); n--; }
          this.a = this.stack.index(l, m + 1);
          this.p++;
          break;
        case 'refer-local':
          n = op[1];
          this.a = this.stack.index(this.f, n + 1);
          this.p++;
          break;
        case 'refer-free':
          n = op[1];
          this.a = this.c.index(n);
          this.p++;
          break;
        case 'refer-global':
          var name = op[1]; // symbol name
          var value = void(0);
          var ns = this.namespace;
          var vars = this.global;
          while (value === void(0)) {
            value = vars[name];
            if (ns.upper === null) {
              if (value === void(0))
                throw new Error('Unbound variable "' + name + '"');
              else break;
            }
            ns = ns.upper;
            vars = ns.vars;
          }
          this.a = value;
          this.p++;
          break;
        case 'refer-nil':
          this.a = nil;
          this.p++;
          break;
        case 'refer-t':
          this.a = t;
          this.p++;
          break;
        case 'indirect':
          this.a = this.a.unbox();
          this.p++;
          break;
        case 'constant':
          var obj = op[1];
          this.a = obj;
          this.p++;
          break;
        case 'close':
          n = op[1];
          b = op[2];
          v = op[3];
          d = op[4];
          this.a = new Closure(this.x, this.p + 1, n, v, d, this.stack, this.s, this.namespace);
          this.p += b;
          this.s -= n;
          break;
        case 'box':
          n = op[1];
          this.stack.index_set(this.s, n + 1, new Box(this.stack.index(this.s, n + 1)));
          this.p++;
          break;
        case 'test':
          n = op[1];
          if (this.a !== nil) this.p++;
          else                this.p += n;
          break;
        case 'jump':
          n = op[1];
          this.p += n;
          break;
        case 'assign-let':
          n = op[1];
          m = op[2];
          l = this.l;
          while (0 < n) { l = this.stack.index(l, 0); n--; }
          this.stack.index(l, m + 1).setbox(this.a);
          this.p++;
          break;
        case 'assign-local':
          n = op[1];
          this.stack.index(this.f, n + 1).setbox(this.a);
          this.p++;
          break;
        case 'assign-free':
          n = op[1];
          this.c.index(n).setbox(this.a);
          this.p++;
          break;
        case 'assign-global':
          var name = op[1];
          var box = this.global[name] || new Box(this.a);
          if (this.a instanceof Closure) this.a.name = name;
          else if (this.a instanceof Tagged && this.a.tag == s_mac) this.a.obj.name = name;
          box.setbox(this.a);
          this.global[name] = box;
          this.p++;
          break;
        case 'frame':
          n = op[1];
          this.s = this.stack.push(
            [this.x, this.p + n],
            this.stack.push(
              this.f,
              this.stack.push(
                this.l,
                this.stack.push(
                  this.c,
                  this.s))));
          this.p++;
          break;
        case 'argument':
          this.s = this.stack.push(this.a, this.s);
          this.p++;
          break;
        case 'shift': // for tail-call only.
          n = op[1];
          m = op[2];
          this.s = this.stack.shift(n, m, this.s);
          this.namespace = NameSpace.pop();
          this.global = this.namespace.vars;
          this.p++;
          break;
        case 'apply':
          var fn = this.a;
          // _nest.push('  ');
          // console.log(_nest.join('') + "apply: " + stringify(fn));
          var vlen = this.stack.index(this.s, 0);
          var closurep = (fn instanceof Closure);
          var dotpos = fn.dotpos;
          // checking arglen.
          if ((dotpos < 0 && fn.arglen !== vlen) || (vlen < dotpos)) {
            throw new Error('error: ' + (closurep ? fn.name || 'nameless' : fn.prim_name) + ': arity mismatch;\n' +
                            'the expected number of arguments does not match the given number\n' +
                            'expected: ' + ((-1 < dotpos) ? ('>= ' + dotpos) : fn.arglen) + '\n' +
                            'given: ' + vlen);
          }
          if (closurep) {
            this.x = fn.body;
            this.p = fn.pc;
            this.c = fn;
            NameSpace.push(this.namespace);
            this.namespace = fn.namespace;
            this.global = this.namespace.vars;
            if (-1 < dotpos) {
              var lis = nil;
              for (var i = 0, l = (vlen - dotpos); i < l; i++) {
                lis = cons(this.stack.index(this.s, i + 1), lis);
              }
              var garbage_len = vlen - dotpos - 1;
              // when vlen === dotpos, this.s += 1 and lis is nil.
              this.s -= garbage_len;
              this.stack.index_set(this.s, 1, lis);
              this.stack.index_set(this.s, 0, vlen - garbage_len);
            }
            this.f = this.s;
            this.l = this.s;
          } else {
            this.a = this.a.apply(this, this.stack.range_get(this.s - 1 - vlen, this.s - 2));
            if (this.a instanceof Call) {
              var code = this.a.codegen();
              this.s -= (vlen + 1);
              this.x = code;
              this.p = 0;
              this.a = nil;
            } else {
              var xp = this.stack.index(this.s, vlen + 1);
              this.x = xp[0];
              this.p = xp[1];
              this.f = this.stack.index(this.s, vlen + 2); // for continuation
              this.l = this.stack.index(this.s, vlen + 3); // for continuation
              this.c = this.stack.index(this.s, vlen + 4); // for continuation
              this.s = this.s - vlen - 5;
            }
          }
          break;
        case 'return':
          this.namespace = NameSpace.pop();
          this.global = this.namespace.vars;
          // _nest.pop();
          // don't break !!
        case 'continue-return':
          var n  = op[1];
          var ns = this.s - n;
          var xp = this.stack.index(ns, 0);
          this.x = xp[0];
          this.p = xp[1];
          this.f = this.stack.index(ns, 1);
          this.l = this.stack.index(ns, 2);
          this.c = this.stack.index(ns, 3);
          this.s = ns - 4;
          break;
        case 'conti':
          n = op[1];
          this.a = new Continuation(this.stack, n, this.s, this.namespace);
          this.p++;
          break;
        case 'nuate':
          var stack = op[1];
          this.p++;
          this.s = this.stack.restore(stack);
          break;
        default:
          throw new Error('Error: Unknown operand. ' + code);
        }
        this.count++;
      } while (repeat);
    }
  }
});
ArcJS.VM = VM;
/** @} */
  return ArcJS;
}).call(typeof exports !== 'undefined' ? exports : {});
/** @} */
