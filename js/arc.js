/*
 Arc-JS --- The Arc-Language's compiler, stack VM-interpreter written in Javascript.
 -----------------------------------------------------------------------------------
 License:  MIT License, Copyright (C) 2013 Shin Aoyama (@smihica)
 Site:     https://github.com/smihica/arc-js
*/
/** @file arc.js { */
var ArcJS = (function() {
  var ArcJS = this;
  ArcJS.version = '0.1.2';
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
    get: function(name, evaluable_name) {
      var r = null;
      if (!(r = this.tbl[name])) {
        r = new Symbol(name, !!evaluable_name);
        this.tbl[name] = r;
      }
      return r;
    }
  },
  property: {
    name: null,
    evaluable_name: false
  },
  method: {
    init: function(n, evaluable_name) {
      this.name = n;
      this.evaluable_name = evaluable_name;
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
        return '%___table_key_' + i++ + '___%';
      }
    })(),
    keying: function keying(obj) {
      var type_name = type(obj).name;
      var key;
      switch (type_name) {
      case 'string':
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
      return this.src.hasOwnProperty(skey) ? this.src[skey] : nil;
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
    load_from_js_hash: function(h) {
      for (var k in h) {
        this.put(Symbol.get(k), h[k]);
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
    name: null,
    fn: null,
    args: null
  },
  method: {
    init: function(fn, name, args) {
      if (fn) this.fn = fn;
      else if (name) this.name = name;
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
/** @file regexp.js { */
var Regex = classify('Regex', {
  property: {
    src: null,
    asm: null,
  },
  method: {
    init: function(src) {
      this.src = src;
      this.asm = new RegExp(src);
    }
  }
});
ArcJS.Regex = Regex;
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
    UNQUOTE_SPLICING: Symbol.get('unquote-splicing'),
    NUMBER_PATTERN: /^[-+]?([0-9]+(\.[0-9]*)?|\.[0-9]+)([eE][-+]?[0-9]+)?$/
  },

  property: {
    str: '',
    i: 0,
    slen: 0,
  },

  method: {
    init: function() {},

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

    readable_symbol_p: function(c) {
      return c === '|';
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
      return cons(Symbol.get('***cut-fn***'), cons(body, nil));
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
      if (tok === '.')      return Reader.DOT;
      if (tok === '+inf.0') return Infinity;
      if (tok === '-inf.0') return -Infinity;
      if (tok.match(Reader.NUMBER_PATTERN))
        return this.make_number(tok);
      return this.read_symbol(tok);
    },

    make_number: function(tok) {
      var n = parseFloat(tok);
      // TODO flaction, imagine, +pattern.
      if (n === NaN) throw new Error("parsing failed the number " + tok);
      return n;
    },

    read_readable_symbol: function() {
      var c, acc = '';
      while (this.i < this.slen) {
        c = this.str[this.i++];
        if (c === '|') {
          return coerce(acc, s_sym);
        } else {
          acc += c;
        }
      }
      throw new Error("unexpected end-of-file while reading symbol");
    },

    read_symbol: function(tok) {
      if (arguments.length < 1) tok = this.read_thing();
      if (tok.length === 0) return Reader.EOF;
      return this.make_symbol(tok, false);
    },

    make_symbol: function(tok, readable) {
      if (tok === 'nil') return nil;
      if (tok === 't') return true;
      return Symbol.get(tok, readable);
    },

    read_string: function(delimiter, type, escape_only_delimiter) {
      delimiter = delimiter || '"';
      type = type || 'string';
      var str = '', esc = false;
      var escaped_char_tbl = {n: '\n', r: '\r', s: '\s', t: '\t'};
      while(this.i < this.slen) {
        var c = this.str[this.i++];
        // TODO more Escape patterns.
        if (esc) {
          esc = false;
          var escaped_char = ((escaped_char_tbl)[c]);
          if (escape_only_delimiter && !escaped_char && c !== delimiter) {
            str += '\\' + c;
          } else {
            if (escaped_char) {
              str += escaped_char;
            } else if (c === 'u' &&
                       this.i + 3 < this.slen &&
                       this.str.slice(this.i, this.i + 4).match(/^([0-9a-fA-F]{4})$/))
            {
              var n = parseInt(RegExp.$1, 16);
              str += String.fromCharCode(n);
              this.i += 4;
            } else {
              str += c;
            }
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
      var str = this.read_string('/', 'regx', true);
      return list(Symbol.get('regex'), str);
    },

    read_token: function() {
      var c = '', tmp = '';
      outer:
      while (true) {
        if (this.slen <= this.i) return Reader.EOF;
        c = this.str[this.i++];
        if (this.whitespace_p(c)) { continue; }
        if (this.number_p(c)) { this.i--; return this.read_number(); }
        if (this.readable_symbol_p(c)) { return this.read_readable_symbol(); }
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

    completed_p: function() {
      return (this.slen <= this.i);
    },

    read: function(str) {
      if (str) this.load_source(str);
      return this.read_expr();
    }
  }
});
ArcJS.Reader = Reader;
/** @} */
/** @file namespace.js { */
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

var global_ns     = new NameSpace('***global***', null, [], []);
NameSpace.global_ns = global_ns;
var primitives_ns = new NameSpace('arc.core.primitives', null, ['***global***'], []);
var compiler_ns   = new NameSpace('arc.core.compiler',   null, ['***global***', 'arc.core.primitives'], []);
var arc_ns        = new NameSpace('arc.core',            null, ['***global***', 'arc.core.primitives', 'arc.core.compiler'], []);
var default_ns    = new NameSpace('arc.user_default',    null, ['***global***', 'arc.core.primitives', 'arc.core.compiler', 'arc.core'], []);
NameSpace.default_ns = default_ns;

return NameSpace;

})();

ArcJS.NameSpace = NameSpace;
/** @} */
/** @file primitives.js { */
var Primitives = classify('Primitives', {
  static: {
    reader: new Reader(),
    all: []
  },
  property: {
    ns:   null,
    vars: {}
  },
  method: {
    init: function(ns_name) {
      this.ns = NameSpace.get(ns_name, true);
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

/** @file core.js { */
var nil = (function() {
  var n = new Cons(null, null);
  n.car = n; n.cdr = n;
  return n;
})();
var t = true;

var is_nodejs = (typeof module !== 'undefined' && module.exports);

var s_int                = Symbol.get('int');
var s_num                = Symbol.get('num');
var s_string             = Symbol.get('string');
var s_sym                = Symbol.get('sym');
var s_char               = Symbol.get('char');
var s_table              = Symbol.get('table');
var s_cons               = Symbol.get('cons');
var s_fn                 = Symbol.get('fn');
var s_mac                = Symbol.get('mac');
var s_internal_reference = Symbol.get('internal-reference');
var s_namespace          = Symbol.get('namespace');
var s_regex              = Symbol.get('regex');

var list_to_javascript_arr = function(lis, depth) {
  var rt = (function list_to_javascript_arr_iter(lis, depth) {
    if (lis !== nil && type(lis).name !== 'cons') return lis;
    var rt = [], itm = null;
    while (lis !== nil) {
      itm = car(lis);
      rt.push( 0 < depth ?
               list_to_javascript_arr_iter(itm, depth-1) :
               itm );
      lis = cdr(lis);
    }
    return rt;
  })(lis, depth ? (depth === true ? Infinity : depth) : 0); // not-set => 0, true => Infinity, num => num
  return (rt instanceof Array) ? rt : [rt];
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

var flat_iter = function(lis, max_depth) {
  var rt = nil;
  if (max_depth < 1) return reverse(lis);
  while (lis !== nil) {
    var x = car(lis);
    if (x !== nil) {
      if (type(x) === s_cons) {
        var deeper = flat_iter(x, max_depth - 1);
        rt = append(deeper, rt);
      }
      else rt = cons(x, rt);
    }
    lis = cdr(lis);
  }
  return rt;
};

var stringify = function stringify(x) {

  var objects = [], paths = [];

  var str_or_obj = (function stringify_iter(x, path) {
    var type_name = type(x).name;
    switch (type_name) {
    case 'int':
      if (x === Infinity)  return '+inf.0';
      if (x === -Infinity) return '-inf.0';
      return x+'';
    case 'num':
    case 'string':
      return JSON.stringify(x);
    case 'sym':
      if (x === nil) return 'nil';
      if (x === t) return 't';
      return (x.evaluable_name) ? '|' + x.name + '|' : x.name;
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
    default:
      if (x instanceof Tagged)    return '#<tagged ' + type_name + ' ' + stringify(x.obj) + '>';
      if (x instanceof Box)       return '#<internal-reference ' + stringify(x.unbox()) + '>';
      if (x instanceof NameSpace) return '#<namespace ' + x.name + '>';
      if (x instanceof Regex)     return '#<regex /' + x.src + '/>';

      // decycle and stringify
      {
        var i, name, nu;
        if (typeof x === 'object' && x !== null &&
            !(x instanceof Boolean) &&
            !(x instanceof Date)    &&
            !(x instanceof Number)  &&
            !(x instanceof RegExp)  &&
            !(x instanceof String)) {

          for (i = 0; i < objects.length; i += 1) {
            if (objects[i] === x) {
              return {$ref: paths[i]};
            }
          }

          objects.push(x);
          paths.push(path);


          if (Object.prototype.toString.apply(x) === '[object Array]') {
            nu = [];
            for (i = 0; i < x.length; i += 1) {
              nu[i] = stringify_iter(x[i], path + '[' + i + ']');
            }
          } else {
            nu = {};
            for (name in x) {
              if (Object.prototype.hasOwnProperty.call(x, name)) {
                nu[name] = stringify_iter(x[name], path + '[' + JSON.stringify(name) + ']');
              }
            }
          }
          return nu;
        }
        return x + '';
      }
    }
  })(x, '$');

  return ((typeof str_or_obj === 'string') ?
          str_or_obj :
          '#<JS ' + JSON.stringify(str_or_obj) + '>');

};

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

var primitives_core = (new Primitives('arc.core.primitives')).define({
  'read': [{dot: -1}, function(str) {
    return Primitives.reader.read(str);
  }],
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
    for (;0 < n && lis !== nil;n--) lis = cdr(lis);
    return lis;
  }],
  'lastcons': [{dot: -1}, function(lis) {
    var rt = lis;
    while (type(lis) === s_cons) {
      rt = lis;
      lis = cdr(lis);
    }
    return rt;
  }],
  'consif': [{dot: -1}, function(n, lis) {
    return (n === nil) ? lis : cons(n, lis);
  }],
  'flat': [{dot: 1}, function(lis, $$) {
    var max_depth = Infinity;
    if (1 < arguments.length) max_depth = arguments[1];
    if (lis === nil) return nil;
    if (type(lis) !== s_cons) return cons(lis, nil);
    if (max_depth < 1) return lis;
    return nreverse(flat_iter(lis, max_depth));
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
  'type': [{dot: -1}, function(x) {
    if (x === nil || x === t) return s_sym;
    var type = typeof x;
    switch (type) {
    case 'string':
      return s_string;
    case 'number':
      return ((isNaN(x))  ? Symbol.get('%javascript-NaN') :
              (!!(x % 1)) ? s_num :
              s_int);
    case 'function':
      return s_fn;
    case 'object':
      if (x instanceof Symbol)    return s_sym;
      if (x instanceof Cons)      return s_cons;
      if (x instanceof Closure)   return s_fn;
      if (x instanceof Char)      return s_char;
      if (x instanceof Table)     return s_table;
      if (x instanceof Tagged)    return x.tag;
      if (x instanceof Box)       return s_internal_reference;
      if (x instanceof NameSpace) return s_namespace;
      if (x instanceof Regex)     return s_regex;
    default:
      return Symbol.get('%javascript-' + type);
    }
  }],
  'err': [{dot: 0}, function($$) {
    var str = (
      Array.prototype.map.call(
        arguments,
        function(x) { return type(x) === s_string ? x : stringify(x); }
      ).join(' ') + '.');
    console.error(str);
    throw new Error('ERROR');
  }],
  '+': [{dot: 0}, function($$) {
    var l = arguments.length, rt = 0, num = false;
    if (l < 1) return 0;
    for (var i=l-1; 0<=i; i--) {
      var typ = type(arguments[i]);
      if (typeof arguments[i] === 'number') {
        num = true;
        rt += arguments[i];
      } else if (arguments[i] !== nil && type(arguments[i]) !== s_cons) {
        var rts = '';
        for (var i=l-1; 0<=i; i--) rts = coerce(arguments[i], s_string) + rts;
        return rts;
      }
    }
    if (num) return rt;
    return append.apply(this, arguments);
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
  'rand': [{dot: 0}, function($$) {
    var l = arguments.length;
    if (l < 1) return Math.random();
    return Math.floor(Math.random() * $$);
  }],
  'append': [{dot: 0}, function($$) {
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
  'nconc': [{dot: 0}, function($$) {
    var l = arguments.length - 1;
    if (l < 0) return nil;
    var rt = null;
    for (var i=0; i<l; i++) {
      if (arguments[i] === nil) continue;
      rt = rt || arguments[i];
      var last = lastcons(arguments[i]);
      if (last.cdr !== nil) throw new Error("nconc: Can't concatenate dotted list.");
      while (i < l) {
        if (arguments[i+1] !== nil) break;
        i++;
      }
      if (i === l) break;
      last.cdr = arguments[i+1];
    }
    return rt || arguments[l];
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
    return new Call(fn, null, args);
  }],
  'ssyntax': [{dot: 1}, function(s, $$) {
    if (s === nil || s === t) return nil;
    var specials = this.current_ns.collect_bounds('special-syntax');
    var ordered = [];
    var sstr = s.name;
    if (1 < arguments.length) {
      for (var i in specials) {
        var reg_ord_fn = rep(specials[i].v);
        var reg = car(reg_ord_fn);
        var ord = cadr(reg_ord_fn);
        var fn  = cadr(cdr(reg_ord_fn));
        ordered[ord] = [reg.asm, fn];
      }
      for (var k = 0, l = ordered.length; k<l; k++) {
        if (!ordered[k]) continue;
        var mat = sstr.match(ordered[k][0]);
        if (mat) return new Call(ordered[k][1], null, mat.slice(1).map(read));
      }
    } else {
      for (var i in specials) {
        var reg_ord_fn = rep(specials[i].v);
        var reg = car(reg_ord_fn);
        if (sstr.match(reg.asm)) return t;
      }
    }
    return nil;
  }],
  'match': [{dot: -1}, function(reg, str) {
    if (!((reg instanceof Regex) && (typeof str === 'string')))
      throw new Error('match requires regex as the first argument and string as the second.');
    var mat = str.match(reg.asm);
    return mat ? javascript_arr_to_list(mat) : nil;
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
  'table': [{dot: 0}, function($$) {
    var tbl = new Table();
    var l = arguments.length;
    if ((l % 2) === 1) throw new Error('(table) arguments must be even number.');
    for (var i = 0; i < l; i+=2) {
      tbl.put(arguments[i], arguments[i+1]);
    }
    return tbl;
  }],
  'ref': [{dot: -1}, function(obj, idx) {
    var val, typename = type(obj).name;
    switch (typename) {
    case 'string':
      if (idx < 0 || (obj.length - 1) < idx)
        throw new Error('The index is out of range. ' + idx + 'th of '+ stringify(obj) + '.');
      return Char.get(obj[idx]);
    case 'cons':
      for (var iter = obj, i = idx; 0 < i; i--) {
        if (iter === nil) throw new Error('The index is out of range. ' + idx + 'th of '+ stringify(obj) + '.');
        iter = cdr(iter);
      }
      return car(iter);
    case 'table':
      return obj.get(idx);
    }
    throw new Error('(ref obj idx) supports only cons or string or table. but ' + typename + ' given.');
  }],
  'sref': [{dot: -1}, function(obj, val, idx) {
    switch (type(obj).name) {
    case 'string':
      throw new Error('TODO: mutable string is not supported yet.');
      return val;
    case 'cons':
      for (var iter = obj, i = idx; 0 < i; i--) {
        if (iter === nil) throw new Error('The index is out of range. ' + idx + 'th of '+ stringify(obj) + '.');
        iter = cdr(iter);
      }
      scar(iter, val);
      return val;
    case 'table':
      obj.put(idx, val);
      return val;
    }
    throw new Error('(sref obj val idx) supports only cons or string or table. but ' + typename + ' given.');
  }],
  'dref': [{dot: -1}, function(obj, idx) {
    switch (type(obj).name) {
    case 'string':
      throw new Error('TODO: mutable string is not supported yet.');
      return nil;
    case 'cons':
      throw new Error('TODO: mutable string is not supported yet.');
      /* TODO Support! 
         for (var iter = obj, i = idx; 0 < i; i--) {
         if (iter === nil) throw new Error('The index is out of range. ' + idx + 'th of '+ stringify(obj) + '.');
         iter = cdr(iter);
         }
         scdr(iter, cddr(iter));
         return nil;
      */
    case 'table':
      obj.rem(idx);
      return nil;
    }
    throw new Error('(sref obj val idx) supports only cons or string or table. but ' + typename + ' given.');
  }],
  'annotate': [{dot: -1}, function(tag, obj) {
    if (type(tag).name !== 'sym')
      throw new Error("First argument must be a symbol " + stringify(tag));
    return new Tagged(tag, obj);
  }],
  'rep': [{dot: -1}, function(tagged) {
    return tagged.obj;
  }],
  'coerce': [{dot: 2}, function(obj, to_type, args) {
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
        try {
          var r = read(obj);
          if (Primitives.reader.completed_p() &&
              type(r).name === 'sym')
            return r;
          return Symbol.get(obj, true);
        } catch (e) {
          // TODO: ignore only Reader Error.
          return Symbol.get(obj, true);
        }
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
        if (obj === nil) return "";
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
  }],
  'bound': [{dot: -1}, function(symbol) {
    return this.current_ns.has(symbol.name) ? t : nil;
  }],
  'newstring': [{dot: 1}, function(n, $$) {
    var c = Char.get("\u0000");
    if (1 < arguments.length) c = arguments[1];
    var nt = type(n).name, ct = type(c).name;
    if ((nt === 'int' || nt === 'num') && ct === 'char') {
      var rt = '';
      for (;0<n;n--) rt += c.c;
      return rt;
    }
    throw new Error('newstring requires int, char.');
  }],
  'string': [{dot: 0}, function($$) {
    var rt = '';
    for (var i = arguments.length-1; -1 < i; i--) {
      rt = coerce(arguments[i], s_string) + rt;
    }
    return rt;
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
  'msec': [{dot: -1}, function() {
    return +(new Date());
  }],
  'fn-name': [{dot: 1}, function(fn, $$) {
    var closurep = (fn instanceof Closure);
    if (!closurep && !(typeof fn === 'function')) {
      var typename = type(fn).name;
      throw new Error('fn-name expects only fn-type object as the first argument. but ' + typename + ' given.');
    }
    var name;
    if (1 < arguments.length) {
      name = coerce(arguments[1], s_string);
      if (closurep) {
        fn.name = name;
      } else {
        fn.prim_name = name;
      }
    } else {
      name = (closurep) ? fn.name : fn.prim_name;
    }
    return coerce(name || nil, s_sym);
  }],
  '***defns***': [{dot: -1}, function(name, extend, imports, exports) {
    name = coerce(name, s_string);
    extend  = extend === nil ? null : extend;
    imports = list_to_javascript_arr(imports, true);
    exports = list_to_javascript_arr(exports, true);
    var ns = NameSpace.create_with_default(name, extend, imports, exports);
    return ns;
  }],
  '***curr-ns***': [{dot: -1}, function() {
    // console.log(' *** current: ' + this.current_ns.name + ' internal: ' + this.ns.name);
    return this.current_ns;
  }],
  '***export***': [{dot: -1}, function(ns, exports) {
    exports = list_to_javascript_arr(exports, true);
    if (!(ns instanceof NameSpace)) {
      if (ns instanceof Symbol) {
        ns = NameSpace.get(ns.name);
      } else if (typeof ns === 'string') {
        ns = NameSpace.get(ns);
      }
    }
    ns.add_exports(exports);
    return ns;
  }],
  '***import***': [{dot: -1}, function(ns, imports) {
    imports = list_to_javascript_arr(imports, true);
    if (!(ns instanceof NameSpace)) {
      if (ns instanceof Symbol) {
        ns = NameSpace.get(ns.name);
      } else if (typeof ns === 'string') {
        ns = NameSpace.get(ns);
      }
    }
    ns.add_imports(imports);
    return ns;
  }],
  'collect-bounds-in-ns': [{dot: 1}, function(ns, type_s) {
    var bounds = ((1 < arguments.length) ?
                  ns.collect_bounds(type_s.name) :
                  ns.collect_bounds());
    var rt = new Table();
    return rt.load_from_js_hash(bounds);
  }],
  'indirect': [{dot: -1}, function(x) {
    if (x instanceof Box) return x.unbox();
    throw new Error(stringify(x) + ' is not internal-reference type.');
  }],
  'keyword': [{dot: -1}, function(x) {
    if (!(x instanceof Symbol)) throw new Error('keyword requires a Symbol but ' + stringify(x) + ' given.');
    return (x.name[0] === ':') ? x : Symbol.get(':' + x.name);
  }],
  'keywordp': [{dot: -1}, function(x) {
    return ((x instanceof Symbol) && x.name[0] === ':') ? t : nil;
  }],
  'regex': [{dot: -1}, function(s) {
    var rt = ((typeof s === 'string') ? new Regex(s) :
              (typeof s === 'number') ? new Regex(s + '') :
              (s instanceof Symbol)   ? new Regex(s.name) :
              (s instanceof Char)     ? new Regex(s.c) :
              (s instanceof Regex)    ? s : null);
    if (rt === null) throw new Error('regex requires string, number, symbol or char. but got ' + stringify(s) + '.');
    return rt;
  }],
});

var coerce      = primitives_core.vars.coerce;
var type        = primitives_core.vars.type;
var read        = primitives_core.vars.read;
var cons        = primitives_core.vars.cons;
var list        = primitives_core.vars.list;
var car         = primitives_core.vars.car;
var scar        = primitives_core.vars.scar;
var cdr         = primitives_core.vars.cdr;
var scdr        = primitives_core.vars.scdr;
var caar        = primitives_core.vars.caar;
var cadr        = primitives_core.vars.cadr;
var cddr        = primitives_core.vars.cddr;
var nthcdr      = primitives_core.vars.nthcdr;
var lastcons    = primitives_core.vars.lastcons;
var append      = primitives_core.vars.append;
var nconc       = primitives_core.vars.nconc;
var reverse     = primitives_core.vars.rev;
var nreverse    = primitives_core.vars.nrev;
var rep         = primitives_core.vars.rep;
var annotate    = primitives_core.vars.annotate;

ArcJS.nil       = nil;
ArcJS.t         = t;
ArcJS.type      = type;
ArcJS.stringify = stringify;
ArcJS.cons      = cons;
ArcJS.list      = list;
ArcJS.read      = read;
ArcJS.car       = car;
ArcJS.cdr       = cdr;
ArcJS.cadr      = cadr;
ArcJS.cddr      = cddr;
ArcJS.nreverse  = nreverse;
ArcJS.rep       = rep;
ArcJS.annotate  = annotate;
ArcJS.list_to_javascript_arr = list_to_javascript_arr;
ArcJS.javascript_arr_to_list = javascript_arr_to_list;
/** @} */
/** @} */
/** @file preload.js { */
var preloads = [];
var preload_vals = [];
// compiler
/** @file compiler.fasl { */
// This is an auto generated file.
// Compiled from ['src/arc/compiler.arc'].
// DON'T EDIT !!!
preloads.push([
[6,0,25,26],
[0,15,0,6,6,1,7,11,2,21,22,7,6,3,7,6,4,7,11,5,21,22,26],
[0,127,6,6,7,1,0,118,3,2,9,0,2,85,6,7,7,9,2,7,0,72,6,8,7,0,28,9,2,7,0,19,0,10,6,9,7,9,1,7,6,4,7,11,10,21,22,7,9,0,7,6,4,7,11,11,21,22,7,6,4,7,11,10,21,22,7,0,21,6,12,7,9,2,7,0,10,6,13,7,9,2,7,6,4,7,11,10,21,22,7,6,14,7,11,10,21,22,7,0,12,6,15,7,6,16,7,9,2,7,6,14,7,11,10,21,22,7,6,17,7,11,10,21,22,7,6,14,7,11,10,21,5,4,4,22,3,31,6,15,7,6,16,7,0,19,0,10,6,9,7,9,2,7,6,4,7,11,10,21,22,7,9,1,7,6,4,7,11,11,21,22,7,6,14,7,11,10,21,5,4,4,22,23,4,7,6,4,7,11,15,21,22,19,6,26],
[1,0,16,0,-1,0,6,6,1,7,11,2,21,22,7,6,6,7,6,4,7,11,18,21,5,3,1,22,19,19,26],
[1,0,20,1,-1,6,9,7,0,8,6,20,7,6,21,7,11,10,21,22,7,9,0,7,6,14,7,11,10,21,5,4,2,22,7,14,0,10,8,0,0,7,6,22,7,6,4,7,11,12,21,22,0,10,6,6,7,8,0,0,7,6,4,7,11,15,21,22,15,2,2,19,22,26],
[1,0,75,3,2,6,8,7,0,10,9,2,7,12,7,6,4,7,11,10,21,22,7,0,30,6,7,7,9,2,7,0,19,0,10,6,9,7,9,1,7,6,4,7,11,10,21,22,7,9,0,7,6,4,7,11,11,21,22,7,6,14,7,11,10,21,22,7,0,21,6,12,7,9,2,7,0,10,6,13,7,9,2,7,6,4,7,11,10,21,22,7,6,14,7,11,10,21,22,7,9,2,7,6,23,7,11,10,21,5,6,4,22,7,14,0,10,8,0,0,7,6,24,7,6,4,7,11,12,21,22,0,10,6,6,7,8,0,0,7,6,4,7,11,15,21,22,15,2,2,19,24,26],
[1,0,22,2,1,0,12,6,24,7,6,25,7,9,1,7,6,14,7,11,10,21,22,7,9,0,7,6,4,7,11,11,21,5,3,3,22,7,14,0,10,8,0,0,7,6,26,7,6,4,7,11,12,21,22,0,10,6,6,7,8,0,0,7,6,4,7,11,15,21,22,15,2,2,19,26,26],
[1,0,137,1,0,0,8,9,0,7,6,21,7,11,27,21,22,7,6,21,7,12,7,14,20,0,8,0,0,7,1,1,102,1,-1,0,8,9,0,7,6,21,7,11,28,21,22,7,14,0,17,0,8,8,0,0,7,6,21,7,11,29,21,22,7,6,4,7,6,4,7,11,30,21,22,2,44,6,31,7,0,8,8,0,0,7,6,21,7,11,28,21,22,7,0,8,8,0,0,7,6,21,7,11,32,21,22,7,0,15,0,8,9,0,7,6,21,7,11,33,21,22,7,6,21,7,10,0,21,22,7,6,17,7,11,10,21,5,5,4,22,3,29,0,17,0,8,8,0,0,7,6,21,7,11,29,21,22,7,6,21,7,6,4,7,11,30,21,22,2,10,8,0,0,7,6,21,7,11,28,21,5,2,4,22,3,2,12,15,2,2,23,2,16,0,0,0,11,8,0,0,21,7,6,25,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,5,2,2,22,7,14,0,10,8,0,0,7,6,34,7,6,4,7,11,12,21,22,0,10,6,6,7,8,0,0,7,6,4,7,11,15,21,22,15,2,2,19,34,26],
[1,0,72,1,0,0,8,9,0,7,6,21,7,11,33,21,22,2,46,6,31,7,0,8,9,0,7,6,21,7,11,28,21,22,7,0,24,0,8,6,35,7,6,21,7,11,10,21,22,7,0,8,9,0,7,6,21,7,11,33,21,22,7,6,4,7,11,11,21,22,7,12,7,6,17,7,11,10,21,5,5,2,22,3,17,0,8,9,0,7,6,21,7,11,28,21,22,7,14,8,0,0,2,3,8,0,0,3,2,12,15,2,2,23,2,7,14,0,10,8,0,0,7,6,35,7,6,4,7,11,12,21,22,0,10,6,6,7,8,0,0,7,6,4,7,11,15,21,22,15,2,2,19,35,26],
[1,0,79,1,0,9,0,2,75,0,6,6,1,7,11,36,21,22,7,14,0,64,6,8,7,0,17,8,0,0,7,0,8,9,0,7,6,21,7,11,28,21,22,7,6,4,7,11,10,21,22,7,0,37,6,31,7,8,0,0,7,8,0,0,7,0,24,0,8,6,37,7,6,21,7,11,10,21,22,7,0,8,9,0,7,6,21,7,11,33,21,22,7,6,4,7,11,11,21,22,7,6,17,7,11,10,21,22,7,6,14,7,11,10,21,22,15,2,2,3,2,12,23,2,7,14,0,10,8,0,0,7,6,37,7,6,4,7,11,12,21,22,0,10,6,6,7,8,0,0,7,6,4,7,11,15,21,22,15,2,2,19,37,26],
[1,0,29,3,2,0,19,6,8,7,0,10,9,2,7,9,1,7,6,4,7,11,10,21,22,7,6,4,7,11,10,21,22,7,9,0,7,6,4,7,11,11,21,5,3,4,22,7,14,0,10,8,0,0,7,6,38,7,6,4,7,11,12,21,22,0,10,6,6,7,8,0,0,7,6,4,7,11,15,21,22,15,2,2,19,38,26],
[1,0,33,3,2,6,7,7,9,2,7,0,21,0,12,6,24,7,9,2,7,9,1,7,6,14,7,11,10,21,22,7,9,0,7,6,4,7,11,11,21,22,7,6,14,7,11,10,21,5,4,4,22,7,14,0,10,8,0,0,7,6,39,7,6,4,7,11,12,21,22,0,10,6,6,7,8,0,0,7,6,4,7,11,15,21,22,15,2,2,19,39,26],
[1,0,150,1,0,0,8,9,0,7,6,21,7,11,27,21,22,7,6,21,7,12,7,14,20,0,8,0,0,7,1,1,115,1,-1,0,8,9,0,7,6,21,7,11,28,21,22,7,14,0,17,0,8,8,0,0,7,6,21,7,11,29,21,22,7,6,4,7,6,4,7,11,30,21,22,2,57,6,38,7,6,40,7,0,8,8,0,0,7,6,21,7,11,28,21,22,7,0,35,6,31,7,6,40,7,0,8,8,0,0,7,6,21,7,11,32,21,22,7,0,15,0,8,9,0,7,6,21,7,11,33,21,22,7,6,21,7,10,0,21,22,7,6,17,7,11,10,21,22,7,6,17,7,11,10,21,5,5,4,22,3,29,0,17,0,8,8,0,0,7,6,21,7,11,29,21,22,7,6,21,7,6,4,7,11,30,21,22,2,10,8,0,0,7,6,21,7,11,28,21,5,2,4,22,3,2,12,15,2,2,23,2,16,0,0,0,11,8,0,0,21,7,6,25,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,5,2,2,22,7,14,0,10,8,0,0,7,6,41,7,6,4,7,11,12,21,22,0,10,6,6,7,8,0,0,7,6,4,7,11,15,21,22,15,2,2,19,41,26],
[1,0,135,3,2,12,7,14,20,0,8,0,0,7,9,2,7,1,2,89,1,-1,0,15,0,8,9,0,7,6,21,7,11,33,21,22,7,6,21,7,11,42,21,22,2,10,9,0,7,6,21,7,11,28,21,5,2,2,22,3,63,6,34,7,0,28,6,30,7,10,0,7,0,17,6,13,7,0,8,9,0,7,6,21,7,11,28,21,22,7,6,4,7,11,10,21,22,7,6,14,7,11,10,21,22,7,0,8,9,0,7,6,21,7,11,32,21,22,7,0,15,0,8,9,0,7,6,21,7,11,43,21,22,7,6,21,7,10,1,21,22,7,6,17,7,11,10,21,5,5,2,22,23,2,16,0,0,0,11,8,0,0,21,7,6,25,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,7,14,6,38,7,9,2,7,9,1,7,0,7,9,0,7,6,21,7,8,0,0,22,7,6,17,7,11,10,21,5,5,6,22,7,14,0,10,8,0,0,7,6,44,7,6,4,7,11,12,21,22,0,10,6,6,7,8,0,0,7,6,4,7,11,15,21,22,15,2,2,19,44,26],
[1,0,27,2,1,0,17,6,44,7,0,6,6,1,7,11,36,21,22,7,9,1,7,6,14,7,11,10,21,22,7,9,0,7,6,4,7,11,11,21,5,3,3,22,7,14,0,10,8,0,0,7,6,45,7,6,4,7,11,12,21,22,0,10,6,6,7,8,0,0,7,6,4,7,11,15,21,22,15,2,2,19,45,26],
[1,0,199,2,1,0,17,0,8,9,0,7,6,21,7,11,29,21,22,7,6,21,7,6,4,7,11,46,21,22,7,14,0,10,8,0,0,7,9,0,7,6,4,7,11,47,21,22,7,0,10,8,0,0,7,9,0,7,6,4,7,11,48,21,22,7,14,6,45,7,0,147,0,19,6,28,7,0,10,9,1,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,0,120,0,111,11,11,21,7,12,7,0,99,9,1,7,1,1,88,1,-1,0,8,9,0,7,6,21,7,11,28,21,22,7,0,71,0,62,6,50,7,0,53,0,17,6,9,7,0,8,9,0,7,6,21,7,11,33,21,22,7,6,4,7,11,49,21,22,7,0,28,0,19,6,33,7,0,10,10,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,2,22,7,8,0,1,7,6,4,7,11,51,21,22,7,6,14,7,11,50,21,22,7,8,0,0,7,6,4,7,11,11,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,8,22,7,14,0,10,8,0,0,7,6,52,7,6,4,7,11,12,21,22,0,10,6,6,7,8,0,0,7,6,4,7,11,15,21,22,15,2,2,19,52,26],
[12,7,14,20,0,1,0,164,1,-1,4,2,7,6,21,7,9,0,7,1,1,155,1,-1,10,0,7,6,21,7,12,7,14,20,0,8,0,0,7,9,0,7,1,2,125,1,-1,0,8,9,0,7,6,21,7,11,53,21,22,7,14,0,10,8,0,0,7,6,49,7,6,4,7,11,30,21,22,2,101,0,8,9,0,7,6,21,7,11,28,21,22,7,14,0,10,8,0,0,7,6,54,7,6,4,7,11,30,21,22,2,28,0,26,10,0,7,1,1,8,1,-1,13,7,6,21,7,10,0,5,2,2,22,7,0,8,9,0,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,51,0,10,8,0,0,7,6,55,7,6,4,7,11,30,21,22,2,28,0,26,10,0,7,1,1,8,1,-1,13,7,6,21,7,10,0,5,2,2,22,7,0,8,9,0,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,13,0,11,10,1,21,7,9,0,7,6,4,7,11,51,21,22,12,15,2,2,3,2,12,15,2,2,23,2,16,0,0,0,11,8,0,0,21,7,6,25,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,5,2,2,22,5,2,2,22,16,0,0,0,11,8,0,0,21,7,6,56,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,56,26],
[12,7,14,20,0,8,0,0,7,1,1,480,1,-1,0,8,9,0,7,6,21,7,11,56,21,22,2,19,0,17,0,8,9,0,7,6,21,7,11,53,21,22,7,6,49,7,6,4,7,11,30,21,22,3,2,12,2,440,0,8,9,0,7,6,21,7,11,28,21,22,7,14,0,10,8,0,0,7,6,54,7,6,4,7,11,30,21,22,2,21,0,19,1,0,3,1,-1,9,0,23,2,7,0,8,9,0,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,397,0,10,8,0,0,7,6,55,7,6,4,7,11,30,21,22,2,27,0,25,1,0,9,1,-1,6,57,7,6,21,7,11,58,21,5,2,2,22,7,0,8,9,0,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,360,0,15,0,8,9,0,7,6,21,7,11,28,21,22,7,6,21,7,11,53,21,22,7,14,0,10,8,0,0,7,6,49,7,6,4,7,11,30,21,22,2,291,0,15,0,8,9,0,7,6,21,7,11,28,21,22,7,6,21,7,11,28,21,22,7,14,0,10,8,0,0,7,6,59,7,6,4,7,11,30,21,22,2,70,0,68,9,0,7,10,0,7,1,2,41,1,-1,6,49,7,0,15,0,8,9,0,7,6,21,7,11,60,21,22,7,6,21,7,10,0,21,22,7,0,15,0,8,10,1,7,6,21,7,11,33,21,22,7,6,21,7,10,0,21,22,7,6,14,7,11,10,21,5,4,2,22,7,0,15,0,8,9,0,7,6,21,7,11,28,21,22,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,192,0,10,8,0,0,7,6,54,7,6,4,7,11,30,21,22,2,56,0,54,9,0,7,10,0,7,1,2,27,1,-1,6,49,7,9,0,7,0,15,0,8,10,1,7,6,21,7,11,33,21,22,7,6,21,7,10,0,21,22,7,6,14,7,11,10,21,5,4,2,22,7,0,15,0,8,9,0,7,6,21,7,11,28,21,22,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,126,0,10,8,0,0,7,6,55,7,6,4,7,11,30,21,22,2,75,0,73,10,0,7,9,0,7,1,2,46,1,-1,0,15,0,8,10,0,7,6,21,7,11,33,21,22,7,6,21,7,11,42,21,22,2,3,9,0,3,27,6,11,7,9,0,7,0,15,0,8,10,0,7,6,21,7,11,33,21,22,7,6,21,7,10,1,21,22,7,6,14,7,11,10,21,5,4,2,22,23,2,7,0,15,0,8,9,0,7,6,21,7,11,28,21,22,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,41,0,40,6,49,7,0,15,0,8,9,0,7,6,21,7,11,28,21,22,7,6,21,7,10,0,21,22,7,0,15,0,8,9,0,7,6,21,7,11,33,21,22,7,6,21,7,10,0,21,22,7,6,14,7,11,10,21,22,15,2,2,3,41,0,40,6,49,7,0,15,0,8,9,0,7,6,21,7,11,28,21,22,7,6,21,7,10,0,21,22,7,0,15,0,8,9,0,7,6,21,7,11,33,21,22,7,6,21,7,10,0,21,22,7,6,14,7,11,10,21,22,15,2,2,15,2,2,3,11,6,13,7,9,0,7,6,4,7,11,10,21,5,3,2,22,23,2,16,0,0,0,11,8,0,0,21,7,6,61,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,61,26],
[12,7,14,20,0,8,0,0,7,1,1,175,1,-1,0,8,9,0,7,6,21,7,11,56,21,22,2,19,0,17,0,8,9,0,7,6,21,7,11,53,21,22,7,6,49,7,6,4,7,11,30,21,22,3,2,12,2,135,0,8,9,0,7,6,21,7,11,28,21,22,7,14,0,10,8,0,0,7,6,59,7,6,4,7,11,30,21,22,2,36,0,34,10,0,7,1,1,16,1,-1,0,8,9,0,7,6,21,7,10,0,21,22,7,6,21,7,10,0,21,5,2,2,22,7,0,8,9,0,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,77,0,10,8,0,0,7,6,54,7,6,4,7,11,30,21,22,2,21,0,19,1,0,3,1,-1,9,0,23,2,7,0,8,9,0,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,46,0,10,8,0,0,7,6,55,7,6,4,7,11,30,21,22,2,27,0,25,1,0,9,1,-1,6,62,7,6,21,7,11,58,21,5,2,2,22,7,0,8,9,0,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,9,0,8,9,0,7,6,21,7,11,61,21,22,15,2,2,3,11,6,13,7,9,0,7,6,4,7,11,10,21,5,3,2,22,23,2,16,0,0,0,11,8,0,0,21,7,6,60,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,60,26],
[1,0,9,1,-1,9,0,7,6,21,7,11,60,21,5,2,2,22,7,14,0,10,8,0,0,7,6,59,7,6,4,7,11,12,21,22,0,10,6,6,7,8,0,0,7,6,4,7,11,15,21,22,15,2,2,19,59,26],
[12,7,14,20,0,1,0,84,2,-1,9,0,7,12,7,6,4,7,12,7,14,20,0,9,1,7,8,0,0,7,1,2,52,2,-1,9,1,2,41,0,8,9,1,7,6,21,7,11,33,21,22,7,0,23,0,14,0,8,9,1,7,6,21,7,11,28,21,22,7,6,21,7,10,1,22,7,9,0,7,6,4,7,11,49,21,22,7,6,4,7,10,0,21,5,3,3,22,3,9,9,0,7,6,21,7,11,63,21,5,2,3,22,23,3,16,0,0,0,11,8,0,0,21,7,6,25,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,5,3,3,22,16,0,0,0,11,8,0,0,21,7,6,51,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,51,26],
[1,0,98,2,1,0,8,9,1,7,6,21,7,11,42,21,22,2,12,6,64,7,9,0,7,6,4,7,11,49,21,5,3,3,22,3,77,6,38,7,0,67,0,8,9,1,7,6,21,7,11,28,21,22,7,0,51,0,8,9,1,7,6,21,7,11,32,21,22,7,0,35,0,26,6,65,7,0,17,0,8,9,1,7,6,21,7,11,43,21,22,7,9,0,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,3,22,23,3,7,14,0,10,8,0,0,7,6,65,7,6,4,7,11,12,21,22,0,10,6,6,7,8,0,0,7,6,4,7,11,15,21,22,15,2,2,19,65,26],
[1,0,171,2,1,0,8,9,1,7,6,21,7,11,66,21,22,2,97,6,8,7,0,86,0,77,11,11,21,7,12,7,0,65,1,0,56,1,-1,9,0,7,0,46,0,37,6,36,7,0,28,0,19,6,13,7,0,10,9,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,2,22,7,9,1,7,6,4,7,11,51,21,22,7,6,14,7,11,50,21,22,7,9,0,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,3,22,3,65,6,38,7,0,55,9,1,7,0,46,0,37,6,36,7,0,28,0,19,6,13,7,0,10,9,1,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,9,0,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,3,22,23,3,7,14,0,10,8,0,0,7,6,67,7,6,4,7,11,12,21,22,0,10,6,6,7,8,0,0,7,6,4,7,11,15,21,22,15,2,2,19,67,26],
[1,0,156,1,0,0,8,6,68,7,6,21,7,11,36,21,22,7,14,6,9,7,0,136,8,0,0,7,0,127,0,118,9,0,7,6,21,7,12,7,14,20,0,8,1,0,7,8,0,0,7,1,2,89,1,-1,0,8,9,0,7,6,21,7,11,33,21,22,2,33,0,8,9,0,7,6,21,7,11,28,21,22,7,0,15,0,8,9,0,7,6,21,7,11,33,21,22,7,6,21,7,10,0,21,22,7,6,4,7,11,10,21,5,3,2,22,3,47,6,50,7,0,37,0,8,9,0,7,6,21,7,11,28,21,22,2,10,0,8,9,0,7,6,21,7,11,28,21,22,3,2,6,69,7,0,10,10,1,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,2,22,23,2,16,0,0,0,11,8,0,0,21,7,6,25,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,4,22,7,14,0,10,8,0,0,7,6,70,7,6,4,7,11,12,21,22,0,10,6,6,7,8,0,0,7,6,4,7,11,15,21,22,15,2,2,19,70,26],
[12,7,14,20,0,1,0,22,1,-1,9,0,7,1,1,18,1,0,0,10,10,0,7,9,0,7,6,4,7,11,50,21,22,7,6,21,7,11,42,21,5,2,2,22,23,2,16,0,0,0,11,8,0,0,21,7,6,71,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,71,26],
[1,0,422,2,1,6,72,7,0,412,0,19,6,13,7,0,10,9,1,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,0,385,9,0,7,12,7,12,7,12,7,12,7,6,23,7,12,7,14,20,0,8,0,0,7,1,1,350,5,-1,0,8,9,4,7,6,21,7,11,28,21,22,7,14,8,0,0,7,14,0,10,8,0,0,7,12,7,6,4,7,11,30,21,22,2,64,9,2,7,0,26,6,13,7,0,17,0,8,9,1,7,6,21,7,11,63,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,0,26,6,13,7,0,17,0,8,9,0,7,6,21,7,11,63,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,14,7,11,10,21,5,4,10,22,3,261,0,10,8,0,0,7,6,73,7,6,4,7,11,30,21,22,2,25,0,8,9,4,7,6,21,7,11,33,21,22,7,6,74,7,9,2,7,9,1,7,9,0,7,6,23,7,10,0,21,5,6,10,22,3,226,0,10,8,0,0,7,6,75,7,6,4,7,11,30,21,22,2,25,0,8,9,4,7,6,21,7,11,33,21,22,7,6,76,7,9,2,7,9,1,7,9,0,7,6,23,7,10,0,21,5,6,10,22,3,191,0,10,8,0,0,7,6,77,7,6,4,7,11,30,21,22,2,25,0,8,9,4,7,6,21,7,11,33,21,22,7,6,78,7,9,2,7,9,1,7,9,0,7,6,23,7,10,0,21,5,6,10,22,3,156,9,3,7,14,0,10,8,0,0,7,6,74,7,6,4,7,11,30,21,22,2,34,0,32,0,8,9,4,7,6,21,7,11,33,21,22,7,9,3,7,0,10,6,13,7,8,2,0,7,6,4,7,11,10,21,22,7,9,1,7,9,0,7,6,23,7,10,0,21,22,3,108,0,10,8,0,0,7,6,76,7,6,4,7,11,30,21,22,2,34,0,32,0,8,9,4,7,6,21,7,11,33,21,22,7,9,3,7,9,2,7,0,10,8,2,0,7,9,1,7,6,4,7,11,49,21,22,7,9,0,7,6,23,7,10,0,21,22,3,64,0,10,8,0,0,7,6,78,7,6,4,7,11,30,21,22,2,34,0,32,0,8,9,4,7,6,21,7,11,33,21,22,7,9,3,7,9,2,7,9,1,7,0,10,8,2,0,7,9,0,7,6,4,7,11,49,21,22,7,6,23,7,10,0,21,22,3,20,0,19,0,12,6,79,7,8,2,0,7,6,80,7,6,14,7,11,11,21,22,7,6,21,7,11,58,21,22,15,2,2,15,4,2,23,6,16,0,0,0,11,8,0,0,21,7,6,25,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,3,22,7,14,0,10,8,0,0,7,6,81,7,6,4,7,11,12,21,22,0,10,6,6,7,8,0,0,7,6,4,7,11,15,21,22,15,2,2,19,81,26],
[1,0,47,1,0,6,5,7,0,37,6,82,7,0,28,0,19,6,13,7,0,10,9,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,2,22,7,14,0,10,8,0,0,7,6,83,7,6,4,7,11,12,21,22,0,10,6,6,7,8,0,0,7,6,4,7,11,15,21,22,15,2,2,19,83,26],
[1,0,47,1,0,6,84,7,0,37,6,82,7,0,28,0,19,6,13,7,0,10,9,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,2,22,7,14,0,10,8,0,0,7,6,85,7,6,4,7,11,12,21,22,0,10,6,6,7,8,0,0,7,6,4,7,11,15,21,22,15,2,2,19,85,26],
[6,1,19,86,26],
[1,0,155,4,3,6,64,7,0,145,0,118,6,7,7,0,109,9,3,7,0,100,0,91,6,15,7,0,82,6,87,7,0,73,0,64,6,10,7,0,55,9,2,7,0,46,6,86,7,0,37,0,28,6,24,7,0,19,9,3,7,0,10,9,1,7,9,0,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,0,19,6,88,7,0,10,9,3,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,5,22,7,14,0,10,8,0,0,7,6,89,7,6,4,7,11,12,21,22,0,10,6,6,7,8,0,0,7,6,4,7,11,15,21,22,15,2,2,19,89,26],
[0,212,6,90,7,0,203,0,8,6,91,7,6,21,7,11,92,21,22,7,11,86,21,7,12,7,14,20,0,1,0,165,2,-1,0,8,6,93,7,6,21,7,11,36,21,22,7,0,8,6,94,7,6,21,7,11,36,21,22,7,14,6,38,7,0,136,8,0,1,7,0,127,6,82,7,0,118,0,37,6,95,7,0,28,0,19,6,13,7,0,10,9,1,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,0,73,0,64,6,38,7,0,55,8,0,0,7,0,46,9,0,7,0,37,0,19,6,95,7,0,10,8,0,1,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,0,10,8,0,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,6,22,16,0,0,0,11,8,0,0,21,7,6,96,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,7,6,14,7,11,10,21,22,7,6,4,7,11,15,21,22,19,96,0,11,11,86,21,7,6,21,7,6,4,7,11,11,21,22,19,86,11,96,21,26],
[0,76,6,90,7,0,67,0,8,6,97,7,6,21,7,11,92,21,22,7,11,86,21,7,12,7,14,20,0,1,0,29,2,-1,6,70,7,0,19,9,1,7,0,10,9,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,3,22,16,0,0,0,11,8,0,0,21,7,6,98,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,7,6,14,7,11,10,21,22,7,6,4,7,11,15,21,22,19,98,0,11,11,86,21,7,6,21,7,6,4,7,11,11,21,22,19,86,11,98,21,26],
[0,67,6,90,7,0,58,0,8,6,99,7,6,21,7,11,92,21,22,7,11,86,21,7,12,7,14,20,0,1,0,20,1,-1,6,71,7,0,10,9,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,2,22,16,0,0,0,11,8,0,0,21,7,6,100,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,7,6,14,7,11,10,21,22,7,6,4,7,11,15,21,22,19,100,0,11,11,86,21,7,6,21,7,6,4,7,11,11,21,22,19,86,11,100,21,26],
[0,67,6,90,7,0,58,0,8,6,101,7,6,21,7,11,92,21,22,7,11,86,21,7,12,7,14,20,0,1,0,20,2,-1,9,1,7,0,10,9,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,3,22,16,0,0,0,11,8,0,0,21,7,6,102,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,7,6,14,7,11,10,21,22,7,6,4,7,11,15,21,22,19,102,0,11,11,86,21,7,6,21,7,6,4,7,11,11,21,22,19,86,11,102,21,26],
[0,85,6,90,7,0,76,0,8,6,103,7,6,21,7,11,92,21,22,7,11,86,21,7,12,7,14,20,0,1,0,38,2,-1,9,1,7,0,28,0,19,6,13,7,0,10,9,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,3,22,16,0,0,0,11,8,0,0,21,7,6,104,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,7,6,14,7,11,10,21,22,7,6,4,7,11,15,21,22,19,104,0,11,11,86,21,7,6,21,7,6,4,7,11,11,21,22,19,86,11,104,21,26],
[0,85,6,90,7,0,76,0,8,6,105,7,6,21,7,11,92,21,22,7,11,86,21,7,12,7,14,20,0,1,0,38,1,-1,6,106,7,0,28,0,19,6,13,7,0,10,9,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,2,22,16,0,0,0,11,8,0,0,21,7,6,107,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,7,6,14,7,11,10,21,22,7,6,4,7,11,15,21,22,19,107,0,11,11,86,21,7,6,21,7,6,4,7,11,11,21,22,19,86,11,107,21,26],
[1,0,113,3,2,0,28,0,19,0,10,9,2,7,6,108,7,6,4,7,11,109,21,22,7,6,110,7,6,4,7,11,11,21,22,7,6,111,7,6,4,7,11,109,21,22,7,14,6,7,7,0,73,8,0,0,7,0,64,0,55,6,15,7,0,46,6,112,7,0,37,0,28,6,24,7,0,19,8,0,0,7,0,10,9,1,7,9,0,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,6,22,7,14,0,10,8,0,0,7,6,113,7,6,4,7,11,12,21,22,0,10,6,6,7,8,0,0,7,6,4,7,11,15,21,22,15,2,2,19,113,26],
[0,39,6,114,7,12,7,14,20,0,1,0,11,2,-1,9,1,7,9,0,7,6,4,7,11,115,21,5,3,3,22,16,0,0,0,11,8,0,0,21,7,6,116,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,7,6,4,7,11,15,21,22,19,116,26],
[0,39,6,114,7,12,7,14,20,0,1,0,11,2,-1,9,1,7,9,0,7,6,4,7,11,115,21,5,3,3,22,16,0,0,0,11,8,0,0,21,7,6,117,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,7,6,4,7,11,15,21,22,19,117,26],
[0,39,6,114,7,12,7,14,20,0,1,0,11,2,-1,9,1,7,9,0,7,6,4,7,11,115,21,5,3,3,22,16,0,0,0,11,8,0,0,21,7,6,118,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,7,6,4,7,11,15,21,22,19,118,26],
[12,7,14,20,0,8,0,0,7,1,1,139,2,-1,0,10,9,0,7,6,108,7,6,4,7,11,119,21,22,2,38,0,19,9,1,7,0,10,9,0,7,6,49,7,6,4,7,11,109,21,22,7,6,4,7,10,0,21,22,7,14,8,0,0,2,12,0,10,8,0,0,7,6,108,7,6,4,7,11,109,21,22,3,2,12,15,2,2,3,90,0,10,9,1,7,6,9,7,6,4,7,11,119,21,22,2,69,9,0,7,6,21,7,12,7,14,20,0,8,0,0,7,9,1,7,1,2,38,1,-1,9,0,2,34,0,14,0,8,9,0,7,6,21,7,11,28,21,22,7,6,21,7,10,0,22,2,3,9,0,3,16,0,8,9,0,7,6,21,7,11,33,21,22,7,6,21,7,10,1,21,5,2,2,22,3,2,12,23,2,16,0,0,0,11,8,0,0,21,7,6,25,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,5,2,3,22,3,11,9,1,7,9,0,7,6,4,7,11,120,21,5,3,3,22,23,3,16,0,0,0,11,8,0,0,21,7,6,121,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,121,26],
[12,7,14,20,0,1,0,32,3,-1,0,11,9,2,7,11,30,21,7,6,4,7,11,30,21,22,2,14,9,2,7,9,1,7,9,0,7,6,14,7,11,122,21,5,4,4,22,3,6,13,2,3,12,3,2,12,23,4,16,0,0,0,11,8,0,0,21,7,6,123,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,123,26],
[12,7,14,20,0,8,0,0,7,1,1,296,2,1,0,20,1,0,11,1,-1,9,0,7,6,108,7,6,4,7,11,119,21,5,3,2,22,7,9,0,7,6,4,7,11,121,21,22,2,149,0,21,11,124,21,7,0,11,11,29,21,7,9,0,7,6,4,7,10,0,21,22,7,6,4,7,11,50,21,22,7,14,0,123,6,1,7,12,7,6,4,7,12,7,14,20,0,9,0,7,10,0,7,9,1,7,8,0,0,7,8,1,0,7,1,5,86,2,-1,0,10,9,1,7,10,0,7,6,4,7,11,30,21,22,2,19,0,8,9,0,7,6,21,7,11,63,21,22,7,6,108,7,6,4,7,11,109,21,5,3,3,22,3,56,0,10,9,1,7,6,21,7,6,4,7,11,11,21,22,7,0,37,0,28,10,2,7,0,19,9,1,7,1,1,8,1,-1,10,0,7,6,21,7,9,0,5,2,2,22,7,10,4,7,6,4,7,10,3,21,22,7,6,4,7,11,50,21,22,7,9,0,7,6,4,7,11,49,21,22,7,6,4,7,10,1,21,5,3,3,22,23,3,16,0,0,0,11,8,0,0,21,7,6,25,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,22,15,2,2,3,126,0,15,0,8,9,0,7,6,21,7,11,33,21,22,7,6,21,7,11,42,21,22,2,19,9,1,7,0,8,9,0,7,6,21,7,11,28,21,22,7,6,4,7,11,51,21,5,3,3,22,3,92,9,0,7,6,21,7,12,7,14,20,0,8,0,0,7,9,1,7,1,2,62,1,-1,0,11,11,42,21,7,9,0,7,6,4,7,11,121,21,22,2,3,12,3,47,0,20,10,0,7,0,11,11,28,21,7,9,0,7,6,4,7,11,51,21,22,7,6,4,7,11,50,21,22,7,0,18,0,11,11,33,21,7,9,0,7,6,4,7,11,51,21,22,7,6,21,7,10,1,21,22,7,6,4,7,11,49,21,5,3,2,22,23,2,16,0,0,0,11,8,0,0,21,7,6,25,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,5,2,3,22,23,3,16,0,0,0,11,8,0,0,21,7,6,125,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,125,26],
[12,7,14,20,0,1,0,26,2,1,11,11,21,7,12,7,0,13,11,125,21,7,9,1,7,9,0,7,6,14,7,11,50,21,22,7,6,14,7,11,50,21,5,4,3,22,16,0,0,0,11,8,0,0,21,7,6,126,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,126,26],
[12,7,14,20,0,1,0,34,2,-1,9,1,7,1,1,22,1,-1,0,7,9,0,7,6,21,7,10,0,22,2,12,9,0,7,12,7,6,4,7,11,49,21,5,3,2,22,3,2,12,23,2,7,9,0,7,6,4,7,11,126,21,5,3,3,22,16,0,0,0,11,8,0,0,21,7,6,127,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,127,26],
[12,7,14,20,0,8,0,0,7,1,1,75,2,-1,9,1,2,71,0,17,0,8,9,1,7,6,21,7,11,28,21,22,7,9,0,7,6,4,7,11,120,21,22,2,19,0,8,9,1,7,6,21,7,11,33,21,22,7,9,0,7,6,4,7,10,0,21,5,3,3,22,3,34,0,8,9,1,7,6,21,7,11,28,21,22,7,0,17,0,8,9,1,7,6,21,7,11,33,21,22,7,9,0,7,6,4,7,10,0,21,22,7,6,4,7,11,49,21,5,3,3,22,3,2,12,23,3,16,0,0,0,11,8,0,0,21,7,6,128,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,128,26],
[12,7,14,20,0,8,0,0,7,1,1,75,2,-1,9,1,2,71,0,17,0,8,9,1,7,6,21,7,11,28,21,22,7,9,0,7,6,4,7,11,120,21,22,2,35,0,8,9,1,7,6,21,7,11,28,21,22,7,0,17,0,8,9,1,7,6,21,7,11,33,21,22,7,9,0,7,6,4,7,10,0,21,22,7,6,4,7,11,49,21,5,3,3,22,3,18,0,8,9,1,7,6,21,7,11,33,21,22,7,9,0,7,6,4,7,10,0,21,5,3,3,22,3,2,12,23,3,16,0,0,0,11,8,0,0,21,7,6,129,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,129,26],
[12,7,14,20,0,8,0,0,7,1,1,64,1,-1,0,8,9,0,7,6,21,7,11,42,21,22,2,3,12,3,52,0,8,9,0,7,6,21,7,11,130,21,22,2,12,9,0,7,12,7,6,4,7,11,49,21,5,3,2,22,3,32,0,8,9,0,7,6,21,7,11,28,21,22,7,0,15,0,8,9,0,7,6,21,7,11,33,21,22,7,6,21,7,10,0,21,22,7,6,4,7,11,49,21,5,3,2,22,23,2,16,0,0,0,11,8,0,0,21,7,6,131,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,131,26],
[12,7,14,20,0,1,0,80,1,-1,9,0,7,6,1,7,6,4,7,12,7,14,20,0,8,0,0,7,1,1,50,2,-1,0,8,9,1,7,6,21,7,11,42,21,22,2,3,6,132,3,38,0,8,9,1,7,6,21,7,11,130,21,22,2,3,9,0,3,27,0,8,9,1,7,6,21,7,11,33,21,22,7,0,10,9,0,7,6,21,7,6,4,7,11,11,21,22,7,6,4,7,10,0,21,5,3,3,22,23,3,16,0,0,0,11,8,0,0,21,7,6,25,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,5,3,2,22,16,0,0,0,11,8,0,0,21,7,6,133,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,133,26],
[12,7,14,20,0,8,0,0,7,1,1,129,3,2,0,8,9,0,7,6,21,7,11,66,21,22,2,10,0,8,9,0,7,6,21,7,11,28,21,22,3,2,12,2,19,9,2,7,14,8,0,0,2,3,8,0,0,3,10,9,1,7,14,8,0,0,2,3,8,0,0,3,2,12,15,2,2,15,2,2,3,2,12,7,14,8,0,0,2,3,8,0,0,3,14,9,2,2,3,9,1,3,2,12,7,14,8,0,0,2,3,8,0,0,3,2,12,15,2,2,15,2,2,2,67,0,8,9,2,7,6,21,7,11,28,21,22,7,0,49,0,8,9,1,7,6,21,7,11,28,21,22,7,0,33,0,8,9,2,7,6,21,7,11,33,21,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,0,8,9,0,7,6,21,7,11,28,21,22,7,6,14,7,10,0,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,4,22,3,2,12,23,4,16,0,0,0,11,8,0,0,21,7,6,134,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,134,26],
[12,7,14,20,0,1,0,20,1,-1,0,10,9,0,7,13,7,6,4,7,11,135,21,22,7,14,8,0,0,2,3,8,0,0,3,2,9,0,15,2,2,23,2,16,0,0,0,11,8,0,0,21,7,6,136,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,136,26],
[12,7,14,20,0,1,0,82,1,-1,0,17,0,8,9,0,7,6,21,7,11,53,21,22,7,6,49,7,6,4,7,11,30,21,22,2,24,0,22,0,6,6,1,7,11,19,21,22,7,0,8,9,0,7,6,21,7,11,28,21,22,7,6,4,7,11,115,21,22,3,2,12,7,14,8,0,0,2,33,0,15,0,8,8,0,0,7,6,21,7,11,137,21,22,7,6,21,7,11,138,21,22,7,0,8,9,0,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,5,3,4,22,3,2,9,0,15,2,2,23,2,16,0,0,0,11,8,0,0,21,7,6,139,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,139,26],
[12,7,14,20,0,8,0,0,7,1,1,836,2,-1,0,8,9,1,7,6,21,7,11,53,21,22,7,14,0,10,8,0,0,7,6,49,7,6,4,7,11,30,21,22,2,766,0,8,9,1,7,6,21,7,11,28,21,22,7,14,0,10,8,0,0,7,6,13,7,6,4,7,11,30,21,22,2,29,0,27,1,0,11,1,0,6,13,7,9,0,7,6,4,7,11,49,21,5,3,2,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,715,0,10,8,0,0,7,6,9,7,6,4,7,11,30,21,22,2,243,0,241,9,0,7,10,0,7,1,2,221,2,1,0,8,9,1,7,6,21,7,11,140,21,22,2,91,0,8,6,141,7,6,21,7,11,36,21,22,7,14,0,69,6,9,7,0,60,8,0,0,7,0,51,0,42,6,8,7,0,33,0,24,0,8,9,1,7,6,21,7,11,10,21,22,7,0,8,8,0,0,7,6,21,7,11,10,21,22,7,6,4,7,11,142,21,22,7,9,0,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,15,2,2,7,10,1,7,6,4,7,10,0,21,5,3,3,22,3,121,6,9,7,0,111,9,1,7,0,102,0,17,0,8,9,0,7,6,21,7,11,29,21,22,7,6,4,7,6,4,7,11,143,21,22,2,38,0,36,0,8,9,0,7,6,21,7,11,28,21,22,7,0,20,11,30,21,7,0,8,9,1,7,6,21,7,11,131,21,22,7,10,1,7,6,14,7,11,123,21,22,7,6,4,7,10,0,21,22,3,39,0,38,0,10,6,64,7,9,0,7,6,4,7,11,49,21,22,7,0,20,11,30,21,7,0,8,9,1,7,6,21,7,11,131,21,22,7,10,1,7,6,14,7,11,123,21,22,7,6,4,7,10,0,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,3,22,23,3,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,462,0,10,8,0,0,7,6,8,7,6,4,7,11,30,21,22,2,315,0,313,9,0,7,10,0,7,1,2,293,2,1,0,8,9,1,7,6,21,7,11,27,21,22,7,14,0,11,11,28,21,7,8,0,0,7,6,4,7,11,51,21,22,7,14,0,8,8,0,0,7,6,21,7,11,140,21,22,2,107,0,11,11,32,21,7,8,1,0,7,6,4,7,11,51,21,22,7,14,0,16,1,0,7,1,-1,6,1,7,11,36,21,5,1,2,22,7,8,0,0,7,6,4,7,11,51,21,22,7,14,0,73,0,64,6,8,7,0,55,0,10,8,0,0,7,8,1,0,7,6,4,7,11,134,21,22,7,0,37,0,28,6,8,7,0,19,0,10,8,2,0,7,8,0,0,7,6,4,7,11,142,21,22,7,9,0,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,10,1,7,6,4,7,10,0,21,22,15,4,2,3,153,6,8,7,0,143,0,47,10,1,7,10,0,7,1,2,34,1,-1,0,8,9,0,7,6,21,7,11,28,21,22,7,0,17,0,8,9,0,7,6,21,7,11,32,21,22,7,10,1,7,6,4,7,10,0,21,22,7,6,4,7,11,10,21,5,3,2,22,7,8,1,0,7,6,4,7,11,126,21,22,7,0,88,0,17,0,8,9,0,7,6,21,7,11,29,21,22,7,6,4,7,6,4,7,11,143,21,22,2,31,0,29,0,8,9,0,7,6,21,7,11,28,21,22,7,0,13,11,30,21,7,8,0,0,7,10,1,7,6,14,7,11,123,21,22,7,6,4,7,10,0,21,22,3,32,0,31,0,10,6,64,7,9,0,7,6,4,7,11,49,21,22,7,0,13,11,30,21,7,8,0,0,7,10,1,7,6,14,7,11,123,21,22,7,6,4,7,10,0,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,7,22,15,4,2,23,3,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,137,0,8,9,1,7,6,21,7,11,28,21,22,7,14,0,17,0,8,8,0,0,7,6,21,7,11,53,21,22,7,6,111,7,6,4,7,11,30,21,22,2,37,0,17,0,10,8,0,0,7,9,0,7,6,4,7,11,121,21,22,7,6,21,7,11,42,21,22,2,17,0,15,0,6,6,1,7,11,19,21,22,7,8,0,0,7,6,4,7,11,115,21,22,3,2,12,3,2,12,15,2,2,7,14,8,0,0,2,42,0,40,0,31,0,15,0,8,8,0,0,7,6,21,7,11,137,21,22,7,6,21,7,11,138,21,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,7,9,0,7,6,4,7,10,0,21,22,3,25,0,24,9,0,7,10,0,7,1,2,11,1,-1,9,0,7,10,1,7,6,4,7,10,0,21,5,3,2,22,7,9,1,7,6,4,7,11,51,21,22,15,2,2,15,2,2,3,48,0,10,8,0,0,7,6,111,7,6,4,7,11,30,21,22,2,36,0,8,9,1,7,6,21,7,11,136,21,22,7,14,0,10,8,0,0,7,9,1,7,6,4,7,11,30,21,22,2,3,9,1,3,11,0,10,8,0,0,7,9,0,7,6,4,7,10,0,21,22,15,2,2,3,2,9,1,15,2,2,23,3,16,0,0,0,11,8,0,0,21,7,6,144,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,144,26],
[12,7,14,20,0,1,0,11,2,1,9,1,7,9,0,7,6,4,7,11,144,21,5,3,3,22,16,0,0,0,11,8,0,0,21,7,6,145,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,145,26],
[12,7,14,20,0,8,0,0,7,1,1,329,2,-1,9,1,2,325,0,8,9,1,7,6,21,7,11,53,21,22,7,14,0,10,8,0,0,7,6,111,7,6,4,7,11,30,21,22,2,21,0,19,9,1,7,0,10,9,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,3,282,0,10,8,0,0,7,6,49,7,6,4,7,11,30,21,22,2,254,0,15,0,8,9,1,7,6,21,7,11,28,21,22,7,6,21,7,11,66,21,22,2,19,0,17,0,8,9,1,7,6,21,7,11,146,21,22,7,6,147,7,6,4,7,11,30,21,22,3,2,12,2,125,0,123,0,8,9,1,7,6,21,7,11,148,21,22,7,0,107,0,98,6,34,7,0,89,0,19,6,66,7,0,10,9,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,0,62,0,19,6,28,7,0,10,9,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,0,35,0,15,0,8,9,1,7,6,21,7,11,149,21,22,7,6,21,7,11,66,21,22,2,10,0,8,9,1,7,6,21,7,11,150,21,22,3,2,12,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,3,36,0,35,0,8,9,1,7,6,21,7,11,28,21,22,7,0,19,6,28,7,0,10,9,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,10,0,21,22,7,14,0,8,8,0,0,7,6,21,7,11,28,21,22,7,14,0,44,8,1,0,7,0,35,0,8,9,1,7,6,21,7,11,33,21,22,7,0,19,6,33,7,0,10,9,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,10,0,21,22,7,6,4,7,11,11,21,22,15,4,2,3,18,0,17,0,10,6,151,7,9,1,7,6,4,7,11,11,21,22,7,6,21,7,11,58,21,22,15,2,2,3,2,12,23,3,16,0,0,0,11,8,0,0,21,7,6,152,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,152,26],
[12,7,14,20,0,1,0,56,2,-1,1,0,25,1,-1,0,8,9,0,7,6,21,7,11,28,21,22,7,0,8,9,0,7,6,21,7,11,32,21,22,7,6,4,7,11,152,21,5,3,2,22,7,0,22,1,0,11,2,-1,9,1,7,9,0,7,6,4,7,11,10,21,5,3,3,22,7,9,1,7,9,0,7,6,14,7,11,125,21,22,7,6,4,7,11,126,21,5,3,3,22,16,0,0,0,11,8,0,0,21,7,6,142,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,142,26],
[12,7,14,20,0,8,0,0,7,1,1,82,1,-1,0,8,9,0,7,6,21,7,11,66,21,22,2,26,0,24,0,15,0,8,9,0,7,6,21,7,11,28,21,22,7,6,21,7,11,53,21,22,7,6,111,7,6,4,7,11,30,21,22,3,2,12,2,17,0,8,9,0,7,6,21,7,11,33,21,22,7,6,21,7,10,0,21,5,2,2,22,3,29,9,0,2,26,0,17,0,8,9,0,7,6,21,7,11,53,21,22,7,6,111,7,6,4,7,11,30,21,22,7,6,21,7,11,42,21,5,2,2,22,3,2,12,23,2,16,0,0,0,11,8,0,0,21,7,6,140,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,140,26],
[12,7,14,20,0,8,0,0,7,1,1,157,1,-1,9,0,2,153,0,8,9,0,7,6,21,7,11,53,21,22,7,14,0,10,8,0,0,7,6,111,7,6,4,7,11,30,21,22,2,10,0,8,9,0,7,6,21,7,11,10,21,22,3,121,0,10,8,0,0,7,6,49,7,6,4,7,11,30,21,22,2,93,0,8,9,0,7,6,21,7,11,28,21,22,7,14,0,8,8,0,0,7,6,21,7,11,66,21,22,2,19,0,17,0,8,8,0,0,7,6,21,7,11,28,21,22,7,6,147,7,6,4,7,11,30,21,22,3,2,12,2,17,0,15,0,8,8,0,0,7,6,21,7,11,32,21,22,7,6,21,7,11,10,21,22,3,9,0,8,8,0,0,7,6,21,7,10,0,21,22,15,2,2,7,14,0,24,0,15,0,8,9,0,7,6,21,7,11,33,21,22,7,6,21,7,10,0,21,22,7,8,0,0,7,6,4,7,11,11,21,22,15,2,2,3,18,0,17,0,10,6,151,7,9,0,7,6,4,7,11,11,21,22,7,6,21,7,11,58,21,22,15,2,2,3,2,12,23,2,16,0,0,0,11,8,0,0,21,7,6,153,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,153,26],
[12,7,14,20,0,8,0,0,7,1,1,71,4,-1,9,2,2,67,0,8,9,2,7,6,21,7,11,28,21,22,7,14,0,10,9,3,7,8,0,0,7,6,4,7,11,154,21,22,7,14,8,0,0,2,11,0,9,9,1,7,8,0,0,7,6,4,7,9,0,22,3,31,0,30,9,3,7,0,8,9,2,7,6,21,7,11,33,21,22,7,0,10,6,21,7,9,1,7,6,4,7,11,11,21,22,7,9,0,7,6,17,7,10,0,21,22,15,4,2,3,2,12,23,5,16,0,0,0,11,8,0,0,21,7,6,155,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,155,26],
[12,7,14,20,0,1,0,97,7,-1,0,21,9,6,7,0,8,9,5,7,6,21,7,11,28,21,22,7,6,1,7,9,3,7,6,17,7,11,155,21,22,7,14,8,0,0,2,3,8,0,0,3,68,0,17,9,6,7,0,8,9,5,7,6,21,7,11,32,21,22,7,6,4,7,11,154,21,22,7,14,8,0,0,2,9,0,7,8,0,0,7,6,21,7,9,2,22,3,38,0,17,9,6,7,0,8,9,5,7,6,21,7,11,43,21,22,7,6,4,7,11,154,21,22,7,14,8,0,0,2,9,0,7,8,0,0,7,6,21,7,9,1,22,3,8,0,7,9,6,7,6,21,7,9,0,22,15,2,2,15,2,2,15,2,2,23,8,16,0,0,0,11,8,0,0,21,7,6,156,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,156,26],
[12,7,14,20,0,1,0,235,3,-1,9,2,7,9,1,7,9,0,7,9,0,7,1,1,38,2,-1,6,157,7,0,28,9,1,7,0,19,9,0,7,0,10,10,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,3,22,7,9,0,7,1,1,29,1,-1,6,158,7,0,19,9,0,7,0,10,10,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,2,22,7,9,0,7,1,1,29,1,-1,6,159,7,0,19,9,0,7,0,10,10,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,2,22,7,9,0,7,1,1,114,1,-1,9,0,7,14,0,10,8,0,0,7,12,7,6,4,7,11,30,21,22,2,21,6,160,7,0,10,10,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,4,22,3,78,0,10,8,0,0,7,13,7,6,4,7,11,30,21,22,2,21,6,161,7,0,10,10,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,4,22,3,47,6,162,7,0,37,9,0,7,0,28,0,19,6,137,7,0,10,10,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,4,22,15,2,2,23,2,7,6,163,7,11,156,21,5,8,4,22,16,0,0,0,11,8,0,0,21,7,6,164,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,164,26],
[12,7,14,20,0,8,0,0,7,1,1,661,2,-1,0,8,9,1,7,6,21,7,11,53,21,22,7,14,0,10,8,0,0,7,6,111,7,6,4,7,11,30,21,22,2,30,0,17,0,10,9,1,7,9,0,7,6,4,7,11,121,21,22,7,6,21,7,11,42,21,22,2,10,9,1,7,6,21,7,11,10,21,5,2,5,22,3,2,12,3,609,0,10,8,0,0,7,6,49,7,6,4,7,11,30,21,22,2,597,0,8,9,1,7,6,21,7,11,28,21,22,7,14,0,10,8,0,0,7,6,13,7,6,4,7,11,30,21,22,2,21,0,19,1,0,3,1,0,12,23,2,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,554,0,10,8,0,0,7,6,9,7,6,4,7,11,30,21,22,2,52,0,50,9,0,7,10,0,7,1,2,30,2,-1,9,0,7,0,20,11,30,21,7,0,8,9,1,7,6,21,7,11,131,21,22,7,10,1,7,6,14,7,11,123,21,22,7,6,4,7,10,0,21,5,3,3,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,492,0,10,8,0,0,7,6,8,7,6,4,7,11,30,21,22,2,133,0,131,9,0,7,10,0,7,1,2,111,2,-1,0,18,11,28,21,7,0,8,9,1,7,6,21,7,11,27,21,22,7,6,4,7,11,51,21,22,7,0,18,11,32,21,7,0,8,9,1,7,6,21,7,11,27,21,22,7,6,4,7,11,51,21,22,7,14,11,30,21,7,0,38,0,31,0,24,10,1,7,10,0,7,1,2,11,1,-1,9,0,7,10,1,7,6,4,7,10,0,21,5,3,2,22,7,8,0,0,7,6,4,7,11,51,21,22,7,6,21,7,11,165,21,22,7,6,21,7,11,166,21,22,7,0,22,9,0,7,0,13,11,30,21,7,8,0,1,7,10,1,7,6,14,7,11,123,21,22,7,6,4,7,10,0,21,22,7,6,14,7,11,123,21,5,4,6,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,349,0,10,8,0,0,7,6,64,7,6,4,7,11,30,21,22,2,61,0,59,9,0,7,10,0,7,1,2,39,1,0,0,31,0,24,10,1,7,10,0,7,1,2,11,1,-1,9,0,7,10,1,7,6,4,7,10,0,21,5,3,2,22,7,9,0,7,6,4,7,11,51,21,22,7,6,21,7,11,165,21,22,7,6,21,7,11,166,21,5,2,2,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,278,0,10,8,0,0,7,6,31,7,6,4,7,11,30,21,22,2,61,0,59,9,0,7,10,0,7,1,2,39,1,0,0,31,0,24,10,1,7,10,0,7,1,2,11,1,-1,9,0,7,10,1,7,6,4,7,10,0,21,5,3,2,22,7,9,0,7,6,4,7,11,51,21,22,7,6,21,7,11,165,21,22,7,6,21,7,11,166,21,5,2,2,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,207,0,10,8,0,0,7,6,7,7,6,4,7,11,30,21,22,2,72,0,70,10,0,7,9,0,7,1,2,50,2,-1,11,30,21,7,0,17,0,10,9,1,7,10,0,7,6,4,7,11,121,21,22,7,6,21,7,11,42,21,22,2,10,0,8,9,1,7,6,21,7,11,10,21,22,3,2,12,7,0,10,9,0,7,10,0,7,6,4,7,10,1,21,22,7,6,14,7,11,123,21,5,4,3,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,125,0,10,8,0,0,7,6,167,7,6,4,7,11,30,21,22,2,33,0,31,9,0,7,10,0,7,1,2,11,1,-1,9,0,7,10,1,7,6,4,7,10,0,21,5,3,2,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,82,0,10,8,0,0,7,6,95,7,6,4,7,11,30,21,22,2,33,0,31,9,0,7,10,0,7,1,2,11,1,-1,9,0,7,10,1,7,6,4,7,10,0,21,5,3,2,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,39,0,38,0,31,0,24,9,0,7,10,0,7,1,2,11,1,-1,9,0,7,10,1,7,6,4,7,10,0,21,5,3,2,22,7,9,1,7,6,4,7,11,51,21,22,7,6,21,7,11,165,21,22,7,6,21,7,11,166,21,22,15,2,2,3,2,12,15,2,2,23,3,16,0,0,0,11,8,0,0,21,7,6,168,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,168,26],
[12,7,14,20,0,8,0,0,7,1,1,608,2,-1,0,8,9,1,7,6,21,7,11,53,21,22,7,14,0,10,8,0,0,7,6,49,7,6,4,7,11,30,21,22,2,584,0,8,9,1,7,6,21,7,11,28,21,22,7,14,0,10,8,0,0,7,6,13,7,6,4,7,11,30,21,22,2,21,0,19,1,0,3,1,-1,12,23,2,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,541,0,10,8,0,0,7,6,9,7,6,4,7,11,30,21,22,2,49,0,47,9,0,7,10,0,7,1,2,27,2,-1,9,0,7,0,17,10,1,7,0,8,9,1,7,6,21,7,11,131,21,22,7,6,4,7,11,128,21,22,7,6,4,7,10,0,21,5,3,3,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,482,0,10,8,0,0,7,6,8,7,6,4,7,11,30,21,22,2,130,0,128,9,0,7,10,0,7,1,2,108,2,-1,0,18,11,28,21,7,0,8,9,1,7,6,21,7,11,27,21,22,7,6,4,7,11,51,21,22,7,0,18,11,32,21,7,0,8,9,1,7,6,21,7,11,27,21,22,7,6,4,7,11,51,21,22,7,14,11,30,21,7,0,38,0,31,0,24,10,1,7,10,0,7,1,2,11,1,-1,9,0,7,10,1,7,6,4,7,10,0,21,5,3,2,22,7,8,0,0,7,6,4,7,11,51,21,22,7,6,21,7,11,165,21,22,7,6,21,7,11,166,21,22,7,0,19,9,0,7,0,10,10,1,7,8,0,1,7,6,4,7,11,128,21,22,7,6,4,7,10,0,21,22,7,6,14,7,11,123,21,5,4,6,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,342,0,10,8,0,0,7,6,64,7,6,4,7,11,30,21,22,2,61,0,59,9,0,7,10,0,7,1,2,39,1,0,0,31,0,24,10,1,7,10,0,7,1,2,11,1,-1,9,0,7,10,1,7,6,4,7,10,0,21,5,3,2,22,7,9,0,7,6,4,7,11,51,21,22,7,6,21,7,11,165,21,22,7,6,21,7,11,166,21,5,2,2,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,271,0,10,8,0,0,7,6,31,7,6,4,7,11,30,21,22,2,61,0,59,9,0,7,10,0,7,1,2,39,1,0,0,31,0,24,10,1,7,10,0,7,1,2,11,1,-1,9,0,7,10,1,7,6,4,7,10,0,21,5,3,2,22,7,9,0,7,6,4,7,11,51,21,22,7,6,21,7,11,165,21,22,7,6,21,7,11,166,21,5,2,2,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,200,0,10,8,0,0,7,6,7,7,6,4,7,11,30,21,22,2,65,0,63,10,0,7,9,0,7,1,2,43,2,-1,11,30,21,7,0,10,9,1,7,10,0,7,6,4,7,11,121,21,22,2,10,0,8,9,1,7,6,21,7,11,10,21,22,3,2,12,7,0,10,9,0,7,10,0,7,6,4,7,10,1,21,22,7,6,14,7,11,123,21,5,4,3,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,125,0,10,8,0,0,7,6,167,7,6,4,7,11,30,21,22,2,33,0,31,9,0,7,10,0,7,1,2,11,1,-1,9,0,7,10,1,7,6,4,7,10,0,21,5,3,2,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,82,0,10,8,0,0,7,6,95,7,6,4,7,11,30,21,22,2,33,0,31,9,0,7,10,0,7,1,2,11,1,-1,9,0,7,10,1,7,6,4,7,10,0,21,5,3,2,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,39,0,38,0,31,0,24,9,0,7,10,0,7,1,2,11,1,-1,9,0,7,10,1,7,6,4,7,10,0,21,5,3,2,22,7,9,1,7,6,4,7,11,51,21,22,7,6,21,7,11,165,21,22,7,6,21,7,11,166,21,22,15,2,2,3,2,12,15,2,2,23,3,16,0,0,0,11,8,0,0,21,7,6,169,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,169,26],
[12,7,14,20,0,1,0,138,3,-1,9,1,7,6,1,7,6,4,7,12,7,14,20,0,9,0,7,8,0,0,7,9,2,7,1,3,104,2,-1,9,1,2,100,0,17,0,8,9,1,7,6,21,7,11,28,21,22,7,10,0,7,6,4,7,11,121,21,22,2,55,6,170,7,0,44,9,0,7,0,35,0,26,0,8,9,1,7,6,21,7,11,33,21,22,7,0,10,9,0,7,6,21,7,6,4,7,11,11,21,22,7,6,4,7,10,1,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,3,22,3,27,0,8,9,1,7,6,21,7,11,33,21,22,7,0,10,9,0,7,6,21,7,6,4,7,11,11,21,22,7,6,4,7,10,1,21,5,3,3,22,3,2,10,2,23,3,16,0,0,0,11,8,0,0,21,7,6,25,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,5,3,4,22,16,0,0,0,11,8,0,0,21,7,6,171,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,171,26],
[12,7,14,20,0,8,0,0,7,1,1,141,1,-1,0,17,0,8,9,0,7,6,21,7,11,28,21,22,7,6,172,7,6,4,7,11,30,21,22,2,17,0,8,9,0,7,6,21,7,11,32,21,22,7,6,21,7,10,0,21,5,2,2,22,3,106,0,17,0,8,9,0,7,6,21,7,11,28,21,22,7,6,173,7,6,4,7,11,30,21,22,2,10,9,0,7,6,21,7,11,32,21,5,2,2,22,3,79,0,17,0,8,9,0,7,6,21,7,11,28,21,22,7,6,174,7,6,4,7,11,30,21,22,2,26,0,24,0,15,0,8,9,0,7,6,21,7,11,175,21,22,7,6,21,7,11,146,21,22,7,6,173,7,6,4,7,11,30,21,22,3,2,12,2,33,0,8,9,0,7,6,21,7,11,32,21,22,7,0,15,0,8,9,0,7,6,21,7,11,175,21,22,7,6,21,7,11,148,21,22,7,6,4,7,11,11,21,5,3,2,22,3,2,12,23,2,16,0,0,0,11,8,0,0,21,7,6,176,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,176,26],
[12,7,14,20,0,1,0,129,2,-1,0,8,9,1,7,6,21,7,11,28,21,22,7,14,0,10,8,0,0,7,6,174,7,6,4,7,11,30,21,22,2,69,6,174,7,0,58,0,17,0,8,9,1,7,6,21,7,11,32,21,22,7,9,0,7,6,4,7,11,11,21,22,7,0,33,0,8,9,1,7,6,21,7,11,177,21,22,7,0,17,0,8,9,1,7,6,21,7,11,178,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,5,22,3,38,6,174,7,0,28,9,0,7,0,19,9,0,7,0,10,9,1,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,5,22,15,2,2,23,3,16,0,0,0,11,8,0,0,21,7,6,179,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,179,26],
[12,7,14,20,0,8,0,0,7,1,1,59,3,-1,0,8,9,2,7,6,21,7,11,42,21,22,2,3,9,0,3,47,0,8,9,2,7,6,21,7,11,33,21,22,7,9,1,7,0,28,0,8,9,2,7,6,21,7,11,28,21,22,7,9,1,7,0,10,6,180,7,9,0,7,6,4,7,11,10,21,22,7,6,14,7,11,164,21,22,7,6,14,7,10,0,21,5,4,4,22,23,4,16,0,0,0,11,8,0,0,21,7,6,181,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,181,26],
[12,7,14,20,0,1,0,111,2,-1,9,1,2,107,0,8,9,0,7,6,21,7,11,28,21,22,7,0,8,9,0,7,6,21,7,11,32,21,22,7,0,8,9,0,7,6,21,7,11,43,21,22,7,14,0,76,8,0,0,7,8,0,1,7,8,0,2,7,1,3,61,1,-1,0,17,9,0,7,0,8,10,0,7,6,21,7,11,165,21,22,7,6,4,7,11,121,21,22,7,14,8,0,0,2,3,8,0,0,3,36,0,10,9,0,7,10,1,7,6,4,7,11,121,21,22,7,14,8,0,0,2,3,8,0,0,3,19,0,10,9,0,7,10,2,7,6,4,7,11,121,21,22,7,14,8,0,0,2,3,8,0,0,3,2,12,15,2,2,15,2,2,15,2,2,23,2,7,9,1,7,6,4,7,11,127,21,22,15,4,4,3,2,12,23,3,16,0,0,0,11,8,0,0,21,7,6,182,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,182,26],
[12,7,14,20,0,8,0,0,7,1,1,2087,4,-1,0,8,9,3,7,6,21,7,11,53,21,22,7,14,0,10,8,0,0,7,6,111,7,6,4,7,11,30,21,22,2,45,9,3,7,9,2,7,0,10,9,3,7,9,1,7,6,4,7,11,121,21,22,2,21,0,19,6,137,7,0,10,9,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,3,2,9,0,7,6,14,7,11,164,21,5,4,7,22,3,2020,0,10,8,0,0,7,6,49,7,6,4,7,11,30,21,22,2,1919,0,8,9,3,7,6,21,7,11,28,21,22,7,14,0,10,8,0,0,7,6,13,7,6,4,7,11,30,21,22,2,112,0,110,9,0,7,1,1,92,1,-1,0,10,9,0,7,12,7,6,4,7,11,30,21,22,2,21,6,160,7,0,10,10,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,2,22,3,60,0,10,9,0,7,13,7,6,4,7,11,30,21,22,2,21,6,161,7,0,10,10,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,2,22,3,29,6,183,7,0,19,9,0,7,0,10,10,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,2,22,23,2,7,0,8,9,3,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,1785,0,10,8,0,0,7,6,9,7,6,4,7,11,30,21,22,2,272,0,270,9,0,7,9,1,7,10,0,7,9,2,7,1,4,246,2,-1,0,8,9,1,7,6,21,7,11,133,21,22,7,0,8,9,1,7,6,21,7,11,131,21,22,7,14,0,10,9,0,7,8,0,0,7,6,4,7,11,168,21,22,7,0,10,9,0,7,8,0,0,7,6,4,7,11,169,21,22,7,14,0,10,8,0,1,7,10,0,7,6,4,7,11,182,21,22,7,14,8,0,0,7,10,0,7,0,180,6,184,7,0,171,0,8,8,0,0,7,6,21,7,11,29,21,22,7,0,155,0,8,8,2,0,7,6,21,7,11,29,21,22,7,0,139,8,2,1,7,0,130,0,112,8,1,0,7,0,8,8,2,0,7,6,21,7,11,185,21,22,7,0,94,9,0,7,0,26,12,7,0,17,0,8,8,2,0,7,6,21,7,11,185,21,22,7,8,0,0,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,0,22,11,30,21,7,8,1,0,7,0,10,10,2,7,8,0,0,7,6,4,7,11,129,21,22,7,6,14,7,11,123,21,22,7,0,35,6,173,7,0,26,0,17,0,8,8,2,0,7,6,21,7,11,29,21,22,7,6,21,7,6,4,7,11,11,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,17,7,10,1,21,22,7,6,14,7,11,171,21,22,7,0,10,10,3,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,14,7,11,181,21,5,4,11,22,7,0,8,9,3,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,1503,0,10,8,0,0,7,6,8,7,6,4,7,11,30,21,22,2,350,0,348,9,0,7,9,1,7,9,2,7,10,0,7,1,4,324,2,-1,0,18,11,28,21,7,0,8,9,1,7,6,21,7,11,27,21,22,7,6,4,7,11,51,21,22,7,0,18,11,32,21,7,0,8,9,1,7,6,21,7,11,27,21,22,7,6,4,7,11,51,21,22,7,14,0,8,8,0,0,7,6,21,7,11,185,21,22,7,0,40,0,24,0,8,8,0,1,7,6,21,7,11,185,21,22,7,0,8,10,1,7,6,21,7,11,28,21,22,7,6,4,7,11,49,21,22,7,0,8,10,1,7,6,21,7,11,33,21,22,7,6,4,7,11,49,21,22,7,0,10,9,0,7,8,0,1,7,6,4,7,11,169,21,22,7,0,19,0,10,9,0,7,8,0,1,7,6,4,7,11,168,21,22,7,10,1,7,6,4,7,11,182,21,22,7,0,17,0,8,8,0,1,7,6,21,7,11,29,21,22,7,6,21,7,6,4,7,11,11,21,22,7,14,0,10,10,3,7,8,0,0,7,6,4,7,11,179,21,22,7,14,0,71,6,186,7,0,62,0,53,8,1,2,7,0,8,8,2,1,7,6,21,7,11,185,21,22,7,0,35,9,0,7,8,1,3,7,0,22,11,30,21,7,8,1,2,7,0,10,10,2,7,8,1,1,7,6,4,7,11,129,21,22,7,6,14,7,11,123,21,22,7,8,0,0,7,6,17,7,10,0,21,22,7,6,14,7,11,171,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,15,7,5,7,6,4,7,12,7,14,20,0,10,2,7,10,1,7,10,0,7,8,0,0,7,1,4,68,2,-1,0,8,9,1,7,6,21,7,11,42,21,22,2,3,9,0,3,56,0,8,9,1,7,6,21,7,11,33,21,22,7,0,39,0,8,9,1,7,6,21,7,11,28,21,22,7,10,2,7,10,3,7,0,19,6,180,7,0,10,9,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,17,7,10,1,21,22,7,6,4,7,10,0,21,5,3,3,22,23,3,16,0,0,0,11,8,0,0,21,7,6,25,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,5,3,6,22,7,0,8,9,3,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,1143,0,10,8,0,0,7,6,64,7,6,4,7,11,30,21,22,2,119,0,117,9,0,7,9,1,7,9,2,7,10,0,7,1,4,93,1,0,0,8,9,0,7,6,21,7,11,185,21,22,7,10,3,7,6,4,7,12,7,14,20,0,10,2,7,10,1,7,10,0,7,8,0,0,7,1,4,50,2,-1,0,8,9,1,7,6,21,7,11,42,21,22,2,3,9,0,3,38,0,8,9,1,7,6,21,7,11,33,21,22,7,0,21,0,8,9,1,7,6,21,7,11,28,21,22,7,10,2,7,10,3,7,9,0,7,6,17,7,10,1,21,22,7,6,4,7,10,0,21,5,3,3,22,23,3,16,0,0,0,11,8,0,0,21,7,6,25,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,5,3,2,22,7,0,8,9,3,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,1014,0,10,8,0,0,7,6,31,7,6,4,7,11,30,21,22,2,144,0,142,9,0,7,9,1,7,9,2,7,10,0,7,1,4,118,3,-1,0,32,9,1,7,10,1,7,10,2,7,0,19,6,172,7,0,10,10,3,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,17,7,10,0,21,22,7,0,32,9,0,7,10,1,7,10,2,7,0,19,6,172,7,0,10,10,3,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,17,7,10,0,21,22,7,14,9,2,7,10,1,7,10,2,7,0,37,6,187,7,0,28,8,0,1,7,0,19,8,0,0,7,0,10,10,3,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,17,7,10,0,21,5,5,7,22,7,0,8,9,3,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,860,0,10,8,0,0,7,6,7,7,6,4,7,11,30,21,22,2,260,0,258,9,1,7,10,0,7,9,0,7,9,2,7,1,4,234,2,-1,9,1,7,10,0,7,10,1,7,10,1,7,10,3,7,10,0,7,9,0,7,10,2,7,1,5,51,2,-1,10,1,7,10,2,7,10,3,7,0,37,6,188,7,0,28,9,1,7,0,19,9,0,7,0,10,10,4,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,17,7,10,0,21,5,5,3,22,7,10,1,7,10,3,7,10,0,7,9,0,7,10,2,7,1,5,42,1,-1,10,1,7,10,2,7,10,3,7,0,28,6,189,7,0,19,9,0,7,0,10,10,4,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,17,7,10,0,21,5,5,2,22,7,10,1,7,10,3,7,10,0,7,9,0,7,10,2,7,1,5,42,1,-1,10,1,7,10,2,7,10,3,7,0,28,6,190,7,0,19,9,0,7,0,10,10,4,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,17,7,10,0,21,5,5,2,22,7,10,1,7,10,3,7,10,0,7,9,0,7,10,2,7,1,5,42,1,-1,10,1,7,10,2,7,10,3,7,0,28,6,191,7,0,19,9,0,7,0,10,10,4,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,17,7,10,0,21,5,5,2,22,7,6,163,7,11,156,21,5,8,3,22,7,0,8,9,3,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,590,0,10,8,0,0,7,6,167,7,6,4,7,11,30,21,22,2,238,0,236,9,0,7,9,1,7,9,2,7,10,0,7,1,4,212,1,-1,10,2,7,10,1,7,9,0,7,10,0,7,1,4,145,1,-1,6,192,7,0,135,9,0,7,0,126,0,117,6,180,7,0,108,0,99,6,183,7,0,90,6,21,7,0,81,0,72,6,180,7,0,63,0,54,10,1,7,10,2,7,10,3,7,0,10,6,1,7,9,0,7,6,4,7,11,143,21,22,2,30,0,28,6,193,7,0,19,6,4,7,0,10,9,0,7,6,194,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,3,2,6,195,7,6,17,7,10,0,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,2,22,7,14,0,8,10,3,7,6,21,7,11,176,21,22,7,14,8,0,0,2,9,8,0,0,7,6,21,7,8,1,0,5,2,6,22,3,35,6,196,7,0,25,10,3,7,0,16,0,7,6,1,7,6,21,7,8,1,0,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,6,22,15,4,2,23,2,7,0,8,9,3,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,342,0,10,8,0,0,7,6,95,7,6,4,7,11,30,21,22,2,59,0,57,9,0,7,9,1,7,9,2,7,10,0,7,1,4,33,1,-1,9,0,7,10,1,7,10,2,7,0,19,6,95,7,0,10,10,3,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,17,7,10,0,21,5,5,2,22,7,0,8,9,3,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,22,3,273,0,272,0,45,0,38,0,8,9,3,7,6,21,7,11,33,21,22,7,0,22,0,15,0,8,9,3,7,6,21,7,11,33,21,22,7,6,21,7,11,29,21,22,7,6,21,7,11,10,21,22,7,6,4,7,11,11,21,22,7,6,21,7,11,185,21,22,7,0,86,0,8,9,3,7,6,21,7,11,28,21,22,7,9,2,7,9,1,7,0,8,9,0,7,6,21,7,11,176,21,22,7,14,8,0,0,2,53,0,51,6,193,7,0,42,0,24,0,15,0,8,9,3,7,6,21,7,11,33,21,22,7,6,21,7,11,29,21,22,7,6,21,7,6,4,7,11,11,21,22,7,0,10,8,0,0,7,6,194,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,3,2,6,195,15,2,2,7,6,17,7,10,0,21,22,7,6,4,7,12,7,14,20,0,9,1,7,9,2,7,10,0,7,8,0,0,7,9,0,7,1,5,106,2,-1,0,8,9,1,7,6,21,7,11,42,21,22,2,41,0,8,10,0,7,6,21,7,11,176,21,22,2,3,9,0,3,29,6,196,7,0,19,10,0,7,0,10,9,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,3,22,3,56,0,8,9,1,7,6,21,7,11,33,21,22,7,0,39,0,8,9,1,7,6,21,7,11,28,21,22,7,10,3,7,10,4,7,0,19,6,180,7,0,10,9,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,17,7,10,2,21,22,7,6,4,7,10,1,21,5,3,3,22,23,3,16,0,0,0,11,8,0,0,21,7,6,25,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,22,15,2,2,3,91,0,10,9,3,7,12,7,6,4,7,11,30,21,22,2,21,6,160,7,0,10,9,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,7,22,3,60,0,10,9,3,7,13,7,6,4,7,11,30,21,22,2,21,6,161,7,0,10,9,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,7,22,3,29,6,183,7,0,19,9,3,7,0,10,9,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,5,3,7,22,15,2,2,23,5,16,0,0,0,11,8,0,0,21,7,6,197,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,197,26],
[12,7,14,20,0,8,0,0,7,1,1,2098,2,-1,0,8,9,1,7,6,21,7,11,28,21,22,7,14,0,10,8,0,0,7,6,196,7,6,4,7,11,30,21,22,2,124,9,0,7,10,0,7,1,2,102,2,-1,0,19,9,0,7,0,10,10,1,7,6,21,7,6,4,7,11,11,21,22,7,6,4,7,10,0,21,22,7,14,0,35,6,196,7,0,26,0,17,0,8,8,0,0,7,6,21,7,11,29,21,22,7,6,21,7,6,4,7,11,11,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,0,37,8,0,0,7,0,28,9,1,7,0,19,10,1,7,0,8,8,0,0,7,6,21,7,11,29,21,22,7,6,21,7,6,14,7,11,11,21,22,7,6,4,7,10,0,21,22,7,6,4,7,11,11,21,22,7,6,4,7,11,49,21,5,3,5,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,5,3,5,22,3,1952,0,10,8,0,0,7,6,184,7,6,4,7,11,30,21,22,2,151,9,0,7,10,0,7,1,2,129,5,-1,0,19,9,1,7,0,10,10,1,7,6,21,7,6,4,7,11,11,21,22,7,6,4,7,10,0,21,22,7,14,0,62,6,184,7,0,53,9,4,7,0,44,0,17,0,8,8,0,0,7,6,21,7,11,29,21,22,7,6,21,7,6,4,7,11,11,21,22,7,0,19,9,3,7,0,10,9,2,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,0,37,8,0,0,7,0,28,9,0,7,0,19,10,1,7,0,8,8,0,0,7,6,21,7,11,29,21,22,7,6,21,7,6,14,7,11,11,21,22,7,6,4,7,10,0,21,22,7,6,4,7,11,11,21,22,7,6,4,7,11,49,21,5,3,8,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,5,3,5,22,3,1791,0,10,8,0,0,7,6,187,7,6,4,7,11,30,21,22,2,200,9,0,7,10,0,7,1,2,178,3,-1,0,19,9,2,7,0,10,10,1,7,6,21,7,6,4,7,11,11,21,22,7,6,4,7,10,0,21,22,7,14,0,8,8,0,0,7,6,21,7,11,29,21,22,7,14,0,21,9,1,7,0,12,10,1,7,8,0,0,7,6,4,7,6,14,7,11,11,21,22,7,6,4,7,10,0,21,22,7,14,0,8,8,0,0,7,6,21,7,11,29,21,22,7,14,0,28,6,187,7,0,19,0,10,8,2,0,7,6,4,7,6,4,7,11,11,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,0,77,8,3,0,7,0,68,0,28,6,198,7,0,19,0,10,8,0,0,7,6,21,7,6,4,7,11,11,21,22,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,0,32,8,1,0,7,0,23,9,0,7,0,14,10,1,7,8,2,0,7,8,0,0,7,6,4,7,6,17,7,11,11,21,22,7,6,4,7,10,0,21,22,7,6,4,7,11,11,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,11,21,22,7,6,4,7,11,49,21,5,3,12,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,5,3,5,22,3,1581,0,10,8,0,0,7,6,192,7,6,4,7,11,30,21,22,2,69,9,0,7,10,0,7,1,2,47,2,-1,0,19,6,192,7,0,10,9,1,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,0,19,9,0,7,0,10,10,1,7,6,21,7,6,4,7,11,11,21,22,7,6,4,7,10,0,21,22,7,6,4,7,11,49,21,5,3,3,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,5,3,5,22,3,1502,0,10,8,0,0,7,6,193,7,6,4,7,11,30,21,22,2,78,9,0,7,10,0,7,1,2,56,3,-1,0,28,6,193,7,0,19,9,2,7,0,10,9,1,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,0,19,9,0,7,0,10,10,1,7,6,21,7,6,4,7,11,11,21,22,7,6,4,7,10,0,21,22,7,6,4,7,11,49,21,5,3,4,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,5,3,5,22,3,1414,0,10,8,0,0,7,6,183,7,6,4,7,11,30,21,22,2,69,9,0,7,10,0,7,1,2,47,2,-1,0,19,6,183,7,0,10,9,1,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,0,19,9,0,7,0,10,10,1,7,6,21,7,6,4,7,11,11,21,22,7,6,4,7,10,0,21,22,7,6,4,7,11,49,21,5,3,3,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,5,3,5,22,3,1335,0,10,8,0,0,7,6,180,7,6,4,7,11,30,21,22,2,51,9,0,7,10,0,7,1,2,29,1,-1,6,199,7,0,19,9,0,7,0,10,10,1,7,6,21,7,6,4,7,11,11,21,22,7,6,4,7,10,0,21,22,7,6,4,7,11,49,21,5,3,2,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,5,3,5,22,3,1274,0,10,8,0,0,7,6,157,7,6,4,7,11,30,21,22,2,78,9,0,7,10,0,7,1,2,56,3,-1,0,28,6,157,7,0,19,9,2,7,0,10,9,1,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,0,19,9,0,7,0,10,10,1,7,6,21,7,6,4,7,11,11,21,22,7,6,4,7,10,0,21,22,7,6,4,7,11,49,21,5,3,4,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,5,3,5,22,3,1186,0,10,8,0,0,7,6,158,7,6,4,7,11,30,21,22,2,69,9,0,7,10,0,7,1,2,47,2,-1,0,19,6,158,7,0,10,9,1,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,0,19,9,0,7,0,10,10,1,7,6,21,7,6,4,7,11,11,21,22,7,6,4,7,10,0,21,22,7,6,4,7,11,49,21,5,3,3,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,5,3,5,22,3,1107,0,10,8,0,0,7,6,159,7,6,4,7,11,30,21,22,2,69,9,0,7,10,0,7,1,2,47,2,-1,0,19,6,159,7,0,10,9,1,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,0,19,9,0,7,0,10,10,1,7,6,21,7,6,4,7,11,11,21,22,7,6,4,7,10,0,21,22,7,6,4,7,11,49,21,5,3,3,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,5,3,5,22,3,1028,0,10,8,0,0,7,6,162,7,6,4,7,11,30,21,22,2,69,9,0,7,10,0,7,1,2,47,2,-1,0,19,6,162,7,0,10,9,1,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,0,19,9,0,7,0,10,10,1,7,6,21,7,6,4,7,11,11,21,22,7,6,4,7,10,0,21,22,7,6,4,7,11,49,21,5,3,3,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,5,3,5,22,3,949,0,10,8,0,0,7,6,160,7,6,4,7,11,30,21,22,2,51,9,0,7,10,0,7,1,2,29,1,-1,6,200,7,0,19,9,0,7,0,10,10,1,7,6,21,7,6,4,7,11,11,21,22,7,6,4,7,10,0,21,22,7,6,4,7,11,49,21,5,3,2,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,5,3,5,22,3,888,0,10,8,0,0,7,6,161,7,6,4,7,11,30,21,22,2,51,9,0,7,10,0,7,1,2,29,1,-1,6,201,7,0,19,9,0,7,0,10,10,1,7,6,21,7,6,4,7,11,11,21,22,7,6,4,7,10,0,21,22,7,6,4,7,11,49,21,5,3,2,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,5,3,5,22,3,827,0,10,8,0,0,7,6,186,7,6,4,7,11,30,21,22,2,51,9,0,7,10,0,7,1,2,29,1,-1,6,202,7,0,19,9,0,7,0,10,10,1,7,6,21,7,6,4,7,11,11,21,22,7,6,4,7,10,0,21,22,7,6,4,7,11,49,21,5,3,2,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,5,3,5,22,3,766,0,10,8,0,0,7,6,174,7,6,4,7,11,30,21,22,2,78,9,0,7,10,0,7,1,2,56,3,-1,0,28,6,174,7,0,19,9,2,7,0,10,9,1,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,0,19,9,0,7,0,10,10,1,7,6,21,7,6,4,7,11,11,21,22,7,6,4,7,10,0,21,22,7,6,4,7,11,49,21,5,3,4,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,5,3,5,22,3,678,0,10,8,0,0,7,6,188,7,6,4,7,11,30,21,22,2,78,9,0,7,10,0,7,1,2,56,3,-1,0,28,6,188,7,0,19,9,2,7,0,10,9,1,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,0,19,9,0,7,0,10,10,1,7,6,21,7,6,4,7,11,11,21,22,7,6,4,7,10,0,21,22,7,6,4,7,11,49,21,5,3,4,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,5,3,5,22,3,590,0,10,8,0,0,7,6,189,7,6,4,7,11,30,21,22,2,69,9,0,7,10,0,7,1,2,47,2,-1,0,19,6,189,7,0,10,9,1,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,0,19,9,0,7,0,10,10,1,7,6,21,7,6,4,7,11,11,21,22,7,6,4,7,10,0,21,22,7,6,4,7,11,49,21,5,3,3,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,5,3,5,22,3,511,0,10,8,0,0,7,6,190,7,6,4,7,11,30,21,22,2,69,9,0,7,10,0,7,1,2,47,2,-1,0,19,6,190,7,0,10,9,1,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,0,19,9,0,7,0,10,10,1,7,6,21,7,6,4,7,11,11,21,22,7,6,4,7,10,0,21,22,7,6,4,7,11,49,21,5,3,3,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,5,3,5,22,3,432,0,10,8,0,0,7,6,191,7,6,4,7,11,30,21,22,2,69,9,0,7,10,0,7,1,2,47,2,-1,0,19,6,191,7,0,10,9,1,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,0,19,9,0,7,0,10,10,1,7,6,21,7,6,4,7,11,11,21,22,7,6,4,7,10,0,21,22,7,6,4,7,11,49,21,5,3,3,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,5,3,5,22,3,353,0,10,8,0,0,7,6,95,7,6,4,7,11,30,21,22,2,51,9,0,7,10,0,7,1,2,29,1,-1,6,203,7,0,19,9,0,7,0,10,10,1,7,6,21,7,6,4,7,11,11,21,22,7,6,4,7,10,0,21,22,7,6,4,7,11,49,21,5,3,2,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,5,3,5,22,3,292,0,10,8,0,0,7,6,170,7,6,4,7,11,30,21,22,2,69,9,0,7,10,0,7,1,2,47,2,-1,0,19,6,170,7,0,10,9,1,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,0,19,9,0,7,0,10,10,1,7,6,21,7,6,4,7,11,11,21,22,7,6,4,7,10,0,21,22,7,6,4,7,11,49,21,5,3,3,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,5,3,5,22,3,213,0,10,8,0,0,7,6,137,7,6,4,7,11,30,21,22,2,51,9,0,7,10,0,7,1,2,29,1,-1,6,204,7,0,19,9,0,7,0,10,10,1,7,6,21,7,6,4,7,11,11,21,22,7,6,4,7,10,0,21,22,7,6,4,7,11,49,21,5,3,2,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,5,3,5,22,3,152,0,10,8,0,0,7,6,50,7,6,4,7,11,30,21,22,2,21,1,0,3,0,-1,6,194,23,1,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,5,3,5,22,3,121,0,10,8,0,0,7,6,173,7,6,4,7,11,30,21,22,2,47,1,0,29,1,-1,0,19,6,173,7,0,10,9,0,7,12,7,6,4,7,11,49,21,22,7,6,4,7,11,49,21,22,7,12,7,6,4,7,11,49,21,5,3,2,22,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,5,3,5,22,3,64,0,10,8,0,0,7,6,205,7,6,4,7,11,30,21,22,2,21,1,0,3,0,-1,6,206,23,1,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,5,3,5,22,3,33,0,10,8,0,0,7,6,172,7,6,4,7,11,30,21,22,2,21,1,0,3,1,-1,12,23,2,7,0,8,9,1,7,6,21,7,11,33,21,22,7,6,4,7,11,50,21,5,3,5,22,3,2,12,15,2,2,23,3,16,0,0,0,11,8,0,0,21,7,6,207,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,207,26],
[12,7,14,20,0,1,0,33,1,-1,0,23,0,10,9,0,7,12,7,6,4,7,11,144,21,22,7,12,7,12,7,6,208,7,6,17,7,11,197,21,22,7,6,1,7,6,4,7,11,207,21,5,3,2,22,16,0,0,0,11,8,0,0,21,7,6,209,7,6,4,7,11,12,21,22,8,0,0,21,15,2,2,19,209,26],
]);
preload_vals.push(["arc.core.compiler","0","***curr-ns***","(mac rfn afn if and or let def aif caselet case quasiquote map1 withs w/uniq compose complement defns export import defss namespace-ss compose-ss complement-ss sexp-ss sexp-with-quote-ss keyword-ss deftf cons-tf table-tf string-tf mem union map mappend keep set-minus set-intersect zip ssexpand macex1 macex compile)","2","***export***","mac","assign","with","fn","list","+","fn-name","quote","3","annotate","(quote mac)","4","collect-bounds-in-ns","***macros***","_","1","***cut-fn***","5","rfn","self","afn","%pair","car","len","is","%if","cadr","cdr","if","and","uniq","or","let","def","it","aif","no","cddr","caselet","case","-","firstn","nthcdr","cons","apply","map1","reccase","type","unquote","unquote-splicing","find-qq-eval","\"cannot use ,@ after .\"","err","quasiquote","expand-qq","qq-pair","\",@ cannot be used immediately after `\"","nrev","do","withs","acons","w/uniq","g","idfn","compose","complement","***defns***",":extend","s",":import","i",":export","e","\"The name \\\"\"","\"\\\" is not specified how to use.\"","defns","(***curr-ns***)","export","***import***","import","***special-syntax-order***","(quote special-syntax)","(assign ***special-syntax-order*** (+ ***special-syntax-order*** 1))","defss","special-syntax","\"^(.+?)::(.+)$\"","regex","orig","rt","ns","namespace-ss","\"^(.*[^:]):([^:].*)$\"","compose-ss","\"^\\\\~(.+)$\"","complement-ss","\"^(.*[^.])\\\\.([^.].*)$\"","sexp-ss","\"^(.+)\\\\!(.+)$\"","sexp-with-quote-ss","\"^:(.+)$\"","keyword","keyword-ss","string","coerce","\"-tf\"","sym","(quote type-fn)","deftf","type-fn","ref","cons-tf","table-tf","string-tf","isa","%mem","mem","%union","union","min","map","mappend","keep","set-minus","set-intersect","atom","dotted-to-proper","-1","dotted-pos","zip","ssyntax","ssexpand","indirect","rep","macex1","complex-args?","arg","complex-args","<","%macex","macex","caar","o","cadar","cddar","caddar","\"Can't understand vars list\"","%complex-args","complex-args-get-var","%pos","compile-lookup-let","compile-lookup","refer-let","refer-local","refer-free","refer-nil","refer-t","refer-global","7","compile-refer","flat","dedup","ccc","find-free","find-sets","box","make-boxes","ignore","return","exit-let","cdddr","tailp","caddr","cadddr","reduce-nest-exit","argument","collect-free","remove-globs","constant","close","rev","enter-let","test","assign-let","assign-local","assign-free","assign-global","conti","shift","((apply))","(apply)","frame","%compile","jump","(argument)","(refer-nil)","(refer-t)","(enter-let)","(ns)","(indirect)","halt","((halt))","preproc","(halt)","compile"]);
/** @} */
// arclib
/** @file arc.fasl { */
// This is an auto generated file.
// Compiled from ['src/arc/arc.arc'].
// DON'T EDIT !!!
preloads.push([
[6,0,25,26],
[12,7,14,20,0,1,0,198,1,0,0,8,9,0,7,6,1,7,11,2,21,22,7,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,4,21,22,2,17,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,3,3,11,5,21,7,14,0,11,8,0,0,7,11,5,21,7,6,6,7,11,7,21,22,2,10,8,0,1,7,6,1,7,11,8,21,5,2,5,22,3,130,8,0,1,7,8,0,0,7,6,6,7,12,7,14,20,0,8,0,0,7,1,1,100,2,-1,0,8,9,1,7,6,1,7,11,9,21,22,2,3,12,3,88,0,15,0,8,9,1,7,6,1,7,11,3,21,22,7,6,1,7,11,9,21,22,2,24,0,15,0,8,9,1,7,6,1,7,11,2,21,22,7,6,1,7,11,5,21,22,7,6,1,7,11,5,21,5,2,3,22,3,49,0,23,0,8,9,1,7,6,1,7,11,2,21,22,7,0,8,9,1,7,6,1,7,11,10,21,22,7,6,6,7,9,0,22,7,0,17,0,8,9,1,7,6,1,7,11,11,21,22,7,9,0,7,6,6,7,10,0,21,22,7,6,6,7,11,12,21,5,3,3,22,23,3,16,0,0,0,11,8,0,0,21,7,6,13,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,5,3,5,22,15,3,3,23,2,16,0,0,0,11,8,0,0,21,7,6,15,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,15,26],
[12,7,14,20,0,1,0,23,1,-1,0,17,0,8,9,0,7,6,1,7,11,16,21,22,7,6,17,7,6,6,7,11,7,21,22,2,3,13,3,2,12,23,2,16,0,0,0,11,8,0,0,21,7,6,18,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,18,26],
[1,0,29,1,-1,6,19,7,0,19,6,20,7,0,10,9,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,2,22,7,14,0,10,8,0,0,7,6,21,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,21,26],
[12,7,14,20,0,8,0,0,7,1,1,75,2,-1,0,8,9,0,7,6,1,7,11,24,21,22,2,3,12,3,63,0,15,0,8,9,0,7,6,1,7,11,2,21,22,7,6,1,7,11,4,21,22,2,19,0,17,0,8,9,0,7,6,1,7,11,25,21,22,7,9,1,7,6,6,7,11,7,21,22,3,2,12,2,10,9,0,7,6,1,7,11,2,21,5,2,3,22,3,18,9,1,7,0,8,9,0,7,6,1,7,11,3,21,22,7,6,6,7,10,0,21,5,3,3,22,23,3,16,0,0,0,11,8,0,0,21,7,6,26,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,26,26],
[12,7,14,20,0,1,0,18,2,-1,0,10,9,0,7,9,1,7,6,6,7,11,26,21,22,7,6,1,7,11,10,21,5,2,3,22,16,0,0,0,11,8,0,0,21,7,6,27,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,27,26],
[12,7,14,20,0,8,0,0,7,1,1,95,1,0,0,8,9,0,7,6,1,7,11,9,21,22,2,3,12,3,83,0,8,9,0,7,6,1,7,11,2,21,22,7,14,0,8,8,0,0,7,6,1,7,11,9,21,22,2,20,0,18,10,0,21,7,0,8,9,0,7,6,1,7,11,3,21,22,7,6,6,7,11,28,21,22,3,44,0,43,0,8,8,0,0,7,6,1,7,11,2,21,22,7,0,27,10,0,21,7,0,8,8,0,0,7,6,1,7,11,3,21,22,7,0,8,9,0,7,6,1,7,11,3,21,22,7,6,29,7,11,28,21,22,7,6,6,7,11,12,21,22,15,2,2,23,2,16,0,0,0,11,8,0,0,21,7,6,30,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,30,26],
[12,7,14,20,0,1,0,18,2,-1,0,10,9,1,7,9,0,7,6,6,7,11,7,21,22,7,6,1,7,11,9,21,5,2,3,22,16,0,0,0,11,8,0,0,21,7,6,31,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,31,26],
[12,7,14,20,0,1,0,42,1,-1,0,8,9,0,7,6,1,7,11,9,21,22,7,14,8,0,0,2,3,8,0,0,3,26,0,17,0,8,9,0,7,6,1,7,11,16,21,22,7,6,12,7,6,6,7,11,7,21,22,7,14,8,0,0,2,3,8,0,0,3,2,12,15,2,2,15,2,2,23,2,16,0,0,0,11,8,0,0,21,7,6,32,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,32,26],
[1,0,47,3,2,6,33,7,0,37,9,2,7,0,28,9,1,7,0,19,9,0,7,0,10,9,2,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,34,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,4,22,7,14,0,10,8,0,0,7,6,35,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,35,26],
[1,0,96,2,1,0,8,6,36,7,6,1,7,11,37,21,22,7,14,6,33,7,0,76,8,0,0,7,0,67,9,1,7,0,58,0,49,6,38,7,0,40,8,0,0,7,1,1,29,1,-1,6,7,7,0,19,10,0,7,0,10,9,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,2,22,7,9,0,7,6,6,7,11,39,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,5,22,7,14,0,10,8,0,0,7,6,40,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,40,26],
[12,7,14,20,0,8,0,0,7,1,1,100,2,-1,0,10,9,1,7,9,0,7,6,6,7,11,7,21,22,7,14,8,0,0,2,3,8,0,0,3,82,0,8,9,1,7,6,1,7,11,4,21,22,2,64,0,8,9,0,7,6,1,7,11,4,21,22,2,53,0,24,0,8,9,1,7,6,1,7,11,2,21,22,7,0,8,9,0,7,6,1,7,11,2,21,22,7,6,6,7,10,0,21,22,2,26,0,24,0,8,9,1,7,6,1,7,11,3,21,22,7,0,8,9,0,7,6,1,7,11,3,21,22,7,6,6,7,10,0,21,22,3,2,12,3,2,12,3,2,12,7,14,8,0,0,2,3,8,0,0,3,2,12,15,2,2,15,2,2,23,3,16,0,0,0,11,8,0,0,21,7,6,41,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,41,26],
[1,0,38,2,1,6,42,7,0,28,9,1,7,0,19,0,10,6,43,7,9,0,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,3,22,7,14,0,10,8,0,0,7,6,44,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,44,26],
[1,0,56,2,1,6,42,7,0,46,0,19,6,9,7,0,10,9,1,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,19,0,10,6,43,7,9,0,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,3,22,7,14,0,10,8,0,0,7,6,45,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,45,26],
[1,0,138,2,1,0,8,6,46,7,6,1,7,11,37,21,22,7,0,8,6,47,7,6,1,7,11,37,21,22,7,14,0,100,6,48,7,0,91,8,0,1,7,0,82,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,0,64,0,55,6,44,7,0,46,8,0,0,7,0,37,9,0,7,0,28,0,19,8,0,1,7,0,10,9,1,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,34,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,10,9,1,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,6,22,7,14,0,10,8,0,0,7,6,49,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,49,26],
[12,7,14,20,0,8,0,0,7,1,1,56,2,-1,9,0,2,52,0,7,9,0,7,6,1,7,9,1,22,7,14,8,0,0,2,3,8,0,0,3,37,0,8,9,0,7,6,1,7,11,4,21,22,2,19,0,17,9,1,7,0,8,9,0,7,6,1,7,11,3,21,22,7,6,6,7,10,0,21,22,3,2,12,7,14,8,0,0,2,3,8,0,0,3,2,12,15,2,2,15,2,2,3,2,12,23,3,16,0,0,0,11,8,0,0,21,7,6,50,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,50,26],
[12,7,14,20,0,1,0,169,1,0,0,8,9,0,7,6,1,7,11,2,21,22,7,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,4,21,22,2,24,0,22,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,3,2,6,51,7,14,8,0,0,7,0,8,8,0,1,7,6,1,7,11,52,21,22,7,6,6,7,12,7,14,20,0,8,0,0,7,8,1,2,7,1,2,56,2,-1,0,10,9,1,7,9,0,7,6,6,7,11,53,21,22,2,43,0,7,9,1,7,6,1,7,10,0,22,7,14,8,0,0,2,3,8,0,0,3,28,0,19,0,10,9,1,7,6,1,7,6,6,7,11,34,21,22,7,9,0,7,6,6,7,10,1,21,22,7,14,8,0,0,2,3,8,0,0,3,2,12,15,2,2,15,2,2,3,2,12,23,3,16,0,0,0,11,8,0,0,21,7,6,13,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,5,3,6,22,16,0,0,0,11,8,0,0,21,7,6,54,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,54,26],
[12,7,14,20,0,1,0,28,1,-1,0,10,9,0,7,6,19,7,6,6,7,11,55,21,22,2,3,9,0,3,14,9,0,7,1,1,11,1,-1,9,0,7,10,0,7,6,6,7,11,41,21,5,3,2,22,23,2,16,0,0,0,11,8,0,0,21,7,6,56,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,56,26],
[12,7,14,20,0,1,0,21,1,-1,0,8,9,0,7,6,1,7,11,24,21,22,2,3,9,0,3,9,9,0,7,6,1,7,11,2,21,5,2,2,22,23,2,16,0,0,0,11,8,0,0,21,7,6,57,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,57,26],
[12,7,14,20,0,1,0,82,2,-1,0,8,9,1,7,6,1,7,11,56,21,22,7,14,0,8,9,0,7,6,1,7,11,32,21,22,2,31,8,0,0,7,1,1,18,1,0,0,11,11,57,21,7,9,0,7,6,6,7,11,28,21,22,7,6,1,7,10,0,5,2,2,22,7,9,0,7,6,6,7,11,50,21,5,3,5,22,3,31,9,0,7,8,0,0,7,1,2,17,1,0,0,10,10,1,7,9,0,7,6,6,7,11,28,21,22,7,6,1,7,10,0,5,2,2,22,7,9,0,7,6,6,7,11,54,21,5,3,5,22,15,2,2,23,3,16,0,0,0,11,8,0,0,21,7,6,58,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,58,26],
[12,7,14,20,0,1,0,32,2,-1,0,15,0,8,9,1,7,6,1,7,11,56,21,22,7,6,1,7,11,59,21,22,7,9,0,7,6,6,7,0,9,11,58,21,7,6,1,7,11,59,21,22,5,3,3,22,16,0,0,0,11,8,0,0,21,7,6,60,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,60,26],
[12,7,14,20,0,1,0,125,2,-1,0,8,9,1,7,6,1,7,11,56,21,22,7,14,0,8,9,0,7,6,1,7,11,32,21,22,2,52,8,0,0,7,1,1,39,1,-1,0,26,9,0,7,6,1,7,10,0,7,1,1,18,1,0,0,11,11,57,21,7,9,0,7,6,6,7,11,28,21,22,7,6,1,7,10,0,5,2,2,22,22,2,10,9,0,7,6,1,7,11,57,21,5,2,2,22,3,2,12,23,2,7,9,0,7,6,6,7,11,50,21,5,3,5,22,3,53,9,0,7,8,0,0,7,1,2,39,1,-1,0,27,9,0,7,6,1,7,10,1,7,10,0,7,1,2,17,1,0,0,10,10,1,7,9,0,7,6,6,7,11,28,21,22,7,6,1,7,10,0,5,2,2,22,22,2,9,9,0,7,6,1,7,10,1,5,2,2,22,3,2,12,23,2,7,9,0,7,6,6,7,11,54,21,5,3,5,22,15,2,2,23,3,16,0,0,0,11,8,0,0,21,7,6,61,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,61,26],
[12,7,14,20,0,1,0,25,2,-1,0,17,9,1,7,0,8,9,0,7,6,1,7,11,62,21,22,7,6,6,7,11,63,21,22,7,6,1,7,11,62,21,5,2,3,22,16,0,0,0,11,8,0,0,21,7,6,64,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,64,26],
[12,7,14,20,0,8,0,0,7,1,1,152,1,0,0,8,9,0,7,6,1,7,11,2,21,22,7,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,4,21,22,2,17,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,3,2,6,6,7,0,22,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,4,21,22,2,24,0,22,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,3,2,12,7,14,0,8,8,0,2,7,6,1,7,11,9,21,22,2,10,8,0,0,7,6,1,7,11,62,21,5,2,6,22,3,40,0,10,8,0,1,7,8,0,2,7,6,6,7,11,65,21,22,7,8,0,1,7,0,19,0,10,8,0,1,7,8,0,2,7,6,6,7,11,63,21,22,7,8,0,0,7,6,6,7,11,12,21,22,7,6,29,7,10,0,21,5,4,6,22,15,4,4,23,2,16,0,0,0,11,8,0,0,21,7,6,66,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,66,26],
[1,0,39,1,0,6,43,7,0,29,1,0,11,1,-1,6,67,7,9,0,7,6,6,7,11,12,21,5,3,2,22,7,0,10,9,0,7,6,29,7,6,6,7,11,66,21,22,7,6,6,7,11,68,21,22,7,6,6,7,11,12,21,5,3,2,22,7,14,0,10,8,0,0,7,6,69,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,69,26],
[12,7,14,20,0,1,0,30,2,-1,0,8,9,1,7,6,1,7,11,4,21,22,2,19,0,8,9,1,7,6,1,7,11,2,21,22,7,9,0,7,6,6,7,11,7,21,5,3,3,22,3,2,12,23,3,16,0,0,0,11,8,0,0,21,7,6,70,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,70,26],
[12,7,14,20,0,1,0,57,2,1,0,19,0,12,6,71,7,9,1,7,6,72,7,6,29,7,11,34,21,22,7,6,1,7,11,73,21,22,0,26,1,0,17,1,-1,0,8,9,0,7,6,1,7,11,74,21,22,6,75,7,6,1,7,11,73,21,5,2,2,22,7,9,0,7,6,6,7,11,68,21,22,6,76,7,11,77,21,7,6,6,7,11,73,21,5,3,3,22,16,0,0,0,11,8,0,0,21,7,6,78,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,78,26],
[0,6,6,51,7,11,79,21,22,19,80,26],
[1,0,147,3,2,0,8,6,81,7,6,1,7,11,37,21,22,7,14,6,82,7,0,127,6,80,7,0,118,0,82,6,19,7,0,73,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,0,55,0,46,6,33,7,0,37,9,1,7,0,28,0,19,6,3,7,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,9,0,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,28,0,19,6,83,7,0,10,9,2,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,6,22,7,14,0,10,8,0,0,7,6,84,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,84,26],
[0,127,11,80,21,7,1,0,115,1,-1,0,8,9,0,7,6,1,7,11,3,21,22,7,14,0,8,8,0,0,7,6,1,7,11,2,21,22,7,14,0,8,6,36,7,6,1,7,11,37,21,22,7,14,0,10,8,0,0,7,8,1,0,7,6,6,7,11,5,21,22,7,0,19,6,2,7,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,46,6,19,7,0,37,6,85,7,0,28,0,19,6,86,7,0,10,8,0,0,7,6,85,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,29,7,11,5,21,5,4,8,22,7,6,2,7,6,29,7,11,82,21,22,26],
[0,127,11,80,21,7,1,0,115,1,-1,0,8,9,0,7,6,1,7,11,3,21,22,7,14,0,8,8,0,0,7,6,1,7,11,2,21,22,7,14,0,8,6,36,7,6,1,7,11,37,21,22,7,14,0,10,8,0,0,7,8,1,0,7,6,6,7,11,5,21,22,7,0,19,6,3,7,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,46,6,19,7,0,37,6,85,7,0,28,0,19,6,87,7,0,10,8,0,0,7,6,85,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,29,7,11,5,21,5,4,8,22,7,6,3,7,6,29,7,11,82,21,22,26],
[0,145,11,80,21,7,1,0,133,1,-1,0,8,9,0,7,6,1,7,11,3,21,22,7,14,0,8,8,0,0,7,6,1,7,11,2,21,22,7,14,0,8,6,36,7,6,1,7,11,37,21,22,7,14,0,10,8,0,0,7,8,1,0,7,6,6,7,11,5,21,22,7,0,19,6,25,7,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,64,6,19,7,0,55,6,85,7,0,46,0,37,6,86,7,0,28,0,19,6,2,7,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,85,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,29,7,11,5,21,5,4,8,22,7,6,25,7,6,29,7,11,82,21,22,26],
[0,145,11,80,21,7,1,0,133,1,-1,0,8,9,0,7,6,1,7,11,3,21,22,7,14,0,8,8,0,0,7,6,1,7,11,2,21,22,7,14,0,8,6,36,7,6,1,7,11,37,21,22,7,14,0,10,8,0,0,7,8,1,0,7,6,6,7,11,5,21,22,7,0,19,6,10,7,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,64,6,19,7,0,55,6,85,7,0,46,0,37,6,86,7,0,28,0,19,6,3,7,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,85,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,29,7,11,5,21,5,4,8,22,7,6,10,7,6,29,7,11,82,21,22,26],
[0,145,11,80,21,7,1,0,133,1,-1,0,8,9,0,7,6,1,7,11,3,21,22,7,14,0,8,8,0,0,7,6,1,7,11,2,21,22,7,14,0,8,6,36,7,6,1,7,11,37,21,22,7,14,0,10,8,0,0,7,8,1,0,7,6,6,7,11,5,21,22,7,0,19,6,11,7,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,64,6,19,7,0,55,6,85,7,0,46,0,37,6,87,7,0,28,0,19,6,3,7,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,85,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,29,7,11,5,21,5,4,8,22,7,6,11,7,6,29,7,11,82,21,22,26],
[12,7,14,20,0,8,0,0,7,1,1,521,1,-1,0,10,9,0,7,6,88,7,6,6,7,11,89,21,22,7,14,0,10,8,0,0,7,6,90,7,6,6,7,11,55,21,22,2,106,0,8,6,36,7,6,1,7,11,37,21,22,7,0,8,6,91,7,6,1,7,11,37,21,22,7,14,0,84,0,10,8,0,1,7,8,1,0,7,6,6,7,11,5,21,22,7,8,0,1,7,0,64,6,19,7,0,55,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,0,37,0,28,6,92,7,0,19,8,1,0,7,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,29,7,11,5,21,22,15,3,3,3,391,0,8,8,0,0,7,6,1,7,11,4,21,22,2,17,0,15,0,8,8,0,0,7,6,1,7,11,2,21,22,7,6,1,7,11,93,21,22,3,2,12,2,33,0,24,0,8,8,0,0,7,6,1,7,11,2,21,22,7,0,8,8,0,0,7,6,1,7,11,3,21,22,7,6,6,7,11,94,21,22,7,6,1,7,10,0,21,5,2,4,22,3,332,0,8,8,0,0,7,6,1,7,11,4,21,22,2,37,0,15,0,8,8,0,0,7,6,1,7,11,2,21,22,7,6,1,7,11,4,21,22,2,19,0,17,0,8,8,0,0,7,6,1,7,11,25,21,22,7,6,95,7,6,6,7,11,7,21,22,3,2,12,3,2,12,2,33,0,24,0,8,8,0,0,7,6,1,7,11,10,21,22,7,0,8,8,0,0,7,6,1,7,11,96,21,22,7,6,6,7,11,5,21,22,7,6,1,7,10,0,21,5,2,4,22,3,253,0,18,11,80,21,7,0,8,8,0,0,7,6,1,7,11,2,21,22,7,6,6,7,11,97,21,22,7,14,8,0,0,2,9,0,7,8,1,0,7,6,1,7,8,0,0,22,3,222,0,17,0,8,8,1,0,7,6,1,7,11,2,21,22,7,6,19,7,6,6,7,11,70,21,22,2,14,0,12,6,98,7,9,0,7,8,1,0,7,6,29,7,11,78,21,22,3,2,12,0,8,6,36,7,6,1,7,11,37,21,22,7,0,8,6,91,7,6,1,7,11,37,21,22,7,14,0,23,1,0,7,1,-1,6,51,7,11,37,21,5,1,2,22,7,0,8,8,2,0,7,6,1,7,11,3,21,22,7,6,6,7,11,68,21,22,7,14,0,144,0,45,0,17,8,1,1,7,0,8,8,3,0,7,6,1,7,11,2,21,22,7,6,6,7,11,5,21,22,7,0,20,11,5,21,7,8,0,0,7,0,8,8,3,0,7,6,1,7,11,3,21,22,7,6,29,7,11,99,21,22,7,6,6,7,11,34,21,22,7,0,10,8,1,1,7,8,0,0,7,6,6,7,11,12,21,22,7,0,80,6,19,7,0,71,0,10,8,1,0,7,12,7,6,6,7,11,12,21,22,7,0,53,0,44,6,82,7,0,35,8,1,1,7,0,26,8,1,0,7,0,17,0,8,8,0,0,7,6,1,7,11,2,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,29,7,11,5,21,22,15,5,3,15,2,2,15,2,2,23,2,16,0,0,0,11,8,0,0,21,7,6,100,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,100,26],
[12,7,14,20,0,1,0,58,1,-1,0,8,9,0,7,6,1,7,11,4,21,22,2,47,0,8,9,0,7,6,1,7,11,2,21,22,7,14,0,10,8,0,0,7,6,88,7,6,6,7,11,7,21,22,7,14,8,0,0,2,3,8,0,0,3,19,0,10,8,1,0,7,6,59,7,6,6,7,11,7,21,22,7,14,8,0,0,2,3,8,0,0,3,2,12,15,2,2,15,4,2,3,2,12,23,2,16,0,0,0,11,8,0,0,21,7,6,93,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,93,26],
[12,7,14,20,0,1,0,222,2,-1,0,17,0,8,9,1,7,6,1,7,11,2,21,22,7,6,88,7,6,6,7,11,7,21,22,2,155,0,8,9,1,7,6,1,7,11,3,21,22,7,6,1,7,12,7,14,20,0,9,0,7,8,0,0,7,1,2,117,1,-1,0,17,0,8,9,0,7,6,1,7,11,2,21,22,7,6,88,7,6,6,7,11,70,21,22,2,40,0,31,0,15,0,8,9,0,7,6,1,7,11,2,21,22,7,6,1,7,11,3,21,22,7,0,8,9,0,7,6,1,7,11,3,21,22,7,6,6,7,11,30,21,22,7,6,1,7,10,0,21,5,2,2,22,3,59,0,8,9,0,7,6,1,7,11,3,21,22,2,33,0,8,9,0,7,6,1,7,11,2,21,22,7,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,10,0,21,22,7,6,6,7,11,5,21,5,3,2,22,3,18,0,8,9,0,7,6,1,7,11,2,21,22,7,10,1,7,6,6,7,11,12,21,5,3,2,22,23,2,16,0,0,0,11,8,0,0,21,7,6,13,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,5,2,3,22,3,49,0,17,0,8,9,1,7,6,1,7,11,2,21,22,7,6,9,7,6,6,7,11,7,21,22,2,21,6,101,7,0,10,9,1,7,9,0,7,6,6,7,11,12,21,22,7,6,6,7,11,102,21,5,3,3,22,3,11,9,1,7,9,0,7,6,6,7,11,12,21,5,3,3,22,23,3,16,0,0,0,11,8,0,0,21,7,6,94,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,94,26],
[12,7,14,20,0,1,0,176,2,-1,0,10,9,1,7,6,90,7,6,6,7,11,55,21,22,2,30,6,92,7,0,19,9,1,7,0,10,9,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,3,22,3,135,0,8,9,1,7,6,1,7,11,100,21,22,7,14,0,8,8,0,0,7,6,1,7,11,2,21,22,7,0,15,0,8,8,0,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,8,0,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,14,0,8,6,36,7,6,1,7,11,37,21,22,7,14,0,64,6,103,7,0,55,0,19,8,1,2,7,0,10,8,0,0,7,9,0,7,6,6,7,11,5,21,22,7,6,6,7,11,34,21,22,7,0,28,0,19,8,1,0,7,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,15,8,2,23,3,16,0,0,0,11,8,0,0,21,7,6,104,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,104,26],
[12,7,14,20,0,1,0,77,1,-1,6,43,7,0,67,1,0,51,1,0,0,15,0,8,9,0,7,6,1,7,11,2,21,22,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,9,0,7,6,1,7,11,2,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,14,8,0,1,7,8,0,0,7,6,6,7,11,104,21,5,3,5,22,7,0,8,9,0,7,6,1,7,11,15,21,22,7,6,6,7,11,68,21,22,7,6,6,7,11,12,21,5,3,2,22,16,0,0,0,11,8,0,0,21,7,6,105,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,105,26],
[1,0,9,1,0,9,0,7,6,1,7,11,105,21,5,2,2,22,7,14,0,10,8,0,0,7,6,106,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,106,26],
[1,0,192,4,3,0,8,6,107,7,6,1,7,11,37,21,22,7,0,8,6,108,7,6,1,7,11,37,21,22,7,14,6,43,7,0,163,9,3,7,0,154,0,145,0,127,6,48,7,0,118,8,0,1,7,0,109,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,0,91,0,82,6,42,7,0,73,8,0,0,7,0,64,0,55,6,43,7,0,46,9,0,7,0,37,9,1,7,0,28,0,19,8,0,1,7,0,10,9,2,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,34,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,10,9,2,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,8,22,7,14,0,10,8,0,0,7,6,109,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,109,26],
[1,0,255,4,3,0,8,6,110,7,6,1,7,11,37,21,22,7,0,8,6,111,7,6,1,7,11,37,21,22,7,14,6,103,7,0,226,0,73,9,3,7,0,64,12,7,0,55,8,0,1,7,0,46,9,2,7,0,37,8,0,0,7,0,28,0,19,6,34,7,0,10,9,1,7,6,112,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,145,0,136,6,109,7,0,127,0,28,6,92,7,0,19,9,3,7,0,10,8,0,1,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,91,0,28,6,53,7,0,19,9,3,7,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,55,0,46,6,92,7,0,37,9,3,7,0,28,0,19,6,34,7,0,10,9,3,7,6,112,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,9,0,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,8,22,7,14,0,10,8,0,0,7,6,113,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,113,26],
[1,0,255,4,3,0,8,6,110,7,6,1,7,11,37,21,22,7,0,8,6,111,7,6,1,7,11,37,21,22,7,14,6,103,7,0,226,0,73,9,3,7,0,64,12,7,0,55,8,0,1,7,0,46,9,2,7,0,37,8,0,0,7,0,28,0,19,6,114,7,0,10,9,1,7,6,112,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,145,0,136,6,109,7,0,127,0,28,6,92,7,0,19,9,3,7,0,10,8,0,1,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,91,0,28,6,115,7,0,19,9,3,7,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,55,0,46,6,92,7,0,37,9,3,7,0,28,0,19,6,114,7,0,10,9,3,7,6,112,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,9,0,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,8,22,7,14,0,10,8,0,0,7,6,116,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,116,26],
[1,0,43,2,1,6,113,7,0,33,0,6,6,51,7,11,37,21,22,7,0,19,6,1,7,0,10,9,1,7,9,0,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,3,22,7,14,0,10,8,0,0,7,6,117,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,117,26],
[1,0,74,3,2,6,113,7,0,64,9,2,7,0,55,6,51,7,0,46,0,37,6,114,7,0,28,0,19,6,52,7,0,10,9,1,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,112,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,9,0,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,4,22,7,14,0,10,8,0,0,7,6,118,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,118,26],
[12,7,14,20,0,1,0,51,2,-1,0,10,9,0,7,6,12,7,6,6,7,11,119,21,22,7,14,0,35,9,1,7,1,1,24,1,-1,0,8,9,0,7,6,1,7,11,2,21,22,7,0,8,9,0,7,6,1,7,11,10,21,22,7,6,6,7,10,0,5,3,2,22,7,8,0,0,7,6,6,7,11,39,21,22,12,15,2,2,23,3,16,0,0,0,11,8,0,0,21,7,6,120,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,120,26],
[12,7,14,20,0,1,0,254,2,-1,0,8,9,1,7,6,1,7,11,32,21,22,2,73,9,1,7,6,1,7,12,7,14,20,0,8,0,0,7,9,0,7,1,2,42,1,-1,0,8,9,0,7,6,1,7,11,4,21,22,2,31,0,14,0,8,9,0,7,6,1,7,11,2,21,22,7,6,1,7,10,0,22,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,10,1,21,5,2,2,22,3,2,12,23,2,16,0,0,0,11,8,0,0,21,7,6,13,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,5,2,3,22,3,172,0,10,9,1,7,6,79,7,6,6,7,11,55,21,22,2,30,9,0,7,1,1,17,2,-1,0,10,9,1,7,9,0,7,6,6,7,11,5,21,22,7,6,1,7,10,0,5,2,3,22,7,9,1,7,6,6,7,11,120,21,5,3,3,22,3,132,12,7,6,51,7,0,26,0,17,0,8,9,1,7,6,1,7,11,52,21,22,7,6,1,7,6,6,7,11,114,21,22,7,6,1,7,6,6,7,11,34,21,22,7,14,20,2,8,0,1,16,0,2,0,95,0,11,8,0,2,21,7,8,0,0,7,6,6,7,11,53,21,22,7,6,1,7,12,7,14,20,0,8,1,0,7,8,0,0,7,8,1,2,7,9,1,7,9,0,7,1,5,50,1,-1,9,0,2,46,0,14,0,8,10,2,21,7,6,1,7,10,1,22,7,6,1,7,10,0,22,0,11,10,2,21,7,6,1,7,6,6,7,11,34,21,22,18,2,0,11,10,2,21,7,10,4,7,6,6,7,11,53,21,22,7,6,1,7,10,3,21,5,2,2,22,3,2,12,23,2,16,0,0,0,11,8,0,0,21,7,6,121,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,22,15,4,4,23,3,16,0,0,0,11,8,0,0,21,7,6,122,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,122,26],
[1,0,56,3,2,6,122,7,0,46,9,1,7,0,37,0,28,6,19,7,0,19,0,10,9,2,7,12,7,6,6,7,11,12,21,22,7,9,0,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,4,22,7,14,0,10,8,0,0,7,6,123,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,123,26],
[12,7,14,20,0,1,0,214,1,0,0,8,9,0,7,6,1,7,11,2,21,22,7,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,4,21,22,2,24,0,22,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,3,2,12,7,14,0,8,8,0,2,7,6,1,7,11,52,21,22,7,14,0,8,8,1,0,7,6,1,7,11,9,21,22,2,3,8,0,0,3,24,0,10,8,1,0,7,6,51,7,6,6,7,11,53,21,22,2,12,0,10,8,0,0,7,8,1,0,7,6,6,7,11,34,21,22,3,2,8,1,0,7,0,10,8,1,1,7,6,51,7,6,6,7,11,53,21,22,2,12,0,10,8,0,0,7,8,1,1,7,6,6,7,11,34,21,22,3,2,8,1,1,7,0,10,8,1,2,7,6,124,7,6,6,7,11,55,21,22,7,14,0,10,8,2,2,7,6,12,7,6,6,7,11,119,21,22,7,14,0,28,0,10,8,1,2,7,8,1,1,7,6,6,7,11,114,21,22,7,0,10,8,1,1,7,8,0,0,7,6,6,7,11,65,21,22,7,6,6,7,11,63,21,22,7,14,8,2,0,2,12,8,0,0,7,6,124,7,6,6,7,11,119,21,5,3,16,22,3,2,8,0,0,15,14,4,23,2,16,0,0,0,11,8,0,0,21,7,6,125,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,125,26],
[12,7,14,20,0,1,0,11,1,-1,6,1,7,9,0,7,6,6,7,11,64,21,5,3,2,22,16,0,0,0,11,8,0,0,21,7,6,126,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,126,26],
[12,7,14,20,0,8,0,0,7,1,1,168,2,-1,0,8,9,1,7,6,1,7,11,56,21,22,7,14,0,8,9,0,7,6,1,7,11,32,21,22,2,119,9,0,7,12,7,6,6,7,12,7,14,20,0,8,0,0,7,8,1,0,7,1,2,86,2,-1,0,8,9,1,7,6,1,7,11,9,21,22,2,10,9,0,7,6,1,7,11,127,21,5,2,3,22,3,67,0,14,0,8,9,1,7,6,1,7,11,2,21,22,7,6,1,7,10,0,22,2,19,0,8,9,1,7,6,1,7,11,3,21,22,7,9,0,7,6,6,7,10,1,21,5,3,3,22,3,34,0,8,9,1,7,6,1,7,11,3,21,22,7,0,17,0,8,9,1,7,6,1,7,11,2,21,22,7,9,0,7,6,6,7,11,12,21,22,7,6,6,7,10,1,21,5,3,3,22,23,3,16,0,0,0,11,8,0,0,21,7,6,13,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,5,3,5,22,3,29,0,19,8,0,0,7,0,10,9,0,7,6,12,7,6,6,7,11,119,21,22,7,6,6,7,10,0,21,22,7,6,124,7,6,6,7,11,119,21,5,3,5,22,15,2,2,23,3,16,0,0,0,11,8,0,0,21,7,6,128,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,128,26],
[12,7,14,20,0,1,0,25,2,-1,0,15,0,8,9,1,7,6,1,7,11,56,21,22,7,6,1,7,11,59,21,22,7,9,0,7,6,6,7,11,128,21,5,3,3,22,16,0,0,0,11,8,0,0,21,7,6,129,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,129,26],
[12,7,14,20,0,8,0,0,7,1,1,69,2,-1,9,0,2,65,0,14,0,8,9,0,7,6,1,7,11,2,21,22,7,6,1,7,9,1,22,7,14,8,0,0,2,28,0,26,8,0,0,7,0,17,9,1,7,0,8,9,0,7,6,1,7,11,3,21,22,7,6,6,7,10,0,21,22,7,6,6,7,11,12,21,22,3,18,0,17,9,1,7,0,8,9,0,7,6,1,7,11,3,21,22,7,6,6,7,10,0,21,22,15,2,2,3,2,12,23,3,16,0,0,0,11,8,0,0,21,7,6,130,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,130,26],
[1,0,71,1,0,0,8,6,36,7,6,1,7,11,37,21,22,7,14,6,33,7,0,51,8,0,0,7,0,42,0,8,9,0,7,6,1,7,11,2,21,22,7,0,26,0,8,9,0,7,6,1,7,11,3,21,22,7,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,34,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,4,22,7,14,0,10,8,0,0,7,6,131,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,131,26],
[1,0,179,2,-1,0,8,6,132,7,6,1,7,11,37,21,22,7,14,0,8,9,0,7,6,1,7,11,100,21,22,7,14,0,8,8,0,0,7,6,1,7,11,2,21,22,7,0,15,0,8,8,0,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,8,0,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,14,6,33,7,0,100,8,2,0,7,0,91,9,1,7,0,82,0,73,6,133,7,0,64,8,0,2,7,0,55,0,46,8,0,0,7,0,37,0,28,6,12,7,0,19,8,2,0,7,0,10,8,0,1,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,11,22,7,14,0,10,8,0,0,7,6,134,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,134,26],
[1,0,240,2,-1,0,8,6,135,7,6,1,7,11,37,21,22,7,0,8,6,136,7,6,1,7,11,37,21,22,7,14,0,8,9,1,7,6,1,7,11,100,21,22,7,0,8,9,0,7,6,1,7,11,100,21,22,7,14,0,8,8,0,1,7,6,1,7,11,2,21,22,7,0,15,0,8,8,0,1,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,8,0,1,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,0,8,8,0,0,7,6,1,7,11,2,21,22,7,0,15,0,8,8,0,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,8,0,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,14,6,133,7,0,95,0,32,8,0,5,7,0,10,8,2,1,7,8,0,4,7,6,6,7,11,5,21,22,7,8,0,2,7,0,10,8,2,0,7,8,0,1,7,6,6,7,11,5,21,22,7,6,137,7,11,34,21,22,7,0,55,0,19,8,0,3,7,0,10,8,2,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,28,0,19,8,0,0,7,0,10,8,2,1,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,16,22,7,14,0,10,8,0,0,7,6,138,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,138,26],
[1,0,331,1,0,0,16,1,0,7,1,-1,6,51,7,11,37,21,5,1,2,22,7,9,0,7,6,6,7,11,68,21,22,7,0,11,11,100,21,7,9,0,7,6,6,7,11,68,21,22,7,14,6,133,7,0,291,0,131,1,0,120,1,0,0,8,9,0,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,6,1,7,11,2,21,22,7,0,29,0,22,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,0,36,0,29,0,22,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,14,8,0,2,7,0,10,8,0,3,7,8,0,1,7,6,6,7,11,5,21,22,7,6,6,7,11,34,21,5,3,7,22,7,8,0,1,7,8,0,0,7,6,29,7,11,99,21,22,7,0,152,1,0,111,1,0,0,8,9,0,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,6,1,7,11,2,21,22,7,0,29,0,22,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,0,36,0,29,0,22,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,14,8,0,0,7,8,0,3,7,6,6,7,11,5,21,5,3,7,22,7,0,31,0,8,8,0,1,7,6,1,7,11,3,21,22,7,0,15,0,8,8,0,1,7,6,1,7,11,2,21,22,7,6,1,7,11,5,21,22,7,6,6,7,11,34,21,22,7,8,0,0,7,6,29,7,11,68,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,5,22,7,14,0,10,8,0,0,7,6,139,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,139,26],
[1,0,197,1,-1,0,8,6,36,7,6,1,7,11,37,21,22,7,14,0,8,9,0,7,6,1,7,11,100,21,22,7,14,0,8,8,0,0,7,6,1,7,11,2,21,22,7,0,15,0,8,8,0,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,8,0,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,14,6,133,7,0,118,0,19,8,0,2,7,0,10,8,2,0,7,8,0,1,7,6,6,7,11,5,21,22,7,6,6,7,11,34,21,22,7,0,91,0,82,6,131,7,0,73,0,19,6,2,7,0,10,8,2,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,46,0,37,8,0,0,7,0,28,0,19,6,3,7,0,10,8,2,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,10,22,7,14,0,10,8,0,0,7,6,140,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,140,26],
[12,7,14,20,0,1,0,114,1,0,0,8,9,0,7,6,1,7,11,2,21,22,7,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,4,21,22,2,24,0,22,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,3,3,11,41,21,7,14,0,23,8,0,2,7,8,0,0,7,1,2,10,1,-1,10,1,7,9,0,7,6,6,7,10,0,5,3,2,22,7,8,0,1,7,6,6,7,11,58,21,22,2,3,8,0,1,3,11,8,0,2,7,8,0,1,7,6,6,7,11,12,21,5,3,6,22,15,4,4,23,2,16,0,0,0,11,8,0,0,21,7,6,141,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,141,26],
[1,0,216,1,0,0,8,9,0,7,6,1,7,11,2,21,22,7,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,4,21,22,2,24,0,22,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,3,2,6,41,7,14,0,8,8,0,1,7,6,1,7,11,100,21,22,7,14,0,8,8,0,0,7,6,1,7,11,2,21,22,7,0,15,0,8,8,0,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,8,0,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,14,6,133,7,0,73,8,0,2,7,0,64,0,55,8,0,0,7,0,46,0,37,6,141,7,0,28,8,2,2,7,0,19,8,0,1,7,0,10,8,2,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,12,22,7,14,0,10,8,0,0,7,6,142,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,142,26],
[1,0,133,2,-1,0,8,9,0,7,6,1,7,11,100,21,22,7,14,0,8,8,0,0,7,6,1,7,11,2,21,22,7,0,15,0,8,8,0,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,8,0,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,14,6,133,7,0,64,8,0,2,7,0,55,0,46,8,0,0,7,0,37,0,28,6,128,7,0,19,9,1,7,0,10,8,0,1,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,9,22,7,14,0,10,8,0,0,7,6,143,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,143,26],
[1,0,334,1,0,0,8,9,0,7,6,1,7,11,2,21,22,7,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,4,21,22,2,24,0,22,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,3,2,6,41,7,14,0,8,6,132,7,6,1,7,11,37,21,22,7,14,0,8,8,1,1,7,6,1,7,11,100,21,22,7,14,0,8,8,0,0,7,6,1,7,11,2,21,22,7,0,15,0,8,8,0,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,8,0,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,14,6,133,7,0,181,0,19,0,10,8,2,0,7,8,3,2,7,6,6,7,11,5,21,22,7,8,0,2,7,6,6,7,11,34,21,22,7,0,154,0,145,8,0,0,7,0,136,0,127,6,42,7,0,118,0,28,6,144,7,0,19,8,2,0,7,0,10,8,0,1,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,82,0,28,6,128,7,0,19,8,2,0,7,0,10,8,0,1,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,46,0,37,6,141,7,0,28,8,2,0,7,0,19,8,0,1,7,0,10,8,3,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,14,22,7,14,0,10,8,0,0,7,6,145,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,145,26],
[1,0,275,1,0,0,8,9,0,7,6,1,7,11,2,21,22,7,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,4,21,22,2,17,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,3,2,6,1,7,14,0,10,8,0,1,7,6,90,7,6,6,7,11,55,21,22,2,57,6,106,7,0,46,8,0,1,7,0,37,0,28,6,34,7,0,19,8,0,1,7,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,5,22,3,162,0,8,6,110,7,6,1,7,11,37,21,22,7,14,0,8,8,1,1,7,6,1,7,11,100,21,22,7,14,0,8,8,0,0,7,6,1,7,11,2,21,22,7,0,15,0,8,8,0,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,8,0,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,14,0,91,6,133,7,0,82,0,19,8,0,2,7,0,10,8,2,0,7,8,3,0,7,6,6,7,11,5,21,22,7,6,6,7,11,34,21,22,7,0,55,0,46,8,0,0,7,0,37,0,28,6,34,7,0,19,8,0,1,7,0,10,8,2,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,15,8,2,15,3,3,23,2,7,14,0,10,8,0,0,7,6,146,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,146,26],
[1,0,275,1,0,0,8,9,0,7,6,1,7,11,2,21,22,7,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,4,21,22,2,17,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,3,2,6,1,7,14,0,10,8,0,1,7,6,90,7,6,6,7,11,55,21,22,2,57,6,106,7,0,46,8,0,1,7,0,37,0,28,6,114,7,0,19,8,0,1,7,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,5,22,3,162,0,8,6,110,7,6,1,7,11,37,21,22,7,14,0,8,8,1,1,7,6,1,7,11,100,21,22,7,14,0,8,8,0,0,7,6,1,7,11,2,21,22,7,0,15,0,8,8,0,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,8,0,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,14,0,91,6,133,7,0,82,0,19,8,0,2,7,0,10,8,2,0,7,8,3,0,7,6,6,7,11,5,21,22,7,6,6,7,11,34,21,22,7,0,55,0,46,8,0,0,7,0,37,0,28,6,114,7,0,19,8,0,1,7,0,10,8,2,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,15,8,2,15,3,3,23,2,7,14,0,10,8,0,0,7,6,147,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,147,26],
[1,0,255,3,2,0,6,6,51,7,11,37,21,22,7,0,16,1,0,7,1,-1,6,51,7,11,37,21,5,1,2,22,7,9,0,7,6,6,7,11,68,21,22,7,12,7,14,20,0,8,0,0,7,1,1,56,1,0,0,11,11,9,21,7,9,0,7,6,6,7,11,58,21,22,2,3,12,3,41,0,11,11,2,21,7,9,0,7,6,6,7,11,68,21,22,7,0,21,10,0,21,7,0,11,11,3,21,7,9,0,7,6,6,7,11,68,21,22,7,6,6,7,11,28,21,22,7,6,6,7,11,34,21,5,3,2,22,23,2,16,0,0,0,11,8,0,0,21,7,6,13,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,7,14,0,8,9,1,7,6,1,7,11,100,21,22,7,14,0,8,8,0,0,7,6,1,7,11,2,21,22,7,0,15,0,8,8,0,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,8,0,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,14,6,133,7,0,83,0,29,8,0,2,7,0,10,8,2,2,7,9,2,7,6,6,7,11,5,21,22,7,0,9,8,2,1,7,9,0,7,6,6,7,8,2,0,22,7,6,29,7,11,34,21,22,7,0,46,0,37,8,0,0,7,0,28,0,19,8,2,2,7,0,10,8,0,1,7,8,2,1,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,14,22,7,14,0,10,8,0,0,7,6,148,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,148,26],
[1,0,39,1,0,6,43,7,0,29,1,0,20,1,-1,6,106,7,0,10,9,0,7,6,149,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,2,22,7,9,0,7,6,6,7,11,68,21,22,7,6,6,7,11,12,21,5,3,2,22,7,14,0,10,8,0,0,7,6,150,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,150,26],
[1,0,39,1,0,6,43,7,0,29,1,0,20,1,-1,6,106,7,0,10,9,0,7,6,151,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,2,22,7,9,0,7,6,6,7,11,68,21,22,7,6,6,7,11,12,21,5,3,2,22,7,14,0,10,8,0,0,7,6,152,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,152,26],
[1,0,169,3,2,9,0,2,165,0,8,6,153,7,6,1,7,11,37,21,22,7,14,0,152,6,33,7,0,143,8,0,0,7,0,134,9,1,7,0,125,0,116,6,42,7,0,107,8,0,0,7,0,98,0,44,6,33,7,0,35,9,2,7,0,26,8,0,0,7,0,17,0,8,9,0,7,6,1,7,11,2,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,46,0,8,9,0,7,6,1,7,11,3,21,22,2,28,0,26,6,154,7,0,17,9,2,7,0,8,9,0,7,6,1,7,11,3,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,3,2,12,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,15,2,2,3,2,9,1,23,4,7,14,0,10,8,0,0,7,6,154,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,154,26],
[1,0,47,3,2,6,154,7,0,37,9,2,7,0,28,9,1,7,0,19,0,10,6,43,7,9,0,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,4,22,7,14,0,10,8,0,0,7,6,155,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,155,26],
[1,0,74,2,1,6,33,7,0,64,6,156,7,0,55,9,1,7,0,46,0,37,6,42,7,0,28,6,156,7,0,19,0,10,6,43,7,9,0,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,3,22,7,14,0,10,8,0,0,7,6,157,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,157,26],
[1,0,147,3,2,0,8,6,46,7,6,1,7,11,37,21,22,7,0,8,6,47,7,6,1,7,11,37,21,22,7,14,0,109,6,48,7,0,100,8,0,1,7,0,91,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,0,73,0,64,6,155,7,0,55,9,2,7,0,46,8,0,0,7,0,37,9,0,7,0,28,0,19,8,0,1,7,0,10,9,1,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,34,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,10,9,1,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,7,22,7,14,0,10,8,0,0,7,6,158,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,158,26],
[1,0,125,1,0,0,8,9,0,7,6,1,7,11,9,21,22,2,3,13,3,113,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,9,21,22,2,10,9,0,7,6,1,7,11,2,21,5,2,2,22,3,88,6,33,7,0,78,6,156,7,0,69,0,8,9,0,7,6,1,7,11,2,21,22,7,0,53,0,44,6,159,7,0,35,6,156,7,0,26,0,17,6,160,7,0,8,9,0,7,6,1,7,11,3,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,2,22,23,2,7,14,0,10,8,0,0,7,6,160,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,160,26],
[1,0,147,2,1,0,8,6,161,7,6,1,7,11,37,21,22,7,14,6,133,7,0,127,0,82,8,0,0,7,0,73,12,7,0,64,9,1,7,0,55,0,46,6,162,7,0,37,0,28,6,134,7,0,19,6,163,7,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,37,9,0,7,0,28,0,19,6,127,7,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,34,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,5,22,7,14,0,10,8,0,0,7,6,164,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,164,26],
[1,0,344,1,0,0,8,9,0,7,6,1,7,11,2,21,22,7,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,4,21,22,2,17,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,3,2,12,7,14,0,8,6,161,7,6,1,7,11,37,21,22,7,0,8,6,165,7,6,1,7,11,37,21,22,7,0,8,6,166,7,6,1,7,11,37,21,22,7,14,6,103,7,0,262,0,28,8,0,2,7,0,19,12,7,0,10,8,0,1,7,6,149,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,226,0,190,6,49,7,0,181,0,19,6,9,7,0,10,8,0,1,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,154,0,145,6,33,7,0,136,8,0,0,7,0,127,8,1,1,7,0,118,0,109,6,42,7,0,100,0,28,6,7,7,0,19,8,0,0,7,0,10,8,1,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,64,0,19,6,106,7,0,10,8,0,1,7,6,151,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,37,0,28,6,134,7,0,19,8,0,0,7,0,10,8,0,2,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,28,0,19,6,62,7,0,10,8,0,2,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,9,22,7,14,0,10,8,0,0,7,6,167,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,167,26],
[1,0,174,4,3,0,8,6,46,7,6,1,7,11,37,21,22,7,14,6,133,7,0,154,0,55,9,3,7,0,46,12,7,0,37,8,0,0,7,0,28,0,19,6,56,7,0,10,9,1,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,91,0,82,6,49,7,0,73,0,64,6,9,7,0,55,0,46,8,0,0,7,0,37,0,28,6,106,7,0,19,9,3,7,0,10,9,2,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,9,0,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,7,22,7,14,0,10,8,0,0,7,6,168,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,168,26],
[1,0,176,1,0,0,8,9,0,7,6,1,7,11,2,21,22,7,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,4,21,22,2,24,0,22,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,3,2,12,7,14,0,8,6,132,7,6,1,7,11,37,21,22,7,14,6,33,7,0,82,8,0,0,7,0,73,8,1,2,7,0,64,0,55,6,42,7,0,46,0,19,8,1,1,7,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,19,8,0,0,7,0,10,8,1,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,8,22,7,14,0,10,8,0,0,7,6,169,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,169,26],
[1,0,157,1,0,0,8,9,0,7,6,1,7,11,2,21,22,7,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,4,21,22,2,24,0,22,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,3,2,12,7,14,6,33,7,0,73,6,156,7,0,64,8,0,2,7,0,55,0,46,6,42,7,0,37,0,10,8,0,1,7,6,170,7,6,6,7,11,12,21,22,7,0,19,6,156,7,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,6,22,7,14,0,10,8,0,0,7,6,171,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,171,26],
[12,7,14,20,0,1,0,227,1,0,0,8,9,0,7,6,1,7,11,2,21,22,7,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,4,21,22,2,24,0,22,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,3,2,6,51,7,14,0,8,8,0,2,7,6,1,7,11,56,21,22,7,14,0,8,8,1,1,7,6,1,7,11,32,21,22,2,98,0,10,8,1,0,7,8,1,1,7,6,6,7,11,65,21,22,7,8,1,0,7,6,6,7,12,7,14,20,0,8,0,0,7,8,1,0,7,1,2,56,2,-1,0,8,9,1,7,6,1,7,11,9,21,22,2,3,12,3,44,0,14,0,8,9,1,7,6,1,7,11,2,21,22,7,6,1,7,10,0,22,2,3,9,0,3,27,0,8,9,1,7,6,1,7,11,3,21,22,7,0,10,9,0,7,6,1,7,6,6,7,11,34,21,22,7,6,6,7,10,1,21,5,3,3,22,23,3,16,0,0,0,11,8,0,0,21,7,6,13,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,5,3,8,22,3,35,8,1,1,7,8,0,0,7,1,2,19,1,-1,0,13,0,7,9,0,7,6,1,7,10,1,22,7,6,1,7,10,0,22,2,3,9,0,3,2,12,23,2,7,8,1,1,7,8,1,0,7,6,29,7,11,54,21,5,4,8,22,15,6,4,23,2,16,0,0,0,11,8,0,0,21,7,6,172,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,172,26],
[12,7,14,20,0,1,0,11,1,-1,9,0,7,6,90,7,6,6,7,11,119,21,5,3,2,22,16,0,0,0,11,8,0,0,21,7,6,90,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,90,26],
[12,7,14,20,0,1,0,57,1,0,0,8,9,0,7,6,1,7,11,2,21,22,7,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,4,21,22,2,17,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,3,2,6,173,7,14,8,0,1,7,6,17,7,8,0,0,7,6,29,7,11,119,21,5,4,5,22,16,0,0,0,11,8,0,0,21,7,6,17,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,17,26],
[0,94,6,174,7,0,85,0,8,6,175,7,6,1,7,11,176,21,22,7,11,177,21,7,12,7,14,20,0,1,0,47,1,-1,6,19,7,0,37,6,178,7,0,28,0,19,6,34,7,0,10,9,0,7,6,178,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,2,22,16,0,0,0,11,8,0,0,21,7,6,179,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,7,6,29,7,11,5,21,22,7,6,6,7,11,23,21,22,19,179,0,11,11,177,21,7,6,1,7,6,6,7,11,34,21,22,19,177,11,179,21,26],
[0,94,6,174,7,0,85,0,8,6,180,7,6,1,7,11,176,21,22,7,11,177,21,7,12,7,14,20,0,1,0,47,1,-1,6,19,7,0,37,6,178,7,0,28,0,19,6,114,7,0,10,9,0,7,6,178,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,2,22,16,0,0,0,11,8,0,0,21,7,6,181,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,7,6,29,7,11,5,21,22,7,6,6,7,11,23,21,22,19,181,0,11,11,177,21,7,6,1,7,6,6,7,11,34,21,22,19,177,11,181,21,26],
[0,94,6,174,7,0,85,0,8,6,182,7,6,1,7,11,176,21,22,7,11,177,21,7,12,7,14,20,0,1,0,47,1,-1,6,19,7,0,37,6,178,7,0,28,0,19,6,183,7,0,10,9,0,7,6,178,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,2,22,16,0,0,0,11,8,0,0,21,7,6,184,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,7,6,29,7,11,5,21,22,7,6,6,7,11,23,21,22,19,184,0,11,11,177,21,7,6,1,7,6,6,7,11,34,21,22,19,177,11,184,21,26],
[0,94,6,174,7,0,85,0,8,6,185,7,6,1,7,11,176,21,22,7,11,177,21,7,12,7,14,20,0,1,0,47,1,-1,6,19,7,0,37,6,178,7,0,28,0,19,6,186,7,0,10,9,0,7,6,178,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,2,22,16,0,0,0,11,8,0,0,21,7,6,187,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,7,6,29,7,11,5,21,22,7,6,6,7,11,23,21,22,19,187,0,11,11,177,21,7,6,1,7,6,6,7,11,34,21,22,19,177,11,187,21,26],
[0,103,6,174,7,0,94,0,8,6,188,7,6,1,7,11,176,21,22,7,11,177,21,7,12,7,14,20,0,1,0,56,1,-1,6,19,7,0,46,6,178,7,0,37,0,28,6,186,7,0,19,6,189,7,0,10,9,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,2,22,16,0,0,0,11,8,0,0,21,7,6,190,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,7,6,29,7,11,5,21,22,7,6,6,7,11,23,21,22,19,190,0,11,11,177,21,7,6,1,7,6,6,7,11,34,21,22,19,177,11,190,21,26],
[1,0,78,1,0,0,8,9,0,7,6,1,7,11,52,21,22,7,14,6,191,7,0,58,0,19,6,192,7,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,31,11,5,21,7,0,19,6,51,7,0,10,8,0,0,7,6,1,7,6,6,7,11,114,21,22,7,6,6,7,11,193,21,22,7,9,0,7,6,29,7,11,99,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,4,22,7,14,0,10,8,0,0,7,6,194,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,194,26],
[1,0,129,2,-1,0,8,6,195,7,6,1,7,11,37,21,22,7,14,6,33,7,0,109,8,0,0,7,0,100,12,7,0,91,0,55,6,117,7,0,46,9,1,7,0,37,0,28,6,134,7,0,19,9,0,7,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,28,0,19,6,127,7,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,5,22,7,14,0,10,8,0,0,7,6,196,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,196,26],
[12,7,14,20,0,1,0,237,1,0,0,8,9,0,7,6,1,7,11,2,21,22,7,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,4,21,22,2,17,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,3,2,6,197,7,14,0,8,8,0,0,7,6,1,7,11,52,21,22,7,14,12,7,14,20,0,8,0,0,7,1,1,29,1,-1,9,0,7,14,10,0,21,7,14,0,10,8,1,0,7,8,0,0,7,6,6,7,11,12,21,22,7,6,1,7,10,0,7,1,1,4,1,-1,9,0,18,0,23,2,5,2,6,22,7,14,12,7,6,1,7,0,10,8,3,1,7,6,1,7,6,6,7,11,34,21,22,7,14,20,2,8,0,1,16,0,2,0,103,0,11,8,0,2,21,7,8,0,0,7,6,6,7,11,53,21,22,7,6,1,7,12,7,14,20,0,8,1,0,7,8,0,0,7,8,1,2,7,8,4,0,7,8,5,0,7,8,2,0,7,1,6,56,1,-1,9,0,2,52,0,20,0,14,0,8,10,2,7,6,1,7,11,192,21,22,7,6,1,7,10,1,22,7,6,1,7,10,0,22,0,11,10,3,21,7,6,1,7,6,6,7,11,34,21,22,18,3,0,11,10,3,21,7,10,5,7,6,6,7,11,53,21,22,7,6,1,7,10,4,21,5,2,2,22,3,2,12,23,2,16,0,0,0,11,8,0,0,21,7,6,198,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,22,15,4,4,0,9,8,1,0,21,7,6,1,7,11,127,21,22,15,4,2,7,14,8,0,0,7,6,124,7,6,6,7,11,119,21,5,3,9,22,16,0,0,0,11,8,0,0,21,7,6,199,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,199,26],
[1,0,142,3,2,0,10,9,2,7,6,200,7,6,6,7,11,7,21,22,2,10,6,201,7,6,1,7,11,102,21,5,2,4,22,3,121,0,8,6,202,7,6,1,7,11,37,21,22,7,14,0,109,6,33,7,0,100,8,0,0,7,0,91,9,1,7,0,82,0,73,6,118,7,0,64,6,200,7,0,55,8,0,0,7,0,46,0,37,6,33,7,0,28,9,2,7,0,19,0,10,8,0,0,7,6,203,7,6,6,7,11,12,21,22,7,9,0,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,15,2,2,23,4,7,14,0,10,8,0,0,7,6,204,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,204,26],
[12,7,14,20,0,1,0,64,2,-1,0,8,9,0,7,6,1,7,11,9,21,22,2,3,12,3,52,0,8,9,0,7,6,1,7,11,2,21,22,7,14,20,0,0,37,0,8,9,0,7,6,1,7,11,3,21,22,7,8,0,0,7,9,1,7,1,2,17,1,-1,0,10,9,0,7,10,1,21,7,6,6,7,10,0,22,2,4,9,0,18,1,3,2,12,23,2,7,6,6,7,11,122,21,22,8,0,0,21,15,2,2,23,3,16,0,0,0,11,8,0,0,21,7,6,205,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,205,26],
[12,7,14,20,0,1,0,83,2,-1,9,0,2,79,0,8,9,0,7,6,1,7,11,2,21,22,7,14,20,0,0,8,8,0,0,21,7,6,1,7,9,1,22,7,14,20,0,0,52,0,8,9,0,7,6,1,7,11,3,21,22,7,8,1,0,7,8,0,0,7,9,1,7,1,3,30,1,-1,0,7,9,0,7,6,1,7,10,0,22,7,14,0,11,8,0,0,7,10,1,21,7,6,6,7,11,115,21,22,2,6,9,0,18,2,8,0,0,18,1,3,2,12,15,2,2,23,2,7,6,6,7,11,122,21,22,8,1,0,21,15,4,2,3,2,12,23,3,16,0,0,0,11,8,0,0,21,7,6,206,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,206,26],
[12,7,14,20,0,8,0,0,7,1,1,83,3,-1,0,8,9,0,7,6,1,7,11,9,21,22,2,10,9,1,7,6,1,7,11,5,21,5,2,4,22,3,64,0,16,9,1,7,0,8,9,0,7,6,1,7,11,2,21,22,7,6,6,7,9,2,22,2,12,9,1,7,9,0,7,6,6,7,11,12,21,5,3,4,22,3,36,0,8,9,0,7,6,1,7,11,2,21,22,7,0,19,9,2,7,9,1,7,0,8,9,0,7,6,1,7,11,3,21,22,7,6,29,7,10,0,21,22,7,6,6,7,11,12,21,5,3,4,22,23,4,16,0,0,0,11,8,0,0,21,7,6,207,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,207,26],
[1,0,74,3,-1,6,148,7,0,64,0,46,6,162,7,0,37,0,28,6,207,7,0,19,9,2,7,0,10,9,1,7,6,20,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,10,9,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,4,22,7,14,0,10,8,0,0,7,6,208,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,208,26],
[12,7,14,20,0,8,0,0,7,1,1,130,3,-1,0,8,9,0,7,6,1,7,11,9,21,22,2,10,9,1,7,6,1,7,11,5,21,5,2,4,22,3,111,0,17,9,1,7,0,8,9,0,7,6,1,7,11,2,21,22,7,6,6,7,11,7,21,22,2,21,9,2,7,9,1,7,0,8,9,0,7,6,1,7,11,3,21,22,7,6,29,7,10,0,21,5,4,4,22,3,73,0,16,9,1,7,0,8,9,0,7,6,1,7,11,2,21,22,7,6,6,7,9,2,22,2,21,9,1,7,0,10,9,1,7,9,0,7,6,6,7,11,128,21,22,7,6,6,7,11,12,21,5,3,4,22,3,36,0,8,9,0,7,6,1,7,11,2,21,22,7,0,19,9,2,7,9,1,7,0,8,9,0,7,6,1,7,11,3,21,22,7,6,29,7,10,0,21,22,7,6,6,7,11,12,21,5,3,4,22,23,4,16,0,0,0,11,8,0,0,21,7,6,209,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,209,26],
[1,0,74,3,-1,6,148,7,0,64,0,46,6,162,7,0,37,0,28,6,209,7,0,19,9,2,7,0,10,9,1,7,6,20,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,10,9,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,4,22,7,14,0,10,8,0,0,7,6,210,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,210,26],
[12,7,14,20,0,1,0,90,1,-1,0,6,6,51,7,11,79,21,22,7,14,9,0,7,8,0,0,7,1,2,75,1,0,0,7,9,0,7,6,1,7,10,0,22,7,14,8,0,0,2,10,8,0,0,7,6,1,7,11,2,21,5,2,4,22,3,53,0,10,10,1,7,9,0,7,6,6,7,11,28,21,22,7,14,10,0,7,9,0,7,0,8,8,0,0,7,6,1,7,11,5,21,22,7,14,0,23,8,0,0,7,6,1,7,8,0,1,7,8,0,2,7,1,2,13,1,-1,10,0,7,9,0,7,10,1,7,6,29,7,11,82,21,5,4,2,22,22,15,4,4,8,0,0,15,2,2,15,2,2,23,2,15,2,2,23,2,16,0,0,0,11,8,0,0,21,7,6,211,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,211,26],
[1,0,65,3,2,6,92,7,0,55,9,2,7,0,46,0,37,6,211,7,0,28,0,19,6,19,7,0,10,9,1,7,9,0,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,4,22,7,14,0,10,8,0,0,7,6,212,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,212,26],
[12,7,14,20,0,1,0,42,2,-1,6,51,7,14,20,0,0,33,9,0,7,9,1,7,8,0,0,7,1,2,20,1,-1,0,17,10,0,21,7,0,7,9,0,7,6,1,7,10,1,22,7,6,6,7,11,34,21,22,18,0,23,2,7,6,6,7,11,122,21,22,8,0,0,21,15,2,2,23,3,16,0,0,0,11,8,0,0,21,7,6,213,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,213,26],
[12,7,14,20,0,8,0,0,7,1,1,64,3,-1,0,8,9,0,7,6,1,7,11,24,21,22,2,9,9,0,7,6,1,7,9,1,5,2,4,22,3,46,0,19,9,2,7,9,1,7,0,8,9,0,7,6,1,7,11,2,21,22,7,6,29,7,10,0,21,22,7,0,19,9,2,7,9,1,7,0,8,9,0,7,6,1,7,11,3,21,22,7,6,29,7,10,0,21,22,7,6,6,7,9,2,5,3,4,22,23,4,16,0,0,0,11,8,0,0,21,7,6,214,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,214,26],
[12,7,14,20,0,1,0,146,1,0,0,8,9,0,7,6,1,7,11,2,21,22,7,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,4,21,22,2,17,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,3,2,6,215,7,0,22,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,4,21,22,2,24,0,22,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,3,2,6,216,7,14,8,0,2,2,49,0,17,8,0,1,7,0,8,8,0,2,7,6,1,7,11,2,21,22,7,6,6,7,11,217,21,22,0,29,8,0,0,7,1,1,11,1,-1,10,0,7,9,0,7,6,6,7,11,217,21,5,3,2,22,7,0,8,8,0,2,7,6,1,7,11,3,21,22,7,6,6,7,11,68,21,22,8,0,2,3,2,12,15,4,4,23,2,16,0,0,0,11,8,0,0,21,7,6,218,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,218,26],
[12,7,14,20,0,1,0,13,1,0,9,0,7,6,215,7,6,75,7,6,29,7,11,218,21,5,4,2,22,16,0,0,0,11,8,0,0,21,7,6,219,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,219,26],
[12,7,14,20,0,8,0,0,7,1,1,72,3,-1,0,10,9,0,7,9,2,7,6,6,7,11,7,21,22,2,3,9,1,3,58,0,8,9,0,7,6,1,7,11,24,21,22,2,3,9,0,3,47,0,19,9,2,7,9,1,7,0,8,9,0,7,6,1,7,11,2,21,22,7,6,29,7,10,0,21,22,7,0,19,9,2,7,9,1,7,0,8,9,0,7,6,1,7,11,3,21,22,7,6,29,7,10,0,21,22,7,6,6,7,11,12,21,5,3,4,22,23,4,16,0,0,0,11,8,0,0,21,7,6,220,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,220,26],
[12,7,14,20,0,8,0,0,7,1,1,61,2,-1,0,7,9,0,7,6,1,7,9,1,22,0,15,0,8,9,0,7,6,1,7,11,24,21,22,7,6,1,7,11,9,21,22,2,36,0,17,9,1,7,0,8,9,0,7,6,1,7,11,2,21,22,7,6,6,7,10,0,21,22,9,1,7,0,8,9,0,7,6,1,7,11,3,21,22,7,6,6,7,10,0,21,5,3,3,22,3,2,12,23,3,16,0,0,0,11,8,0,0,21,7,6,221,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,221,26],
[12,7,14,20,0,8,0,0,7,1,1,69,1,-1,0,8,9,0,7,6,1,7,11,24,21,22,2,3,12,3,57,0,8,9,0,7,6,1,7,11,3,21,22,2,47,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,24,21,22,7,14,8,0,0,2,3,8,0,0,3,24,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,10,0,21,22,7,14,8,0,0,2,3,8,0,0,3,2,12,15,2,2,15,2,2,3,2,12,23,2,16,0,0,0,11,8,0,0,21,7,6,222,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,222,26],
[12,7,14,20,0,1,0,92,2,-1,0,89,0,8,9,0,7,6,1,7,11,15,21,22,7,9,1,7,1,1,71,1,0,0,15,0,8,9,0,7,6,1,7,11,2,21,22,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,9,0,7,6,1,7,11,2,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,14,10,0,7,8,0,1,7,8,0,0,7,14,8,0,0,7,6,1,7,8,0,1,7,8,0,2,7,1,2,13,1,-1,10,0,7,9,0,7,10,1,7,6,29,7,11,82,21,5,4,2,22,5,2,9,22,7,6,6,7,11,122,21,22,9,1,23,3,16,0,0,0,11,8,0,0,21,7,6,223,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,223,26],
[12,7,14,20,0,1,0,106,1,-1,12,7,14,20,0,8,0,0,7,1,1,29,1,-1,9,0,7,14,10,0,21,7,14,0,10,8,1,0,7,8,0,0,7,6,6,7,11,12,21,22,7,6,1,7,10,0,7,1,1,4,1,-1,9,0,18,0,23,2,5,2,6,22,7,14,0,59,9,0,7,8,0,0,7,1,1,48,1,0,0,15,0,8,9,0,7,6,1,7,11,2,21,22,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,9,0,7,6,1,7,11,2,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,14,8,0,1,7,6,1,7,10,0,5,2,5,22,7,6,6,7,11,122,21,22,8,1,0,21,7,6,1,7,11,127,21,5,2,6,22,16,0,0,0,11,8,0,0,21,7,6,224,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,224,26],
[12,7,14,20,0,1,0,106,1,-1,12,7,14,20,0,8,0,0,7,1,1,29,1,-1,9,0,7,14,10,0,21,7,14,0,10,8,1,0,7,8,0,0,7,6,6,7,11,12,21,22,7,6,1,7,10,0,7,1,1,4,1,-1,9,0,18,0,23,2,5,2,6,22,7,14,0,59,9,0,7,8,0,0,7,1,1,48,1,0,0,15,0,8,9,0,7,6,1,7,11,2,21,22,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,9,0,7,6,1,7,11,2,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,14,8,0,0,7,6,1,7,10,0,5,2,5,22,7,6,6,7,11,122,21,22,8,1,0,21,7,6,1,7,11,127,21,5,2,6,22,16,0,0,0,11,8,0,0,21,7,6,225,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,225,26],
[12,7,14,20,0,1,0,66,1,-1,12,7,14,20,0,8,0,0,7,1,1,29,1,-1,9,0,7,14,10,0,21,7,14,0,10,8,1,0,7,8,0,0,7,6,6,7,11,12,21,22,7,6,1,7,10,0,7,1,1,4,1,-1,9,0,18,0,23,2,5,2,6,22,7,14,0,19,8,0,0,7,1,1,8,1,0,9,0,7,6,1,7,10,0,5,2,2,22,7,9,0,7,6,6,7,11,120,21,22,8,1,0,21,7,6,1,7,11,127,21,5,2,6,22,16,0,0,0,11,8,0,0,21,7,6,226,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,226,26],
[12,7,14,20,0,1,0,94,1,-1,0,6,6,51,7,11,79,21,22,7,14,0,82,8,0,0,7,1,1,71,1,0,0,15,0,8,9,0,7,6,1,7,11,2,21,22,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,9,0,7,6,1,7,11,2,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,14,10,0,7,8,0,1,7,8,0,0,7,14,8,0,0,7,6,1,7,8,0,1,7,8,0,2,7,1,2,13,1,-1,10,0,7,9,0,7,10,1,7,6,29,7,11,82,21,5,4,2,22,5,2,9,22,7,9,0,7,6,6,7,11,68,21,22,8,0,0,15,2,2,23,2,16,0,0,0,11,8,0,0,21,7,6,227,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,227,26],
[1,0,131,1,0,6,227,7,0,121,0,112,6,5,7,0,103,1,0,87,1,0,0,15,0,8,9,0,7,6,1,7,11,2,21,22,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,9,0,7,6,1,7,11,2,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,14,6,5,7,0,37,0,19,6,83,7,0,10,8,0,1,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,5,22,7,0,8,9,0,7,6,1,7,11,15,21,22,7,6,6,7,11,68,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,2,22,7,14,0,10,8,0,0,7,6,228,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,228,26],
[12,7,14,20,0,8,0,0,7,1,1,279,2,1,0,8,9,1,7,6,1,7,11,16,21,22,7,14,0,10,8,0,0,7,6,90,7,6,6,7,11,7,21,22,2,3,9,1,3,187,0,10,8,0,0,7,6,17,7,6,6,7,11,7,21,22,2,3,9,1,3,174,0,10,8,0,0,7,6,229,7,6,6,7,11,7,21,22,2,3,9,1,3,161,0,10,8,0,0,7,6,124,7,6,6,7,11,7,21,22,2,3,9,1,3,148,0,10,8,0,0,7,6,12,7,6,6,7,11,7,21,22,2,40,0,38,0,15,0,8,9,1,7,6,1,7,11,2,21,22,7,6,1,7,10,0,21,22,7,0,15,0,8,9,1,7,6,1,7,11,3,21,22,7,6,1,7,10,0,21,22,7,6,6,7,11,12,21,22,3,98,0,10,8,0,0,7,6,79,7,6,6,7,11,7,21,22,2,77,0,6,6,51,7,11,79,21,22,7,14,0,65,9,1,7,10,0,7,8,0,0,7,1,2,52,1,0,0,15,0,8,9,0,7,6,1,7,11,2,21,22,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,9,0,7,6,1,7,11,2,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,14,0,8,8,0,0,7,6,1,7,10,1,21,22,19,230,15,3,3,23,2,7,6,6,7,11,122,21,22,8,0,0,15,2,2,3,11,0,10,6,231,7,9,1,7,6,6,7,11,102,21,22,15,2,2,7,14,0,63,8,0,0,7,1,1,45,1,0,0,15,0,8,9,0,7,6,1,7,11,2,21,22,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,9,0,7,6,1,7,11,2,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,14,8,0,0,19,230,15,3,3,23,2,7,0,8,9,0,7,6,1,7,11,15,21,22,7,6,6,7,11,68,21,22,8,0,0,15,2,2,23,3,16,0,0,0,11,8,0,0,21,7,6,232,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,232,26],
[12,7,14,20,0,1,0,18,2,-1,9,1,7,0,8,9,0,7,6,1,7,11,114,21,22,7,6,6,7,11,233,21,5,3,3,22,16,0,0,0,11,8,0,0,21,7,6,234,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,234,26],
[12,7,14,20,0,1,0,23,1,-1,0,10,9,0,7,6,51,7,6,6,7,11,53,21,22,2,10,9,0,7,6,1,7,11,114,21,5,2,2,22,3,2,9,0,23,2,16,0,0,0,11,8,0,0,21,7,6,235,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,235,26],
[12,7,14,20,0,1,0,118,1,-1,0,8,9,0,7,6,1,7,11,236,21,22,7,14,0,17,0,10,9,0,7,8,0,0,7,6,6,7,11,114,21,22,7,6,1,7,11,235,21,22,7,14,0,11,8,0,0,7,11,237,21,7,6,6,7,11,115,21,22,2,26,8,1,0,7,6,1,7,6,6,7,0,10,9,0,7,6,51,7,6,6,7,11,115,21,22,2,4,11,34,21,3,3,11,114,21,5,3,6,22,3,50,0,11,8,0,0,7,11,237,21,7,6,6,7,11,53,21,22,2,3,8,1,0,3,36,0,8,8,1,0,7,6,1,7,11,238,21,22,2,26,8,1,0,7,6,1,7,6,6,7,0,10,9,0,7,6,51,7,6,6,7,11,115,21,22,2,4,11,34,21,3,3,11,114,21,5,3,6,22,3,2,8,1,0,15,4,2,23,2,16,0,0,0,11,8,0,0,21,7,6,239,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,239,26],
[12,7,14,20,0,1,0,70,1,-1,0,8,9,0,7,6,1,7,11,236,21,22,7,14,0,17,0,10,9,0,7,8,0,0,7,6,6,7,11,114,21,22,7,6,1,7,11,235,21,22,7,14,0,11,8,0,0,7,11,237,21,7,6,6,7,11,240,21,22,2,26,8,1,0,7,6,1,7,6,6,7,0,10,9,0,7,6,51,7,6,6,7,11,115,21,22,2,4,11,34,21,3,3,11,114,21,5,3,6,22,3,2,8,1,0,15,4,2,23,2,16,0,0,0,11,8,0,0,21,7,6,241,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,241,26],
[12,7,14,20,0,1,0,27,2,-1,0,17,0,10,9,1,7,9,0,7,6,6,7,11,186,21,22,7,6,1,7,11,241,21,22,7,9,0,7,6,6,7,11,183,21,5,3,3,22,16,0,0,0,11,8,0,0,21,7,6,242,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,242,26],
[12,7,14,20,0,1,0,28,1,-1,0,11,11,34,21,7,9,0,7,6,6,7,11,28,21,22,7,0,8,9,0,7,6,1,7,11,52,21,22,7,6,6,7,11,186,21,5,3,2,22,16,0,0,0,11,8,0,0,21,7,6,243,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,243,26],
[12,7,14,20,0,1,0,85,1,0,0,8,9,0,7,6,1,7,11,2,21,22,7,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,4,21,22,2,17,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,3,3,11,115,21,7,14,0,24,0,17,0,8,8,0,1,7,6,1,7,11,52,21,22,7,6,6,7,6,6,7,11,186,21,22,7,6,1,7,11,239,21,22,7,6,1,7,0,10,8,0,0,7,8,0,1,7,6,6,7,11,244,21,22,5,2,5,22,16,0,0,0,11,8,0,0,21,7,6,245,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,245,26],
[12,7,14,20,0,1,0,64,2,-1,0,8,9,0,7,6,1,7,11,32,21,22,2,19,9,1,7,0,8,9,0,7,6,1,7,11,232,21,22,7,6,6,7,11,246,21,5,3,3,22,3,36,0,19,9,1,7,0,10,9,0,7,6,12,7,6,6,7,11,119,21,22,7,6,6,7,11,246,21,22,7,0,8,9,0,7,6,1,7,11,16,21,22,7,6,6,7,11,119,21,5,3,3,22,23,3,16,0,0,0,11,8,0,0,21,7,6,244,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,244,26],
[12,7,14,20,0,1,0,291,2,-1,20,0,0,9,9,0,21,7,6,1,7,11,52,21,22,7,14,0,10,8,0,0,7,6,1,7,6,6,7,11,247,21,22,2,4,9,0,21,3,263,8,0,0,7,6,1,7,12,7,14,20,0,9,0,7,9,1,7,8,0,0,7,1,3,231,1,-1,0,10,9,0,7,6,6,7,6,6,7,11,115,21,22,2,76,0,30,0,8,9,0,7,6,1,7,11,248,21,22,2,3,9,0,3,11,0,10,9,0,7,6,1,7,6,6,7,11,114,21,22,7,6,6,7,6,6,7,11,186,21,22,7,14,0,8,8,0,0,7,6,1,7,10,0,21,22,7,14,0,17,0,10,9,0,7,8,1,0,7,6,6,7,11,114,21,22,7,6,1,7,10,0,21,22,7,14,0,12,10,1,7,8,1,0,7,8,0,0,7,6,29,7,11,249,21,22,15,6,2,3,144,0,10,9,0,7,6,6,7,6,6,7,11,7,21,22,2,94,0,9,10,2,21,7,6,1,7,11,2,21,22,7,0,9,10,2,21,7,6,1,7,11,10,21,22,7,10,2,21,7,14,0,9,10,2,21,7,6,1,7,11,11,21,22,18,2,0,9,8,0,1,7,8,0,2,7,6,6,7,10,1,22,2,29,0,10,8,0,0,7,8,0,1,7,6,6,7,11,86,21,22,0,17,0,8,8,0,0,7,6,1,7,11,3,21,22,7,8,0,2,7,6,6,7,11,86,21,22,3,2,12,0,17,0,8,8,0,0,7,6,1,7,11,3,21,22,7,12,7,6,6,7,11,87,21,22,8,0,0,15,4,4,3,40,0,10,9,0,7,6,1,7,6,6,7,11,7,21,22,2,28,10,2,21,7,14,0,9,10,2,21,7,6,1,7,11,3,21,22,18,2,0,10,8,0,0,7,12,7,6,6,7,11,87,21,22,8,0,0,15,2,2,3,2,12,23,2,16,0,0,0,11,8,0,0,21,7,6,13,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,5,2,5,22,15,2,2,23,3,16,0,0,0,11,8,0,0,21,7,6,246,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,246,26],
[12,7,14,20,0,1,0,287,3,-1,0,8,9,1,7,6,1,7,11,9,21,22,2,3,9,0,3,275,0,8,9,0,7,6,1,7,11,9,21,22,2,3,9,1,3,264,12,7,14,20,0,8,0,0,7,9,2,7,1,2,144,4,-1,0,23,0,8,9,1,7,6,1,7,11,2,21,22,7,0,8,9,2,7,6,1,7,11,2,21,22,7,6,6,7,10,0,22,2,57,9,0,2,12,0,10,9,3,7,9,1,7,6,6,7,11,87,21,22,3,2,12,0,8,9,1,7,6,1,7,11,3,21,22,2,23,9,1,7,9,2,7,0,8,9,1,7,6,1,7,11,3,21,22,7,12,7,6,137,7,10,1,21,5,5,5,22,3,11,9,1,7,9,2,7,6,6,7,11,87,21,5,3,5,22,3,63,0,8,9,0,7,6,1,7,11,9,21,22,2,12,0,10,9,3,7,9,2,7,6,6,7,11,87,21,22,3,2,12,0,8,9,2,7,6,1,7,11,3,21,22,2,23,9,2,7,0,8,9,2,7,6,1,7,11,3,21,22,7,9,1,7,13,7,6,137,7,10,1,21,5,5,5,22,3,11,9,2,7,9,1,7,6,6,7,11,87,21,5,3,5,22,23,5,16,0,0,0,23,0,8,9,0,7,6,1,7,11,2,21,22,7,0,8,9,1,7,6,1,7,11,2,21,22,7,6,6,7,9,2,22,2,44,0,8,9,0,7,6,1,7,11,3,21,22,2,23,0,21,9,0,7,9,1,7,0,8,9,0,7,6,1,7,11,3,21,22,7,12,7,6,137,7,8,0,0,21,22,3,11,0,10,9,0,7,9,1,7,6,6,7,11,87,21,22,9,0,3,43,0,8,9,1,7,6,1,7,11,3,21,22,2,23,0,21,9,1,7,0,8,9,1,7,6,1,7,11,3,21,22,7,9,0,7,13,7,6,137,7,8,0,0,21,22,3,11,0,10,9,1,7,9,0,7,6,6,7,11,87,21,22,9,1,15,2,2,23,4,16,0,0,0,11,8,0,0,21,7,6,249,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,249,26],
[12,7,14,20,0,1,0,20,3,-1,9,2,7,0,10,9,1,7,9,0,7,6,6,7,11,244,21,22,7,6,6,7,11,63,21,5,3,4,22,16,0,0,0,11,8,0,0,21,7,6,250,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,250,26],
[12,7,14,20,0,1,0,31,2,-1,0,12,9,1,7,6,51,7,9,0,7,6,29,7,11,125,21,22,7,0,10,9,1,7,9,0,7,6,6,7,11,125,21,22,7,6,6,7,11,5,21,5,3,3,22,16,0,0,0,11,8,0,0,21,7,6,251,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,251,26],
[1,0,174,1,-1,0,8,6,252,7,6,1,7,11,37,21,22,7,0,8,6,253,7,6,1,7,11,37,21,22,7,14,6,33,7,0,145,8,0,1,7,0,136,6,254,7,0,127,0,118,6,131,7,0,109,9,0,7,0,100,0,91,6,33,7,0,82,8,0,0,7,0,73,6,254,7,0,64,0,55,6,255,7,0,46,6,256,7,0,37,0,28,6,114,7,0,19,8,0,0,7,0,10,8,0,1,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,257,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,5,22,7,14,0,10,8,0,0,7,6,258,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,258,26],
[1,0,47,1,-1,6,131,7,0,37,6,259,7,0,28,0,19,6,258,7,0,10,9,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,2,22,7,14,0,10,8,0,0,7,6,260,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,260,26],
[1,0,47,1,-1,6,258,7,0,37,0,28,6,117,7,0,19,6,173,7,0,10,9,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,2,22,7,14,0,10,8,0,0,7,6,261,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,261,26],
[12,7,14,20,0,1,0,47,1,-1,0,8,9,0,7,6,1,7,11,16,21,22,7,14,0,10,8,0,0,7,6,17,7,6,6,7,11,7,21,22,7,14,8,0,0,2,3,8,0,0,3,19,0,10,8,1,0,7,6,229,7,6,6,7,11,7,21,22,7,14,8,0,0,2,3,8,0,0,3,2,12,15,2,2,15,4,2,23,2,16,0,0,0,11,8,0,0,21,7,6,262,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,262,26],
[12,7,14,20,0,1,0,16,1,-1,0,6,6,51,7,11,263,21,22,7,9,0,7,6,6,7,11,114,21,5,3,2,22,16,0,0,0,11,8,0,0,21,7,6,264,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,264,26],
[12,7,14,20,0,1,0,18,1,-1,0,8,9,0,7,6,1,7,11,264,21,22,7,6,265,7,6,6,7,11,186,21,5,3,2,22,16,0,0,0,11,8,0,0,21,7,6,266,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,266,26],
[12,7,14,20,0,1,0,18,1,-1,0,8,9,0,7,6,1,7,11,264,21,22,7,6,267,7,6,6,7,11,186,21,5,3,2,22,16,0,0,0,11,8,0,0,21,7,6,268,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,268,26],
[12,7,14,20,0,1,0,18,1,-1,0,8,9,0,7,6,1,7,11,264,21,22,7,6,269,7,6,6,7,11,186,21,5,3,2,22,16,0,0,0,11,8,0,0,21,7,6,270,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,270,26],
[12,7,14,20,0,1,0,72,2,-1,12,7,12,7,14,20,0,20,1,9,0,7,9,1,7,8,0,0,7,8,0,1,7,1,4,54,0,-1,0,34,10,0,21,2,24,0,22,0,9,10,1,21,7,6,1,7,11,264,21,22,7,0,5,6,51,7,10,2,22,7,6,6,7,11,53,21,22,3,2,12,7,6,1,7,11,9,21,22,2,15,0,5,6,51,7,10,3,22,18,0,0,6,6,51,7,11,263,21,22,18,1,3,2,12,10,0,21,23,1,15,3,3,23,3,16,0,0,0,11,8,0,0,21,7,6,271,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,271,26],
[1,0,101,3,2,6,272,7,0,91,9,2,7,0,82,0,73,6,271,7,0,64,0,28,6,19,7,0,19,12,7,0,10,9,1,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,28,0,19,6,19,7,0,10,12,7,9,0,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,4,22,7,14,0,10,8,0,0,7,6,273,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,273,26],
[1,0,56,1,-1,6,274,7,0,46,6,275,7,0,37,0,28,6,19,7,0,19,12,7,0,10,9,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,2,22,7,14,0,10,8,0,0,7,6,276,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,276,26],
[12,7,14,20,0,1,0,33,1,-1,9,0,7,6,1,7,1,0,26,1,0,1,0,3,1,-1,12,23,2,7,9,0,7,1,1,12,0,-1,11,277,21,7,10,0,7,6,6,7,11,28,21,5,3,1,22,7,6,6,7,11,274,21,5,3,2,22,5,2,2,22,16,0,0,0,11,8,0,0,21,7,6,278,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,278,26],
[12,7,14,20,0,1,0,55,1,-1,0,32,9,0,7,6,1,7,1,0,26,1,0,1,0,3,1,-1,12,23,2,7,9,0,7,1,1,12,0,-1,11,279,21,7,10,0,7,6,6,7,11,28,21,5,3,1,22,7,6,6,7,11,274,21,5,3,2,22,22,7,14,8,0,0,2,3,8,0,0,3,15,0,6,6,51,7,11,79,21,22,7,14,8,0,0,2,3,8,0,0,3,2,12,15,2,2,15,2,2,23,2,16,0,0,0,11,8,0,0,21,7,6,280,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,280,26],
[12,7,14,20,0,1,0,51,1,0,0,8,9,0,7,6,1,7,11,4,21,22,2,10,0,8,9,0,7,6,1,7,11,2,21,22,3,7,0,6,6,51,7,11,263,21,22,7,14,0,17,6,29,7,0,8,8,0,0,7,6,1,7,11,281,21,22,7,6,6,7,11,65,21,22,7,6,1,7,11,62,21,5,2,4,22,16,0,0,0,11,8,0,0,21,7,6,282,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,282,26],
[12,7,14,20,0,1,0,132,1,0,0,8,9,0,7,6,1,7,11,4,21,22,2,10,0,8,9,0,7,6,1,7,11,2,21,22,3,7,0,6,6,51,7,11,263,21,22,7,14,0,8,8,0,0,7,6,1,7,11,282,21,22,7,14,0,8,8,0,0,7,6,1,7,11,2,21,22,7,0,15,0,8,8,0,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,8,0,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,14,8,0,2,7,6,283,7,0,10,8,0,1,7,6,173,7,6,6,7,11,53,21,22,2,3,6,284,3,2,12,7,8,0,1,7,6,283,7,0,10,8,0,0,7,6,173,7,6,6,7,11,53,21,22,2,3,6,284,3,2,12,7,8,0,0,7,6,285,7,11,124,21,5,8,10,22,16,0,0,0,11,8,0,0,21,7,6,286,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,286,26],
[12,7,14,20,0,1,0,55,2,-1,6,51,7,0,8,9,1,7,6,1,7,11,56,21,22,7,14,20,1,0,37,9,0,7,8,0,1,7,8,0,0,7,1,2,24,1,-1,0,7,9,0,7,6,1,7,10,0,22,2,14,0,11,10,1,21,7,6,1,7,6,6,7,11,34,21,22,18,1,3,2,12,23,2,7,6,6,7,11,122,21,22,8,0,1,21,15,3,3,23,3,16,0,0,0,11,8,0,0,21,7,6,287,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,287,26],
[12,7,14,20,0,1,0,88,1,0,0,8,9,0,7,6,1,7,11,2,21,22,7,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,4,21,22,2,17,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,3,2,6,288,7,14,0,17,0,8,8,0,1,7,6,1,7,11,52,21,22,7,8,0,0,7,6,6,7,11,247,21,22,2,3,8,0,1,3,22,0,12,8,0,1,7,6,51,7,8,0,0,7,6,29,7,11,125,21,22,7,6,289,7,6,6,7,11,34,21,5,3,5,22,15,3,3,23,2,16,0,0,0,11,8,0,0,21,7,6,290,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,290,26],
[12,7,14,20,0,1,0,22,1,-1,0,15,0,8,9,0,7,6,1,7,11,52,21,22,7,6,1,7,11,192,21,22,7,6,1,7,9,0,5,2,2,22,16,0,0,0,11,8,0,0,21,7,6,291,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,291,26],
[1,0,38,2,1,6,49,7,0,28,0,19,6,9,7,0,10,9,1,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,9,0,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,3,22,7,14,0,10,8,0,0,7,6,292,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,292,26],
[12,7,14,20,0,1,0,178,1,0,0,8,9,0,7,6,1,7,11,2,21,22,7,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,0,29,0,22,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,4,21,22,2,31,0,29,0,22,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,3,2,6,51,7,14,0,12,8,0,3,7,8,0,1,7,8,0,0,7,6,29,7,11,172,21,22,7,0,12,8,0,2,7,8,0,1,7,8,0,0,7,6,29,7,11,172,21,22,7,14,8,0,1,2,35,0,8,8,0,0,7,6,1,7,11,9,21,22,7,14,8,0,0,2,3,8,0,0,3,19,0,10,8,1,1,7,8,1,0,7,6,6,7,11,53,21,22,7,14,8,0,0,2,3,8,0,0,3,2,12,15,2,2,15,2,2,3,2,12,15,8,5,23,2,16,0,0,0,11,8,0,0,21,7,6,293,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,293,26],
[12,7,14,20,0,1,0,87,1,0,9,0,7,1,1,83,1,0,10,0,7,6,1,7,12,7,14,20,0,8,0,0,7,9,0,7,1,2,53,1,-1,9,0,2,49,0,17,0,8,9,0,7,6,1,7,11,2,21,22,7,10,0,7,6,6,7,11,28,21,22,7,14,8,0,0,2,3,8,0,0,3,24,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,10,1,21,22,7,14,8,0,0,2,3,8,0,0,3,2,12,15,2,2,15,2,2,3,2,12,23,2,16,0,0,0,11,8,0,0,21,7,6,13,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,5,2,2,22,23,2,16,0,0,0,11,8,0,0,21,7,6,294,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,294,26],
[12,7,14,20,0,1,0,116,1,0,9,0,7,1,1,112,1,0,10,0,7,6,1,7,12,7,14,20,0,8,0,0,7,9,0,7,1,2,82,1,-1,0,8,9,0,7,6,1,7,11,9,21,22,2,3,13,3,70,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,9,21,22,2,19,0,8,9,0,7,6,1,7,11,2,21,22,7,10,0,7,6,6,7,11,28,21,5,3,2,22,3,36,0,17,0,8,9,0,7,6,1,7,11,2,21,22,7,10,0,7,6,6,7,11,28,21,22,2,17,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,10,1,21,5,2,2,22,3,2,12,23,2,16,0,0,0,11,8,0,0,21,7,6,13,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,5,2,2,22,23,2,16,0,0,0,11,8,0,0,21,7,6,295,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,295,26],
[12,7,14,20,0,1,0,27,2,-1,9,1,7,0,17,0,8,9,0,7,6,1,7,11,52,21,22,7,6,6,7,6,6,7,11,114,21,22,7,6,6,7,11,115,21,5,3,3,22,16,0,0,0,11,8,0,0,21,7,6,296,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,296,26],
[12,7,14,20,0,1,0,20,2,-1,6,51,7,0,10,9,1,7,9,0,7,6,6,7,11,297,21,22,7,6,6,7,11,7,21,5,3,3,22,16,0,0,0,11,8,0,0,21,7,6,298,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,298,26],
[1,0,29,1,0,6,9,7,0,19,0,10,6,38,7,9,0,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,2,22,7,14,0,10,8,0,0,7,6,299,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,299,26],
[1,0,29,1,0,6,9,7,0,19,0,10,6,159,7,9,0,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,2,22,7,14,0,10,8,0,0,7,6,300,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,300,26],
[12,7,14,20,0,1,0,28,2,-1,9,0,7,9,1,7,1,2,22,2,-1,0,7,9,1,7,6,1,7,10,1,22,7,0,7,9,0,7,6,1,7,10,1,22,7,6,6,7,10,0,5,3,3,22,23,3,16,0,0,0,11,8,0,0,21,7,6,301,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,301,26],
[12,7,14,20,0,1,0,27,1,-1,9,0,7,1,1,23,1,0,0,8,9,0,7,6,1,7,11,2,21,22,2,12,10,0,7,9,0,7,6,6,7,11,28,21,5,3,2,22,3,2,12,23,2,23,2,16,0,0,0,11,8,0,0,21,7,6,302,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,302,26],
[1,0,165,3,-1,0,8,6,46,7,6,1,7,11,37,21,22,7,0,8,6,132,7,6,1,7,11,37,21,22,7,14,6,103,7,0,136,0,37,8,0,1,7,0,28,9,2,7,0,19,8,0,0,7,0,10,9,1,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,91,0,82,6,42,7,0,73,0,19,8,0,1,7,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,46,0,28,6,12,7,0,19,8,0,0,7,0,10,9,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,10,9,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,7,22,7,14,0,10,8,0,0,7,6,303,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,303,26],
[12,7,14,20,0,8,0,0,7,1,1,137,3,-1,0,8,9,2,7,6,1,7,11,9,21,22,2,12,9,1,7,9,0,7,6,6,7,11,129,21,5,3,4,22,3,116,0,10,9,2,7,6,51,7,6,6,7,11,247,21,22,7,14,8,0,0,2,3,8,0,0,3,17,0,8,9,0,7,6,1,7,11,9,21,22,7,14,8,0,0,2,3,8,0,0,3,2,12,15,2,2,15,2,2,2,3,12,3,80,0,14,0,8,9,0,7,6,1,7,11,2,21,22,7,6,1,7,9,1,22,2,46,0,8,9,0,7,6,1,7,11,2,21,22,7,0,28,0,10,9,2,7,6,1,7,6,6,7,11,114,21,22,7,9,1,7,0,8,9,0,7,6,1,7,11,3,21,22,7,6,29,7,10,0,21,22,7,6,6,7,11,12,21,5,3,4,22,3,20,9,2,7,9,1,7,0,8,9,0,7,6,1,7,11,3,21,22,7,6,29,7,10,0,21,5,4,4,22,23,4,16,0,0,0,11,8,0,0,21,7,6,304,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,304,26],
[12,7,14,20,0,1,0,28,1,-1,0,8,9,0,7,6,1,7,11,4,21,22,2,17,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,9,21,5,2,2,22,3,2,12,23,2,16,0,0,0,11,8,0,0,21,7,6,305,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,305,26],
[12,7,14,20,0,1,0,51,2,-1,9,0,2,47,0,8,9,0,7,6,1,7,11,2,21,22,7,0,29,9,1,7,1,1,11,1,-1,10,0,7,9,0,7,6,6,7,11,5,21,5,3,2,22,7,0,8,9,0,7,6,1,7,11,3,21,22,7,6,6,7,11,99,21,22,7,6,6,7,11,12,21,5,3,3,22,3,2,12,23,3,16,0,0,0,11,8,0,0,21,7,6,306,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,306,26],
[12,7,14,20,0,1,0,76,1,-1,0,6,6,51,7,11,79,21,22,7,14,0,64,9,0,7,8,0,0,7,1,1,53,1,-1,10,0,7,14,9,0,7,14,6,51,7,14,6,1,7,14,0,18,0,9,8,2,0,7,8,1,0,7,6,6,7,8,3,0,22,7,8,0,0,7,6,6,7,11,34,21,22,7,6,1,7,8,2,0,7,8,3,0,7,1,2,13,1,-1,10,0,7,9,0,7,10,1,7,6,29,7,11,82,21,5,4,2,22,5,2,10,22,7,6,6,7,11,122,21,22,8,0,0,15,2,2,23,2,16,0,0,0,11,8,0,0,21,7,6,307,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,307,26],
[12,7,14,20,0,1,0,16,1,-1,0,8,9,0,7,6,1,7,11,308,21,22,7,6,1,7,11,307,21,5,2,2,22,16,0,0,0,11,8,0,0,21,7,6,309,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,309,26],
[12,7,14,20,0,1,0,28,1,-1,0,18,11,115,21,7,0,8,9,0,7,6,1,7,11,307,21,22,7,6,6,7,11,301,21,22,7,9,0,7,6,6,7,11,205,21,5,3,2,22,16,0,0,0,11,8,0,0,21,7,6,310,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,310,26],
[12,7,14,20,0,1,0,115,1,0,0,8,9,0,7,6,1,7,11,2,21,22,7,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,4,21,22,2,17,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,3,3,11,311,21,7,14,0,27,8,0,0,7,8,0,1,7,6,6,7,1,0,19,1,0,0,11,11,68,21,7,9,0,7,6,6,7,11,28,21,22,7,6,1,7,11,307,21,5,2,2,22,22,7,14,0,31,11,115,21,7,8,1,0,7,8,0,0,7,1,2,17,1,0,0,10,10,1,7,9,0,7,6,6,7,11,28,21,22,7,6,1,7,10,0,5,2,2,22,7,6,6,7,11,301,21,22,7,8,1,1,7,6,6,7,11,244,21,5,3,7,22,16,0,0,0,11,8,0,0,21,7,6,312,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,312,26],
[12,7,14,20,0,8,0,0,7,1,1,70,2,-1,0,8,9,0,7,6,1,7,11,11,21,22,2,50,9,1,7,0,39,0,23,0,8,9,0,7,6,1,7,11,2,21,22,7,0,8,9,0,7,6,1,7,11,10,21,22,7,6,6,7,9,1,22,7,0,8,9,0,7,6,1,7,11,11,21,22,7,6,6,7,11,12,21,22,7,6,6,7,10,0,21,5,3,3,22,3,11,9,1,7,9,0,7,6,6,7,11,28,21,5,3,3,22,23,3,16,0,0,0,11,8,0,0,21,7,6,313,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,313,26],
[12,7,14,20,0,8,0,0,7,1,1,54,2,-1,0,8,9,0,7,6,1,7,11,11,21,22,2,34,0,8,9,0,7,6,1,7,11,2,21,22,7,0,17,9,1,7,0,8,9,0,7,6,1,7,11,3,21,22,7,6,6,7,10,0,21,22,7,6,6,7,9,1,5,3,3,22,3,11,9,1,7,9,0,7,6,6,7,11,28,21,5,3,3,22,23,3,16,0,0,0,11,8,0,0,21,7,6,314,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,314,26],
[12,7,14,20,0,1,0,23,1,-1,0,8,9,0,7,6,1,7,11,262,21,22,2,12,9,0,7,6,51,7,6,6,7,11,115,21,5,3,2,22,3,2,12,23,2,16,0,0,0,11,8,0,0,21,7,6,315,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,315,26],
[1,0,47,2,1,6,33,7,0,37,9,1,7,0,28,6,316,7,0,19,9,0,7,0,10,9,1,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,34,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,3,22,7,14,0,10,8,0,0,7,6,317,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,317,26],
[12,7,14,20,0,1,0,41,1,-1,0,24,0,17,0,8,9,0,7,6,1,7,11,52,21,22,7,6,6,7,6,6,7,11,186,21,22,7,6,1,7,11,236,21,22,7,6,1,7,0,11,11,115,21,7,9,0,7,6,6,7,11,244,21,22,5,2,2,22,16,0,0,0,11,8,0,0,21,7,6,318,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,318,26],
[1,0,174,4,3,0,8,6,319,7,6,1,7,11,37,21,22,7,0,8,6,320,7,6,1,7,11,37,21,22,7,14,6,103,7,0,145,0,28,8,0,1,7,0,19,9,3,7,0,10,8,0,0,7,6,321,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,109,0,100,6,123,7,0,91,9,2,7,0,82,9,1,7,0,73,0,64,6,44,7,0,55,0,46,6,298,7,0,37,0,19,6,146,7,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,10,8,0,1,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,322,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,9,0,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,323,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,8,22,7,14,0,10,8,0,0,7,6,324,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,324,26],
[1,0,174,2,1,0,8,6,36,7,6,1,7,11,37,21,22,7,0,8,6,325,7,6,1,7,11,37,21,22,7,14,6,326,7,0,145,0,136,6,19,7,0,127,0,10,8,0,1,7,12,7,6,6,7,11,12,21,22,7,0,109,0,100,6,33,7,0,91,9,1,7,0,82,0,73,6,19,7,0,64,0,28,0,19,6,327,7,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,0,28,0,19,8,0,1,7,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,9,0,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,6,22,7,14,0,10,8,0,0,7,6,328,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,328,26],
[1,0,20,1,0,6,328,7,0,10,6,329,7,9,0,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,2,22,7,14,0,10,8,0,0,7,6,330,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,330,26],
[12,7,14,20,0,1,0,203,1,-1,1,0,95,1,-1,0,10,9,0,7,6,17,7,6,6,7,11,119,21,22,7,14,0,12,6,331,7,8,0,0,7,6,332,7,6,29,7,11,53,21,22,7,14,8,0,0,2,3,8,0,0,3,40,0,12,6,333,7,8,1,0,7,6,334,7,6,29,7,11,53,21,22,7,14,8,0,0,2,3,8,0,0,3,21,0,12,6,334,7,8,2,0,7,6,335,7,6,29,7,11,53,21,22,7,14,8,0,0,2,3,8,0,0,3,2,12,15,2,2,15,2,2,15,2,2,2,21,0,10,8,0,0,7,6,336,7,6,6,7,11,34,21,22,7,6,337,7,6,6,7,11,119,21,5,3,4,22,3,2,9,0,15,2,2,23,2,7,14,0,8,9,0,7,6,1,7,11,16,21,22,7,14,0,10,8,0,0,7,6,124,7,6,6,7,11,7,21,22,2,12,8,1,0,7,9,0,7,6,6,7,11,68,21,5,3,6,22,3,72,0,10,8,0,0,7,6,337,7,6,6,7,11,7,21,22,2,9,9,0,7,6,1,7,8,1,0,5,2,6,22,3,53,0,10,8,0,0,7,6,90,7,6,6,7,11,7,21,22,2,32,9,0,2,28,0,19,8,1,0,7,0,10,9,0,7,6,124,7,6,6,7,11,119,21,22,7,6,6,7,11,68,21,22,7,6,1,7,11,90,21,5,2,6,22,3,2,12,3,11,6,338,7,9,0,7,6,6,7,11,102,21,5,3,6,22,15,4,2,23,2,16,0,0,0,11,8,0,0,21,7,6,339,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,339,26],
[12,7,14,20,0,1,0,203,1,-1,1,0,95,1,-1,0,10,9,0,7,6,17,7,6,6,7,11,119,21,22,7,14,0,12,6,340,7,8,0,0,7,6,341,7,6,29,7,11,53,21,22,7,14,8,0,0,2,3,8,0,0,3,40,0,12,6,335,7,8,1,0,7,6,342,7,6,29,7,11,53,21,22,7,14,8,0,0,2,3,8,0,0,3,21,0,12,6,342,7,8,2,0,7,6,343,7,6,29,7,11,53,21,22,7,14,8,0,0,2,3,8,0,0,3,2,12,15,2,2,15,2,2,15,2,2,2,21,0,10,8,0,0,7,6,336,7,6,6,7,11,114,21,22,7,6,337,7,6,6,7,11,119,21,5,3,4,22,3,2,9,0,15,2,2,23,2,7,14,0,8,9,0,7,6,1,7,11,16,21,22,7,14,0,10,8,0,0,7,6,124,7,6,6,7,11,7,21,22,2,12,8,1,0,7,9,0,7,6,6,7,11,68,21,5,3,6,22,3,72,0,10,8,0,0,7,6,337,7,6,6,7,11,7,21,22,2,9,9,0,7,6,1,7,8,1,0,5,2,6,22,3,53,0,10,8,0,0,7,6,90,7,6,6,7,11,7,21,22,2,32,9,0,2,28,0,19,8,1,0,7,0,10,9,0,7,6,124,7,6,6,7,11,119,21,22,7,6,6,7,11,68,21,22,7,6,1,7,11,90,21,5,2,6,22,3,2,6,344,3,11,6,345,7,9,0,7,6,6,7,11,102,21,5,3,6,22,15,4,2,23,2,16,0,0,0,11,8,0,0,21,7,6,346,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,346,26],
[12,7,14,20,0,1,0,80,1,0,0,8,9,0,7,6,1,7,11,2,21,22,7,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,4,21,22,2,17,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,3,2,6,1,7,14,0,19,0,10,8,0,1,7,6,17,7,6,6,7,11,119,21,22,7,8,0,0,7,6,6,7,11,34,21,22,7,0,8,8,0,1,7,6,1,7,11,16,21,22,7,6,6,7,11,119,21,5,3,5,22,16,0,0,0,11,8,0,0,21,7,6,347,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,347,26],
[12,7,14,20,0,8,0,0,7,1,1,41,2,-1,0,10,9,1,7,9,0,7,6,6,7,11,115,21,22,2,3,12,3,27,9,1,7,0,17,0,8,9,1,7,6,1,7,11,347,21,22,7,9,0,7,6,6,7,10,0,21,22,7,6,6,7,11,12,21,5,3,3,22,23,3,16,0,0,0,11,8,0,0,21,7,6,193,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,193,26],
[12,7,14,20,0,1,0,205,2,-1,4,3,7,6,1,7,9,0,7,9,1,7,1,2,194,1,-1,9,0,7,1,1,29,1,0,0,8,9,0,7,6,1,7,11,4,21,22,2,10,0,8,9,0,7,6,1,7,11,2,21,22,3,2,12,7,14,8,0,0,7,6,1,7,10,0,5,2,4,22,7,14,10,0,7,14,12,7,6,51,7,0,26,0,17,0,8,8,0,0,7,6,1,7,11,52,21,22,7,6,1,7,6,6,7,11,114,21,22,7,6,1,7,6,6,7,11,34,21,22,7,14,20,2,8,0,1,16,0,2,0,11,8,0,2,21,7,8,0,0,7,6,6,7,11,53,21,22,7,6,1,7,12,7,14,20,0,8,1,0,7,8,0,0,7,8,3,0,7,10,1,7,8,1,2,7,8,2,0,7,1,6,75,1,-1,9,0,2,71,0,8,10,1,21,7,6,1,7,10,0,22,7,14,0,17,8,0,0,7,0,8,10,1,21,7,6,1,7,10,2,22,7,6,6,7,11,31,21,22,2,10,0,8,10,1,21,7,6,1,7,10,3,22,3,2,12,15,2,2,0,11,10,1,21,7,6,1,7,6,6,7,11,34,21,22,18,1,0,11,10,1,21,7,10,5,7,6,6,7,11,53,21,22,7,6,1,7,10,4,21,5,2,2,22,3,2,12,23,2,16,0,0,0,11,8,0,0,21,7,6,348,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,5,2,10,22,5,2,3,22,16,0,0,0,11,8,0,0,21,7,6,349,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,349,26],
[12,7,14,20,0,1,0,54,1,-1,0,6,6,51,7,11,79,21,22,7,14,0,42,9,0,7,8,0,0,7,1,1,31,1,-1,10,0,7,9,0,7,13,7,14,8,0,0,7,6,1,7,8,0,1,7,8,0,2,7,1,2,13,1,-1,10,0,7,9,0,7,10,1,7,6,29,7,11,82,21,5,4,2,22,5,2,6,22,7,6,6,7,11,122,21,22,8,0,0,15,2,2,23,2,16,0,0,0,11,8,0,0,21,7,6,350,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,350,26],
[6,351,19,352,26],
[1,0,305,1,0,0,8,6,353,7,6,1,7,11,37,21,22,7,0,8,6,354,7,6,1,7,11,37,21,22,7,14,6,33,7,0,276,8,0,0,7,0,267,12,7,0,258,0,249,6,43,7,0,240,8,0,0,7,8,0,1,7,1,2,227,1,-1,6,33,7,0,217,10,0,7,0,208,0,19,6,355,7,0,10,9,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,181,0,172,6,45,7,0,163,0,19,6,7,7,0,10,10,0,7,6,356,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,136,0,127,6,42,7,0,118,10,1,7,0,109,0,28,6,217,7,0,19,6,352,7,0,10,10,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,73,0,64,6,43,7,0,55,0,19,6,152,7,0,10,10,1,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,28,0,19,6,217,7,0,10,10,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,2,22,7,9,0,7,6,6,7,11,68,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,5,22,7,14,0,10,8,0,0,7,6,357,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,357,26],
[12,7,14,20,0,1,0,18,2,-1,0,8,9,1,7,6,1,7,11,52,21,22,7,9,0,7,6,6,7,11,53,21,5,3,3,22,16,0,0,0,11,8,0,0,21,7,6,358,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,358,26],
[12,7,14,20,0,1,0,18,2,-1,0,8,9,1,7,6,1,7,11,52,21,22,7,9,0,7,6,6,7,11,115,21,5,3,3,22,16,0,0,0,11,8,0,0,21,7,6,359,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,359,26],
[1,0,105,2,1,0,8,6,36,7,6,1,7,11,37,21,22,7,14,0,76,6,360,7,0,67,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,0,49,0,40,6,44,7,0,31,8,0,0,7,0,22,8,0,0,7,1,1,11,1,-1,9,0,7,10,0,7,6,6,7,11,5,21,5,3,2,22,7,9,0,7,6,6,7,11,68,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,10,9,1,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,5,22,7,14,0,10,8,0,0,7,6,361,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,361,26],
[1,0,133,2,-1,0,8,9,1,7,6,1,7,11,100,21,22,7,14,0,8,8,0,0,7,6,1,7,11,2,21,22,7,0,15,0,8,8,0,0,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,8,0,0,7,6,1,7,11,3,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,14,6,133,7,0,64,8,0,2,7,0,55,0,46,6,38,7,0,37,8,0,1,7,0,28,0,19,8,0,0,7,0,10,9,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,9,22,7,14,0,10,8,0,0,7,6,362,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,362,26],
[0,6,6,51,7,11,79,21,22,19,363,26],
[1,0,290,3,2,6,43,7,0,280,0,55,6,362,7,0,46,0,37,6,363,7,0,28,0,19,6,83,7,0,10,9,2,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,364,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,217,0,208,6,67,7,0,199,9,2,7,0,190,6,365,7,0,181,0,172,6,366,7,0,163,0,55,6,160,7,0,46,0,37,6,363,7,0,28,0,19,6,83,7,0,10,9,2,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,367,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,100,6,368,7,0,91,0,82,6,366,7,0,73,6,369,7,0,64,0,19,6,28,7,0,10,9,2,7,6,370,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,37,0,28,6,33,7,0,19,9,1,7,0,10,6,365,7,9,0,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,4,22,7,14,0,10,8,0,0,7,6,371,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,371,26],
[1,0,119,4,3,6,106,7,0,109,0,73,0,37,6,363,7,0,28,0,19,6,83,7,0,10,9,3,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,28,0,19,6,83,7,0,10,9,1,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,28,0,19,6,19,7,0,10,9,2,7,9,0,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,5,22,7,14,0,10,8,0,0,7,6,372,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,372,26],
[0,6,6,51,7,11,79,21,22,19,373,26],
[1,0,65,2,-1,6,106,7,0,55,0,37,6,373,7,0,28,0,19,6,83,7,0,10,9,1,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,10,9,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,3,22,7,14,0,10,8,0,0,7,6,374,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,374,26],
[12,7,14,20,0,1,0,12,1,-1,9,0,7,1,1,8,1,-1,10,0,7,6,1,7,9,0,5,2,2,22,23,2,16,0,0,0,11,8,0,0,21,7,6,95,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,95,26],
[1,0,147,2,-1,0,8,6,153,7,6,1,7,11,37,21,22,7,14,6,33,7,0,127,8,0,0,7,0,118,9,1,7,0,109,0,91,6,49,7,0,82,0,37,6,9,7,0,28,0,19,9,0,7,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,37,0,28,6,106,7,0,19,8,0,0,7,0,10,9,1,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,5,22,7,14,0,10,8,0,0,7,6,375,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,375,26],
[12,7,14,20,0,1,0,163,1,-1,0,8,9,0,7,6,1,7,11,376,21,22,2,3,12,3,151,0,15,0,8,9,0,7,6,1,7,11,52,21,22,7,6,1,7,11,192,21,22,7,14,20,0,0,131,4,0,7,6,1,7,8,0,0,7,9,0,7,1,2,121,1,-1,9,0,7,1,1,29,1,0,0,8,9,0,7,6,1,7,11,4,21,22,2,10,0,8,9,0,7,6,1,7,11,2,21,22,3,2,12,7,14,8,0,0,7,6,1,7,10,0,5,2,4,22,7,14,10,0,7,8,0,0,7,10,1,7,1,2,74,1,0,0,15,0,8,9,0,7,6,1,7,11,2,21,22,7,6,1,7,11,2,21,22,7,0,22,0,15,0,8,9,0,7,6,1,7,11,2,21,22,7,6,1,7,11,3,21,22,7,6,1,7,11,2,21,22,7,14,0,21,0,11,10,0,21,7,6,1,7,6,6,7,11,114,21,22,18,0,7,6,377,7,6,6,7,11,7,21,22,2,9,8,0,1,7,6,1,7,10,1,5,2,5,22,3,2,12,15,3,3,23,2,7,6,6,7,11,122,21,5,3,4,22,22,15,2,2,23,2,16,0,0,0,11,8,0,0,21,7,6,378,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,378,26],
[12,7,14,20,0,1,0,39,2,-1,0,8,9,0,7,6,1,7,11,376,21,22,2,3,6,51,3,27,0,10,9,1,7,9,0,7,6,6,7,11,287,21,22,7,0,8,9,0,7,6,1,7,11,52,21,22,7,6,6,7,11,186,21,5,3,3,22,23,3,16,0,0,0,11,8,0,0,21,7,6,379,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,379,26],
[12,7,14,20,0,1,0,29,1,-1,9,0,7,6,51,7,0,17,0,8,9,0,7,6,1,7,11,52,21,22,7,6,1,7,6,6,7,11,114,21,22,7,6,29,7,11,125,21,5,4,2,22,16,0,0,0,11,8,0,0,21,7,6,380,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,380,26],
[1,0,138,4,3,0,8,6,381,7,6,1,7,11,37,21,22,7,14,6,33,7,0,118,8,0,0,7,0,109,13,7,0,100,0,91,6,123,7,0,82,9,3,7,0,73,9,2,7,0,64,0,55,6,42,7,0,46,8,0,0,7,0,37,0,19,6,150,7,0,10,8,0,0,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,10,9,1,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,9,0,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,7,22,7,14,0,10,8,0,0,7,6,382,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,382,26],
[12,7,14,20,0,1,0,12,1,-1,11,2,21,7,9,0,7,6,6,7,11,68,21,5,3,2,22,16,0,0,0,11,8,0,0,21,7,6,383,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,383,26],
[12,7,14,20,0,1,0,12,1,-1,11,3,21,7,9,0,7,6,6,7,11,68,21,5,3,2,22,16,0,0,0,11,8,0,0,21,7,6,384,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,384,26],
[1,0,56,3,2,6,68,7,0,46,0,28,6,19,7,0,19,0,10,9,2,7,12,7,6,6,7,11,12,21,22,7,9,0,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,10,9,1,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,4,22,7,14,0,10,8,0,0,7,6,385,7,6,6,7,11,14,21,22,0,10,6,22,7,8,0,0,7,6,6,7,11,23,21,22,15,2,2,19,385,26],
[12,7,14,20,0,8,0,0,7,1,1,78,2,-1,0,10,9,1,7,9,0,7,6,6,7,11,7,21,22,2,3,9,1,3,64,0,10,9,1,7,9,0,7,6,6,7,11,115,21,22,2,21,0,10,9,1,7,9,0,7,6,6,7,11,114,21,22,7,9,0,7,6,6,7,10,0,21,5,3,3,22,3,33,0,10,9,0,7,9,1,7,6,6,7,11,115,21,22,2,21,9,1,7,0,10,9,0,7,9,1,7,6,6,7,11,114,21,22,7,6,6,7,10,0,21,5,3,3,22,3,2,12,23,3,16,0,0,0,11,8,0,0,21,7,6,386,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,19,386,26],
[0,308,6,174,7,0,299,0,8,6,387,7,6,1,7,11,176,21,22,7,11,177,21,7,12,7,14,20,0,1,0,261,1,-1,1,0,33,1,-1,9,0,7,14,0,10,8,0,0,7,6,388,7,6,6,7,11,7,21,22,2,3,6,2,3,15,0,10,8,0,0,7,6,389,7,6,6,7,11,7,21,22,2,3,6,3,3,2,12,15,2,2,23,2,7,14,6,33,7,0,216,6,390,7,0,207,0,124,6,19,7,0,115,6,391,7,0,106,0,97,0,17,0,8,9,0,7,6,1,7,11,124,21,22,7,6,12,7,6,6,7,11,119,21,22,7,6,1,7,12,7,14,20,0,8,0,0,7,8,1,0,7,1,2,52,1,-1,9,0,2,48,0,14,0,8,9,0,7,6,1,7,11,2,21,22,7,6,1,7,10,0,22,7,0,24,0,15,0,8,9,0,7,6,1,7,11,3,21,22,7,6,1,7,10,1,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,2,22,3,2,6,392,23,2,16,0,0,0,11,8,0,0,21,7,6,13,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,0,75,0,66,6,14,7,0,57,6,390,7,0,48,0,39,6,83,7,0,30,0,21,0,12,6,393,7,9,0,7,6,394,7,6,29,7,11,34,21,22,7,6,90,7,6,6,7,11,119,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,12,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,395,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,22,7,6,6,7,11,12,21,5,3,4,22,16,0,0,0,11,8,0,0,21,7,6,396,7,6,6,7,11,14,21,22,8,0,0,21,15,2,2,7,6,29,7,11,5,21,22,7,6,6,7,11,23,21,22,19,396,0,11,11,177,21,7,6,1,7,6,6,7,11,34,21,22,19,177,11,396,21,26],
]);
preload_vals.push(["arc.core","1","car","cdr","acons","list","2","is","%pair","no","cadr","cddr","cons","self","fn-name","pair","type","int","exact","fn","(_)","make-br-fn","mac","annotate","atom","caar","assoc","alref","apply","3","join","isnt","alist","let","+","ret","g","uniq","or","map1","in","iso","if","do","when","unless","gf","gp","rfn","while","reclist","0","len","<","recstring","isa","testify","carif","some","complement","all","find","rev","firstn","lastn","nthcdr","tuples","def","map","defs","caris","\"Warning: \"","\". \"","disp","write","\" \"","#\\n","ewline","warn","table","setter","gexpr","sref","quote","defset","(val)","scar","scdr","compose","macex","sym","h","assign","metafn","expand-metafn-call","get","cadar","ref","\"Inverting what looks like a function call\"","mappend","setforms","\"Can't invert \"","err","with","expand=","expand=list","=","looper","loop-flag","loop","gi","gm","(1)","for","-",">","down","repeat","forlen","coerce","maptable","%g32-looper","walk","each","string","cut","last","nrev","rem","keep","trues","do1","gx","withs","push","g1","g2","4","swap","rotate","pop","adjoin","pushnew","pull","mem","togglemem","++","--","zap","(nil)","wipe","(t)","set","gv","iflet","whenlet","it","awhen","whilet","and","aand","gacc","***cut-fn***","_","accum","gdone","gres","drain","whiler","check","(it)","acheck","pos","10","special-syntax","\"^(\\\\d+)\\\\+$\"","regex","***special-syntax-order***","(a)","x-plus-ss","\"^(\\\\d+)\\\\-$\"","x-minus-ss","\"^(\\\\d+)\\\\*$\"","*","x-mul-ss","\"^(\\\\d+)/$\"","/","x-div-ss","\"^/(\\\\d+)$\"","a","x-div-inv-ss","case","rand","range","rand-choice","ga","n-of","\"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\"","%g65-looper","rand-string","index","\"Can't use index as first arg to on.\"","gs","(index)","on","best","most","insert-sorted","insort","reinsert-sorted","insortnew","memo","defmemo","sum","treewise","\"\"","\", \"","pr","prall","prs","tree-subst","ontree","dotted","fill-table","keys","vals","tablist","listtab","obj","num",null,"\"Can't copy ( TODO copy constructor ) \"","copy","shl","shr","abs","trunc","1/2","odd","round",">=","roundup","nearest","avg","sort","med","mergesort","<=","even","merge","bestn","split","t1","t2","(msec)","prn","\"time: \"","(\" msec.\")","time","(quote ok)","jtime","time10","number","seconds","since","60","minutes-since","3600","hours-since","86400","days-since","cache","safeset","defcache","on-err","(fn (c) nil)","errsafe","read","saferead","load-table","safe-load-table","timedate","date","\"-\"","\"0\"","7","datestring","count","80","\"...\"","ellipsize","rand-elt","until","before","orf","andf","atend","mod","multiple","nor","nand","compare","only","conswhen","retrieve","single","intersperse","counts","flat","tree-counts","commonest","idfn","sort-by-commonest","reduce","rreduce","positive","(table)","w/table","median","gn","gc","(0)","((pr \".\") (flushout))","((prn) (flushout))","noisy-each","p","ccc","o","point","throw","catch","64","91","191","215","223","32","char","\"Can't downcase\"","downcase","96","123","247","255","NIL","\"Can't upcase\"","upcase","inc","%g144-looper","mismatch","memtable","\" | \"","bar*","out","needbars","tostring","(\"\")","w/bars","len<","len>","afn","trav","or=","vtables*","((table))","allargs","aif","((it (type car.allargs)))","(apply it allargs)","(pickles* (type car.allargs))","((map it allargs))","defgeneric","defmethod","pickles*","pickle","evtil","empty","-1","rand-key","ratio","butlast","first","between","cars","cdrs","mapeach","gcd","\"^c([ad]{5,})r$\"","#\\a","#\\d","f","(x)","x","c","r","(f)","cxr-ss"]);
/** @} */
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
 "ns",
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
    reader: null,
    ns: null,
    current_ns: null,
    call_stack: null,
    recent_call_args: null,
    warn: null,
  },
  method: {
    init: function() {
      this.reader = new Reader();
      // initializing primitives.
      var prim_all = Primitives.all;
      for (var i = 0, l = prim_all.length; i<l; i++) {
        var prm = prim_all[i];
        var vars = prm.vars;
        for (var p in vars) {
          prm.ns.setBox(p, vars[p]);
        }
      }
      // starting with compiler namespace.
      this.ns = NameSpace.get('arc.core.compiler');
      this.current_ns = this.ns;
      this.init_def(preloads, preload_vals);
      // changing to user namespace.
      this.ns = NameSpace.create_with_default('user');
      this.current_ns = this.ns;
    },
    init_def: function(preloads, preload_vals) {
      var ops = VM.operators;
      for (var i=0,l=preloads.length; i<l; i++)
        (function(preload, preload_val) {
          for (var j=0,jl=preload.length; j<jl; j++)
            (function(line, vals) {
              var asm = [];
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
                case 'conti':
                  asm.push([op, line[++k]|0]);
                  break;
                case 'exit-let':
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
                  asm.push([op, vals[line[++k]|0]]);
                  break;
                case 'constant':
                  asm.push([op, this.reader.read(vals[line[++k]|0])]);
                  break;
                case 'ns':
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
            }).call(this, preload[j], preload_val);
        }).call(this, preloads[i], preload_vals[i]);
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
        case 'conti':
          c[1] = (c[1]|0);
          break;
        case 'exit-let':
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
        case 'ns':
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
      this.call_stack = [];
      this.recent_call_args = [];
      this.warn = "";
      if (globalp) {
        this.x = null;
        this.ns = NameSpace.create_with_default('user');
        this.current_ns = this.ns;
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
    run_iter: function(step) {
      var n = 0, b = 0, v = 0, d = 0, m = 0, l = 0;
      n = n | 0; b = b | 0;
      v = v | 0; d = d | 0;
      m = m | 0; l = l | 0;
      var repeat = !step;
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
          m = op[2];
          this.l -= n;
          this.s = this.l;
          this.l = this.stack.index(this.s, -m);
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
          // console.log(' *** refer -- ' + op[1] + ' ns: ' + this.ns.name);
          this.a = this.ns.get(op[1]);
          this.x.splice(this.p, 1, ['constant', this.a]); // optimization
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
          this.a = new Closure(this.x, this.p + 1, n, v, d, this.stack, this.s, this.ns);
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
          this.current_ns.setBox(op[1], this.a);
          // console.log(' *** assign -- ' + op[1] + ' ns: ' + this.current_ns.name);
          this.p++;
          break;
        case 'frame':
          n = op[1];
          this.s = this.stack.push(
            [this.x, this.p + n, this.ns],
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
          this.call_stack.shift();
          this.p++;
          break;
        case 'apply':
          var fn = this.a;
          var fn_type = type(fn);
          if (fn_type !== s_fn) {
            var tfs = this.ns.collect_bounds('type-fn');
            var tfn;
            if (tfs && (tfn = tfs[fn_type.name + '-tf']) !== void(0)) {
              tfn = rep(tfn.v);
              // get original args len from the top of the stack..
              var vlen = this.stack.index(this.s, 0);
              // added fn as an argument.
              for (var k=0; k<vlen; k++) {
                this.stack.index_set(this.s, k, this.stack.index(this.s, k+1));
              }
              this.stack.index_set(this.s, k, fn);
              // restore args len + 1 into the top of the stack.
              this.s = this.stack.push(vlen + 1, this.s);
              fn = tfn;
            } else {
              throw new Error('Cannot invoke the type "' + fn_type.name + '". Please define the type function.');
            }
          }
          var vlen = this.stack.index(this.s, 0);
          var closurep = (fn instanceof Closure);
          var dotpos = fn.dotpos;
          // checking arglen.
          if ((dotpos < 0 && fn.arglen !== vlen) || (vlen < dotpos)) {
            throw new Error((closurep ? fn.name || 'nameless' : fn.prim_name) + ': arity mismatch;\n' +
                            'the expected number of arguments does not match the given number\n' +
                            'expected: ' + ((-1 < dotpos) ? ('>= ' + dotpos) : fn.arglen) + '\n' +
                            'given: ' + vlen);
          }
          this.recent_call_args = this.stack.range_get(this.s - 1 - vlen, this.s - 2);
          if (closurep) {
            this.x = fn.body;
            this.p = fn.pc;
            this.c = fn;
            this.ns = fn.namespace;
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
            this.call_stack.unshift([fn.name, true]);
          } else {
            this.call_stack.unshift([fn.prim_name, false]);
            this.a = fn.apply(this, this.recent_call_args);
            this.call_stack.shift();
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
              this.ns = xp[2];
              this.f = this.stack.index(this.s, vlen + 2); // for continuation
              this.l = this.stack.index(this.s, vlen + 3); // for continuation
              this.c = this.stack.index(this.s, vlen + 4); // for continuation
              this.s = this.s - vlen - 5;
            }
          }
          break;
        case 'return':
          this.call_stack.shift();
          // don't break !!
        case 'continue-return':
          var n  = op[1];
          var ns = this.s - n;
          var xp = this.stack.index(ns, 0);
          this.x = xp[0];
          this.p = xp[1];
          this.ns = xp[2];
          this.f = this.stack.index(ns, 1);
          this.l = this.stack.index(ns, 2);
          this.c = this.stack.index(ns, 3);
          this.s = ns - 4;
          break;
        case 'conti':
          n = op[1];
          this.a = new Continuation(this.stack, n, this.s, this.ns);
          this.p++;
          break;
        case 'nuate':
          var stack = op[1];
          this.p++;
          this.s = this.stack.restore(stack);
          break;
        case 'ns':
          var ns = this.a;
          if (ns instanceof NameSpace) {
            this.ns = ns;
          } else if (ns instanceof Symbol) {
            this.ns = NameSpace.get(ns.name);
          } else if (typeof ns === 'string') {
            this.ns = NameSpace.get(ns);
          }
          this.current_ns = this.ns;
          this.a = this.ns;
          this.p++;
          break;
        default:
          throw new Error('Error: Unknown operand. ' + code);
        }
        this.count++;
      } while (repeat);
    },
    run: function(asm_string, clean_all, step) {
      if (!step) this.cleanup(clean_all);
      if (asm_string)   this.load_string(asm_string);
      var ret = this.run_iter(step);
      var typ = type(ret);
      if (typ.name.match("^\%javascript\-.*$")) {
        this.warn += "[BUG]: Returned value is not arc-value '" + JSON.stringify(ret) + "'.\n"
      }
      return ret;
    },
    get_call_stack_string: function(lim) {
      lim = lim || Infinity;
      var default_name = '%NAMELESS';
      var res = "Stack Trace:\n_______________________________________\n";
      for (var i = 0, l = Math.min(this.call_stack.length, lim); i < l; i++) {
        var info = this.call_stack[i];
        var typ = info[1]; var args_str = "";
        if (i === 0) {
          args_str = "\n        EXECUTED " + stringify(cons(Symbol.get(info[0] || default_name), javascript_arr_to_list(this.recent_call_args)));
        }
        res += ("  " + i + "  " + (typ ? "fn" : "prim") + " '" + (info[0] || default_name) + "'" + args_str + "\n");
      }
      return res;
    }
  }
});
ArcJS.VM = VM;
/** @} */
/** @file context.js { */
var Context = classify("Context", {
  property: {
    vm: null
  },
  method: {
    init: function() {
      this.vm = new VM();
    },
    compile: function(expr) {
      var asm = [
        ['frame', 8],
        ['constant', expr],
        ['argument'],
        ['constant', 1],
        ['argument'],
        ['refer-global', 'compile'],
        ['indirect'],
        ['apply'],
        ['halt']
      ];
      this.vm.cleanup();
      this.vm.set_asm(asm);
      return this.vm.run();
    },
    eval_asm:  function(asm) {
      this.vm.cleanup();
      this.vm.load(asm);
      return this.vm.run();
    },
    eval_expr: function(expr) {
      var asm = this.compile(expr);
      return this.eval_asm(asm);
    },
    read: function(str) {
      return this.vm.reader.read(str);
    },
    evaluate: function(str) {
      var expr = this.read(str);
      var result = nil;
      while (expr !== Reader.EOF) {
        result = this.eval_expr(expr);
        expr = this.read();
      }
      return result;
    }
  }
});
ArcJS.Context = Context;
var default_context = null;
var context = function context() {
  if (default_context) return default_context;
  default_context = new Context();
  return default_context;
}
ArcJS.context = context;
/** @} */
  return ArcJS;
}).call(typeof exports !== 'undefined' ? exports : {});
/** @} */
