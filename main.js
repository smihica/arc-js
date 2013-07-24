/** @file main.js { */
(function() {
/** @file vm.js { */
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
    },
  }
});
/** @} */
/** @file closure.js { */
var Closure = classify('Closure', {
  property: {
    name: null,
    body: null,
    pc:   0,
    arglen: 0,
    dotpos: 0,
    closings: []
  },
  method: {
    init: function(body, pc, closinglen, arglen, dotpos, stack, stack_pointer) {
      this.body = body;
      this.pc   = pc;
      this.arglen = arglen;
      this.dotpos = dotpos;
      for (var i = 0; i<closinglen; i++)
        this.closings.push(stack.index(stack_pointer, i));
    },
    index: function(idx) {
      return this.closings[idx];
    }
  }
});
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
/** @} */
/** @file continuation.js { */
var Continuation = classify('Continuation', {
  parent: Closure,
  method: {
    init: function(stack, shift_num, stack_pointer) {
      Closure.prototype.init.call(
        this,
        [['refer-local', 0],
         ['nuate', stack.save(stack_pointer)], // stack restore
         ['return', shift_num]], // return to outer frame.
        0,
        0,
        1,
        -1,
        stack,
        0);
    }
  }
});
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
/** @} */
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
/** @} */
/** @file primitives.js { */
var Cons = function(car, cdr) {
  this.car = car; this.cdr = cdr;
}
var nil = (function() {
  var x = new Cons(null, null);
  x.car = x; x.cdr = x;
  return x;
})();

var t = true;

var s_int    = Symbol.get('int');
var s_num    = Symbol.get('num');
var s_string = Symbol.get('string');
var s_sym    = Symbol.get('sym');
var s_cons   = Symbol.get('cons');
var s_fn     = Symbol.get('fn');

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

var stringify = function(x) {
  var type_name = type(x).name;
  switch (type_name) {
  case 'int':
  case 'num':
  case 'string':
    return JSON.stringify(x);
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
  }
  return x+'';
}

var stringify_list = function(cons) {
  var a = car(cons), d = cdr(cons);
  return stringify(a) +
    ((d === nil) ? '' :
     (d instanceof Cons) ?
     ' ' + stringify_list(d) :
     ' . ' + stringify(d));
};

var uniq_counter = 0;

var primitives = ({
  'cons': function(car, cdr) {
    return new Cons(car, cdr);
  },
  'car':  function(x) {
    if (x instanceof Cons) return x.car;
    else throw new Error(x + ' is not cons type.');
  },
  'cdr': function(x) {
    if (x instanceof Cons) return x.cdr;
    else throw new Error(x + ' is not cons type.');
  },
  'caar': function(x) { return car(car(x)); },
  'cadr': function(x) { return car(cdr(x)); },
  'cddr': function(x) { return cdr(cdr(x)); },
  'list': function($$) {
    for (var i=arguments.length-1, rt=nil; -1<i; i--) {
      rt = cons(arguments[i], rt);
    }
    return rt;
  },
  'len': function(lis) {
    var i = 0;
    while (lis !== nil) {
      i++; lis = cdr(lis);
    }
    return i;
  },
  'rev': function(lis) {
    var rt = nil;
    while (lis !== nil) {
      rt = cons(car(lis), rt);
      lis = cdr(lis);
    }
    return rt;
  },
  'nrev': function(lis, $$) {
    var r = $$ || nil;
    var tmp;
    while (lis !== nil && 'cdr' in lis) {
      tmp = lis.cdr;
      lis.cdr = r;
      r = lis;
      lis = tmp;
    }
    return r;
  },
  'uniq': function() {
    var rt = Symbol.get('%g'+uniq_counter);
    uniq_counter++;
    return rt;
  },
  'type': function(x) {
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
      if (x instanceof Symbol)  return s_sym;
      if (x instanceof Cons)    return s_cons;
      if (x instanceof Closure) return s_fn;
    default:
      return Symbol.get('javascript-' + type);
    }
  },
  'err': function($$) {
    throw new Error(
      ('error: ' +
       Array.prototype.map.call(
         arguments,
         function(x) { return type(x) === s_string ? x : stringify(x); }
       ).join(' ') + '.'));
  },
  '+':   function($$) {
    var l = arguments.length;
    if (0 < l && (arguments[0] === nil || type(arguments[0]) === s_cons))
      return primitives['%list-append'].apply(this, arguments);
    for (var i=0, rt = 0; i<l; i++)
      rt += arguments[i];
    return rt;
  },
  '%list-append': function($$) {
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
  },
  '-': function(x, $$) {
    for (var i=1, l=arguments.length, rt = arguments[0]; i<l; i++)
      rt -= arguments[i];
    return rt;
  },
  '*': function($$) {
    for (var i=0, l=arguments.length, rt = 1; i<l; i++)
      rt *= arguments[i];
    return rt;
  },
  '/': function(x, $$) {
    for (var i=1, l=arguments.length, rt = arguments[0]; i<l; i++)
      rt /= arguments[i];
    return rt;
  },
  '<': function($$) {
    for (var i=1, l=arguments.length; i<l; i++) {
      if (!(arguments[i-1] < arguments[i])) return nil;
    }
    return t;
  },
  '>': function($$) {
    for (var i=1, l=arguments.length; i<l; i++) {
      if (!(arguments[i-1] > arguments[i])) return nil;
    }
    return t;
  },
  '<=': function($$) {
    for (var i=1, l=arguments.length; i<l; i++) {
      if (!(arguments[i-1] <= arguments[i])) return nil;
    }
    return t;
  },
  '>=': function($$) {
    for (var i=1, l=arguments.length; i<l; i++) {
      if (!(arguments[i-1] >= arguments[i])) return nil;
    }
    return t;
  },
  'no': function(x) {
    return (x === nil) ? t : nil;
  },
  'is': function(a, b) {
    return (a === b) ? t : nil;
  },
  'mem': function(test, lis) {
    if (lis === nil) return nil;
    if (type(test).name === 'fn') {
      return new Call('%mem-fn', [test, lis]);
    } else {
      while (lis !== nil) {
        if (car(lis) === test) return lis;
        lis = cdr(lis);
      }
      return nil;
    }
  },
  'pos': function(test, lis) {
    if (lis === nil) return nil;
    if (type(test).name === 'fn') {
      return new Call('%pos-fn', [test, lis]);
    } else {
      var i = 0;
      while (lis !== nil) {
        if (car(lis) === test) return i;
        lis = cdr(lis);
        i++;
      }
      return nil;
    }
  },
  'atom': function(x) {
    return (type(x).name === 'cons') ? nil : t;
  },
  'apply': function(fn, $$) {
    for (var i=1, l=arguments.length, args=[]; i<l; i++)
      args = args.concat(list_to_javascript_arr(arguments[i]));
    return new Call(fn, args);
  },
  'pair': function(lis) {
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
  },
  'union': function(test, lis1, lis2) {
    if (test === primitives['is']) {
      var arr = list_to_javascript_arr(lis1);
      while (lis2 !== nil) {
        var ca = car(lis2);
        if (arr.indexOf(ca) < 0) arr.push(ca);
        lis2 = cdr(lis2);
      }
      return javascript_arr_to_list(arr);
    } else {
      return new Call('%union-fn', [test, lis1, lis2]);
    }
  },
  'dedup': function(lis) {
    var arr = list_to_javascript_arr(lis);
    var narr = [];
    for (var i=0, l=arr.length; i<l; i++) {
      if (narr.indexOf(arr[i]) < 0) narr.push(arr[i]);
    }
    return javascript_arr_to_list(narr);
  }
});

for (var n in primitives) {
  var f = primitives[n];
  if ((typeof f) === 'function') {
    f.toString().match(/^function.*?\((.*?)\)/);
    var args = RegExp.$1;
    if (args === '') {
      f.dotpos = -1;
      f.arglen = 0;
      f.prim_name = n;
    } else {
      var vs = args.split(/\s*,\s*/g);
      f.dotpos = vs.indexOf('$$');
      f.arglen = vs.length;
      f.prim_name = n;
    }
  }
}

var cons  = primitives.cons;
var list  = primitives.list;
var car   = primitives.car;
var cdr   = primitives.cdr;
var type  = primitives.type;
var nreverse = primitives.nrev;

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
    slen: 0
  },

  method: {
    load_source: function(str) {
      this.str = str;
      this.slen = str.length;
      this.i = 0;
    },

    whitespace_p: function(c) {
      return (-1 < String.fromCharCode(9,10,11,12,13,32).indexOf(c));
    },

    delimited: function(c) {
      return (-1 < ' ()[]";'.indexOf(c));
    },

    number_p: function(c) {
      return (-1 < '0123456789+-.'.indexOf(c));
    },

    reader_macro_p: function(c) {
      return c === '#';
    },

    read_reader_macro: function(c) {
      var tok = this.read_thing();
      if (tok.length === 0) throw new Error("unexpected nd-of-file while reading macro-char");
      switch (c) {
      case 'x':
        return parseInt(tok, 16);
      case 'd':
        return parseInt(tok, 10);
      case 'o':
        return parseInt(tok, 8);
      case 'b':
        return parseInt(tok, 2);
      case '\\':
        return tok; //TODO read char
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
          lis = cons(this.read_list(true), lis);
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
      return this.make_symbol(tok);
    },

    make_symbol: function(tok) {
      if (tok === 'nil') return nil;
      if (tok === 't') return true;
      return Symbol.get(tok);
    },

    read_string: function() {
      var str = '', esc = false;
      while(this.i < this.slen) {
        var c = this.str[this.i++];
        // TODO more Escape patterns.
        if (esc) {
          c = (({n: '\n', r: '\r', s: '\s', t: '\t'})[c]) || c;
          esc = false;
          str += c;
          continue;
        } else {
          switch(c) {
          case '\\':
            esc = true;
            continue;
          case '"':
            return str;
          default:
            str += c;
            continue;
          }
        }
      }
      throw new Error("unexpected end-of-file while reading string");
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
      if (token === Reader.LBRACK) {
        var body = this.read_list(true);
        return cons(Symbol.get('%shortfn'), cons(body, nil))
      }
      return token;
    },

    read: function(str) {
      this.load_source(str);
      return this.read_expr();
    }
  }
});
/** @} */
/** @file preload.js { */
// This is an auto generated file.
// Compiled from ['/Users/smihica/code/arc-js/src/arc/compiler.arc', '/Users/smihica/code/arc-js/src/arc/lib.arc', '/Users/smihica/code/arc-js/src/arc/util.arc'] on 2013-07-24 10:08:15.
// DON'T EDIT !!!
var preload = [
"((close 0 190 1 -1) (conti 2) (argument) (constant 1) (argument) (refer-local 0) (argument) (close 1 181 1 -1) (refer-free 0) (argument) (constant 1) (argument) (refer-nil) (argument) (enter-let) (box 0) (refer-let 0 0) (argument) (refer-local 0) (argument) (close 2 164 1 -1) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global type) (indirect) (apply) (argument) (enter-let) (frame 10) (refer-let 0 0) (argument) (constant cons) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 140) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (enter-let) (frame 10) (refer-let 0 0) (argument) (constant unquote) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 27) (refer-free 0) (argument) (close 1 8 1 -1) (refer-t) (argument) (constant 1) (argument) (refer-free 0) (shift 2 2) (apply) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 6) (apply) (frame 10) (refer-let 0 0) (argument) (constant unquote-splicing) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 27) (refer-free 0) (argument) (close 1 8 1 -1) (refer-t) (argument) (constant 1) (argument) (refer-free 0) (shift 2 2) (apply) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 6) (apply) (refer-local 0) (argument) (constant 1) (argument) (refer-nil) (argument) (enter-let) (box 0) (refer-let 0 0) (argument) (refer-free 1) (argument) (close 2 39 1 -1) (refer-local 0) (test 35) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (enter-let) (frame 8) (refer-let 0 0) (argument) (constant 1) (argument) (refer-free 0) (indirect) (apply) (exit-let 2) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 1) (argument) (refer-free 1) (indirect) (shift 2 2) (apply) (refer-nil) (return 2) (assign-let 0 0) (exit-let 2) (shift 2 6) (apply) (refer-nil) (exit-let 2) (return 2) (assign-let 0 0) (exit-let 2) (shift 2 2) (apply) (shift 2 2) (apply) (assign-global find-qq-eval) (halt))",
"((close 0 894 1 -1) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global find-qq-eval) (indirect) (apply) (test 451) (frame 17) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global type) (indirect) (apply) (argument) (constant cons) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 423) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (enter-let) (frame 10) (refer-let 0 0) (argument) (constant unquote) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 20) (close 0 3 1 -1) (refer-local 0) (return 2) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 4) (apply) (frame 10) (refer-let 0 0) (argument) (constant unquote-splicing) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 26) (close 0 9 1 -1) (constant \"cannot use ,@ after .\") (argument) (constant 1) (argument) (refer-global err) (indirect) (shift 2 2) (apply) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 4) (apply) (frame 15) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (constant 1) (argument) (refer-global type) (indirect) (apply) (argument) (enter-let) (frame 10) (refer-let 0 0) (argument) (constant cons) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 279) (frame 15) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (enter-let) (frame 10) (refer-let 0 0) (argument) (constant quasiquote) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 67) (refer-local 0) (argument) (close 1 41 1 -1) (constant cons) (argument) (frame 15) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global expand-qq) (indirect) (apply) (argument) (constant 1) (argument) (refer-global qq-pair) (indirect) (apply) (argument) (frame 15) (frame 8) (refer-free 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 1) (argument) (refer-global qq-pair) (indirect) (apply) (argument) (constant 3) (argument) (refer-global list) (indirect) (shift 4 2) (apply) (argument) (frame 15) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 8) (apply) (frame 10) (refer-let 0 0) (argument) (constant unquote) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 53) (refer-local 0) (argument) (close 1 27 1 -1) (constant cons) (argument) (refer-local 0) (argument) (frame 15) (frame 8) (refer-free 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 1) (argument) (refer-global qq-pair) (indirect) (apply) (argument) (constant 3) (argument) (refer-global list) (indirect) (shift 4 2) (apply) (argument) (frame 15) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 8) (apply) (frame 10) (refer-let 0 0) (argument) (constant unquote-splicing) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 71) (refer-local 0) (argument) (close 1 45 1 -1) (frame 15) (frame 8) (refer-free 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 1) (argument) (refer-global no) (indirect) (apply) (test 3) (refer-local 0) (return 2) (constant +) (argument) (refer-local 0) (argument) (frame 15) (frame 8) (refer-free 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 1) (argument) (refer-global qq-pair) (indirect) (apply) (argument) (constant 3) (argument) (refer-global list) (indirect) (shift 4 2) (apply) (argument) (frame 15) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 8) (apply) (constant cons) (argument) (frame 15) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (constant 1) (argument) (refer-global qq-pair) (indirect) (apply) (argument) (frame 15) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 1) (argument) (refer-global qq-pair) (indirect) (apply) (argument) (constant 3) (argument) (refer-global list) (indirect) (shift 4 8) (apply) (constant cons) (argument) (frame 15) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (constant 1) (argument) (refer-global qq-pair) (indirect) (apply) (argument) (frame 15) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 1) (argument) (refer-global qq-pair) (indirect) (apply) (argument) (constant 3) (argument) (refer-global list) (indirect) (shift 4 6) (apply) (constant quote) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global list) (indirect) (shift 3 2) (apply) (refer-nil) (test 423) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (enter-let) (frame 10) (refer-let 0 0) (argument) (constant unquote) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 20) (close 0 3 1 -1) (refer-local 0) (return 2) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 4) (apply) (frame 10) (refer-let 0 0) (argument) (constant unquote-splicing) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 26) (close 0 9 1 -1) (constant \"cannot use ,@ after .\") (argument) (constant 1) (argument) (refer-global err) (indirect) (shift 2 2) (apply) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 4) (apply) (frame 15) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (constant 1) (argument) (refer-global type) (indirect) (apply) (argument) (enter-let) (frame 10) (refer-let 0 0) (argument) (constant cons) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 279) (frame 15) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (enter-let) (frame 10) (refer-let 0 0) (argument) (constant quasiquote) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 67) (refer-local 0) (argument) (close 1 41 1 -1) (constant cons) (argument) (frame 15) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global expand-qq) (indirect) (apply) (argument) (constant 1) (argument) (refer-global qq-pair) (indirect) (apply) (argument) (frame 15) (frame 8) (refer-free 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 1) (argument) (refer-global qq-pair) (indirect) (apply) (argument) (constant 3) (argument) (refer-global list) (indirect) (shift 4 2) (apply) (argument) (frame 15) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 8) (apply) (frame 10) (refer-let 0 0) (argument) (constant unquote) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 53) (refer-local 0) (argument) (close 1 27 1 -1) (constant cons) (argument) (refer-local 0) (argument) (frame 15) (frame 8) (refer-free 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 1) (argument) (refer-global qq-pair) (indirect) (apply) (argument) (constant 3) (argument) (refer-global list) (indirect) (shift 4 2) (apply) (argument) (frame 15) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 8) (apply) (frame 10) (refer-let 0 0) (argument) (constant unquote-splicing) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 71) (refer-local 0) (argument) (close 1 45 1 -1) (frame 15) (frame 8) (refer-free 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 1) (argument) (refer-global no) (indirect) (apply) (test 3) (refer-local 0) (return 2) (constant +) (argument) (refer-local 0) (argument) (frame 15) (frame 8) (refer-free 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 1) (argument) (refer-global qq-pair) (indirect) (apply) (argument) (constant 3) (argument) (refer-global list) (indirect) (shift 4 2) (apply) (argument) (frame 15) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 8) (apply) (constant cons) (argument) (frame 15) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (constant 1) (argument) (refer-global qq-pair) (indirect) (apply) (argument) (frame 15) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 1) (argument) (refer-global qq-pair) (indirect) (apply) (argument) (constant 3) (argument) (refer-global list) (indirect) (shift 4 8) (apply) (constant cons) (argument) (frame 15) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (constant 1) (argument) (refer-global qq-pair) (indirect) (apply) (argument) (frame 15) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 1) (argument) (refer-global qq-pair) (indirect) (apply) (argument) (constant 3) (argument) (refer-global list) (indirect) (shift 4 6) (apply) (constant quote) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global list) (indirect) (shift 3 2) (apply) (assign-global qq-pair) (halt))",
"((close 0 304 1 -1) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global find-qq-eval) (indirect) (apply) (test 156) (frame 17) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global type) (indirect) (apply) (argument) (constant cons) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 128) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (enter-let) (frame 10) (refer-let 0 0) (argument) (constant quasiquote) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 33) (close 0 16 1 -1) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global expand-qq) (indirect) (apply) (argument) (constant 1) (argument) (refer-global expand-qq) (indirect) (shift 2 2) (apply) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 4) (apply) (frame 10) (refer-let 0 0) (argument) (constant unquote) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 20) (close 0 3 1 -1) (refer-local 0) (return 2) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 4) (apply) (frame 10) (refer-let 0 0) (argument) (constant unquote-splicing) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 26) (close 0 9 1 -1) (constant \",@ cannot be used immediately after `\") (argument) (constant 1) (argument) (refer-global err) (indirect) (shift 2 2) (apply) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 4) (apply) (refer-local 0) (argument) (constant 1) (argument) (refer-global qq-pair) (indirect) (shift 2 4) (apply) (constant quote) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global list) (indirect) (shift 3 2) (apply) (refer-nil) (test 128) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (enter-let) (frame 10) (refer-let 0 0) (argument) (constant quasiquote) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 33) (close 0 16 1 -1) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global expand-qq) (indirect) (apply) (argument) (constant 1) (argument) (refer-global expand-qq) (indirect) (shift 2 2) (apply) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 4) (apply) (frame 10) (refer-let 0 0) (argument) (constant unquote) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 20) (close 0 3 1 -1) (refer-local 0) (return 2) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 4) (apply) (frame 10) (refer-let 0 0) (argument) (constant unquote-splicing) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 26) (close 0 9 1 -1) (constant \",@ cannot be used immediately after `\") (argument) (constant 1) (argument) (refer-global err) (indirect) (shift 2 2) (apply) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 4) (apply) (refer-local 0) (argument) (constant 1) (argument) (refer-global qq-pair) (indirect) (shift 2 4) (apply) (constant quote) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global list) (indirect) (shift 3 2) (apply) (assign-global expand-qq) (halt))",
"((close 0 2203 1 -1) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global type) (indirect) (apply) (argument) (enter-let) (frame 10) (refer-let 0 0) (argument) (constant cons) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 2179) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (enter-let) (frame 10) (refer-let 0 0) (argument) (constant quote) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 28) (close 0 11 1 0) (constant quote) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 2) (apply) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 6) (apply) (frame 10) (refer-let 0 0) (argument) (constant caselet) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 216) (close 0 199 3 2) (refer-nil) (argument) (enter-let) (box 0) (refer-let 0 0) (argument) (refer-local 2) (argument) (close 2 135 1 -1) (frame 15) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 1) (argument) (refer-global no) (indirect) (apply) (test 9) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (shift 2 2) (apply) (constant if) (argument) (frame 101) (frame 53) (constant is) (argument) (frame 44) (refer-free 0) (argument) (frame 35) (frame 26) (constant quote) (argument) (frame 17) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (frame 40) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cadr) (indirect) (apply) (argument) (frame 24) (frame 15) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cddr) (indirect) (apply) (argument) (constant 1) (argument) (refer-free 1) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 2) (apply) (assign-let 0 0) (exit-let 2) (argument) (enter-let) (frame 43) (constant let) (argument) (frame 34) (refer-local 2) (argument) (frame 25) (refer-local 1) (argument) (frame 16) (frame 7) (refer-local 0) (argument) (constant 1) (argument) (refer-let 0 0) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (exit-let 2) (argument) (constant 1) (argument) (refer-global expand-macro) (indirect) (shift 2 4) (apply) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 6) (apply) (frame 10) (refer-let 0 0) (argument) (constant case) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 58) (close 0 41 2 1) (frame 33) (constant caselet) (argument) (frame 24) (frame 6) (constant 0) (argument) (refer-global uniq) (indirect) (apply) (argument) (frame 10) (refer-local 1) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 1) (argument) (refer-global expand-macro) (indirect) (shift 2 3) (apply) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 6) (apply) (frame 10) (refer-let 0 0) (argument) (constant reccase) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 211) (close 0 194 2 1) (frame 17) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global len) (indirect) (apply) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global -) (indirect) (apply) (argument) (enter-let) (frame 10) (refer-let 0 0) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global firstn) (indirect) (apply) (argument) (frame 10) (refer-let 0 0) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global nthcdr) (indirect) (apply) (argument) (enter-let) (frame 144) (constant case) (argument) (frame 135) (frame 19) (constant car) (argument) (frame 10) (refer-local 1) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (frame 108) (frame 99) (refer-local 1) (argument) (close 1 88 1 -1) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (frame 71) (frame 62) (constant apply) (argument) (frame 53) (frame 17) (constant fn) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (frame 28) (frame 19) (constant cdr) (argument) (frame 10) (refer-free 0) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 2) (apply) (argument) (refer-let 0 1) (argument) (constant 2) (argument) (refer-global mappend) (indirect) (apply) (argument) (refer-let 0 0) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 1) (argument) (refer-global expand-macro) (indirect) (shift 2 8) (apply) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 6) (apply) (frame 10) (refer-let 0 0) (argument) (constant each) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 239) (close 0 222 3 2) (frame 6) (constant 0) (argument) (refer-global uniq) (indirect) (apply) (argument) (frame 6) (constant 0) (argument) (refer-global uniq) (indirect) (apply) (argument) (enter-let) (frame 199) (frame 181) (constant rfn) (argument) (frame 172) (refer-let 0 1) (argument) (frame 163) (frame 10) (refer-let 0 0) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (frame 145) (frame 136) (constant if) (argument) (frame 127) (refer-let 0 0) (argument) (frame 118) (frame 109) (constant do) (argument) (frame 100) (frame 46) (constant let) (argument) (frame 37) (refer-local 2) (argument) (frame 28) (frame 19) (constant car) (argument) (frame 10) (refer-let 0 0) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (frame 46) (frame 37) (refer-let 0 1) (argument) (frame 28) (frame 19) (constant cdr) (argument) (frame 10) (refer-let 0 0) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (frame 10) (refer-local 1) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 1) (argument) (refer-global expand-macro) (indirect) (shift 2 7) (apply) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 6) (apply) (frame 10) (refer-let 0 0) (argument) (constant %shortfn) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 53) (close 0 36 1 -1) (frame 28) (constant fn) (argument) (frame 19) (constant (_)) (argument) (frame 10) (refer-local 0) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 1) (argument) (refer-global expand-macro) (indirect) (shift 2 2) (apply) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 6) (apply) (frame 10) (refer-let 0 0) (argument) (constant fn) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 103) (close 0 86 2 1) (constant fn) (argument) (frame 76) (refer-local 1) (argument) (frame 67) (frame 17) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global len) (indirect) (apply) (argument) (constant 2) (argument) (constant 2) (argument) (refer-global <) (indirect) (apply) (test 24) (frame 15) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (constant 1) (argument) (refer-global expand-macro) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (frame 17) (frame 10) (constant do) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 1) (argument) (refer-global expand-macro) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 3) (apply) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 6) (apply) (frame 10) (refer-let 0 0) (argument) (constant rfn) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 107) (close 0 90 3 2) (frame 82) (constant let) (argument) (frame 73) (refer-local 2) (argument) (frame 64) (constant nil) (argument) (frame 55) (frame 46) (constant assign) (argument) (frame 37) (refer-local 2) (argument) (frame 28) (frame 19) (constant fn) (argument) (frame 10) (refer-local 1) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 1) (argument) (refer-global expand-macro) (indirect) (shift 2 4) (apply) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 6) (apply) (frame 10) (refer-let 0 0) (argument) (constant afn) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 53) (close 0 36 2 1) (frame 28) (constant rfn) (argument) (frame 19) (constant self) (argument) (frame 10) (refer-local 1) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 1) (argument) (refer-global expand-macro) (indirect) (shift 2 3) (apply) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 6) (apply) (frame 10) (refer-let 0 0) (argument) (constant quasiquote) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 33) (close 0 16 1 -1) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global expand-qq) (indirect) (apply) (argument) (constant 1) (argument) (refer-global expand-macro) (indirect) (shift 2 2) (apply) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 6) (apply) (frame 10) (refer-let 0 0) (argument) (constant if) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 169) (close 0 152 1 0) (frame 144) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global pair) (indirect) (apply) (argument) (constant 1) (argument) (refer-nil) (argument) (enter-let) (box 0) (refer-let 0 0) (argument) (close 1 123 1 -1) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (enter-let) (frame 17) (frame 8) (refer-let 0 0) (argument) (constant 1) (argument) (refer-global len) (indirect) (apply) (argument) (constant 2) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 66) (constant %if) (argument) (frame 56) (frame 8) (refer-let 0 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (frame 40) (frame 8) (refer-let 0 0) (argument) (constant 1) (argument) (refer-global cadr) (indirect) (apply) (argument) (frame 24) (frame 15) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 1) (argument) (refer-free 0) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 4) (apply) (frame 17) (frame 8) (refer-let 0 0) (argument) (constant 1) (argument) (refer-global len) (indirect) (apply) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 9) (refer-let 0 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (shift 2 4) (apply) (refer-nil) (exit-let 2) (return 2) (assign-let 0 0) (exit-let 2) (apply) (argument) (constant 1) (argument) (refer-global expand-macro) (indirect) (shift 2 2) (apply) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 6) (apply) (frame 10) (refer-let 0 0) (argument) (constant and) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 129) (close 0 112 1 0) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (test 59) (frame 51) (constant if) (argument) (frame 42) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (frame 26) (frame 17) (constant and) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 1) (argument) (refer-global expand-macro) (indirect) (shift 2 2) (apply) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (enter-let) (refer-let 0 0) (test 10) (refer-let 0 0) (exit-let 2) (argument) (constant 1) (argument) (refer-global expand-macro) (indirect) (shift 2 2) (apply) (refer-t) (argument) (enter-let) (refer-let 0 0) (test 10) (refer-let 0 0) (exit-let 4) (argument) (constant 1) (argument) (refer-global expand-macro) (indirect) (shift 2 2) (apply) (refer-nil) (exit-let 4) (argument) (constant 1) (argument) (refer-global expand-macro) (indirect) (shift 2 2) (apply) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 6) (apply) (frame 10) (refer-let 0 0) (argument) (constant or) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 140) (close 0 123 1 0) (refer-local 0) (test 113) (frame 6) (constant 0) (argument) (refer-global uniq) (indirect) (apply) (argument) (enter-let) (frame 96) (constant let) (argument) (frame 87) (refer-let 0 0) (argument) (frame 78) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (frame 62) (frame 53) (constant if) (argument) (frame 44) (refer-let 0 0) (argument) (frame 35) (refer-let 0 0) (argument) (frame 26) (frame 17) (constant or) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (exit-let 2) (argument) (constant 1) (argument) (refer-global expand-macro) (indirect) (shift 2 2) (apply) (refer-nil) (argument) (constant 1) (argument) (refer-global expand-macro) (indirect) (shift 2 2) (apply) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 6) (apply) (frame 10) (refer-let 0 0) (argument) (constant with) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 110) (close 0 93 2 1) (constant with) (argument) (frame 83) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global expand-macro) (indirect) (apply) (argument) (frame 67) (frame 17) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global len) (indirect) (apply) (argument) (constant 2) (argument) (constant 2) (argument) (refer-global <) (indirect) (apply) (test 24) (frame 15) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (constant 1) (argument) (refer-global expand-macro) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (frame 17) (frame 10) (constant do) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 1) (argument) (refer-global expand-macro) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 3) (apply) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 6) (apply) (frame 10) (refer-let 0 0) (argument) (constant let) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 62) (close 0 45 3 2) (frame 37) (constant with) (argument) (frame 28) (frame 19) (refer-local 2) (argument) (frame 10) (refer-local 1) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 1) (argument) (refer-global expand-macro) (indirect) (shift 2 4) (apply) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 6) (apply) (frame 10) (refer-let 0 0) (argument) (constant def) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 71) (close 0 54 3 2) (frame 46) (constant assign) (argument) (frame 37) (refer-local 2) (argument) (frame 28) (frame 19) (constant fn) (argument) (frame 10) (refer-local 1) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 1) (argument) (refer-global expand-macro) (indirect) (shift 2 4) (apply) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 6) (apply) (frame 10) (refer-let 0 0) (argument) (constant aif) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 205) (close 0 188 1 0) (frame 180) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global pair) (indirect) (apply) (argument) (constant 1) (argument) (refer-nil) (argument) (enter-let) (box 0) (refer-let 0 0) (argument) (close 1 159 1 -1) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (enter-let) (frame 17) (frame 8) (refer-let 0 0) (argument) (constant 1) (argument) (refer-global len) (indirect) (apply) (argument) (constant 2) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 102) (constant let) (argument) (frame 92) (constant it) (argument) (frame 83) (frame 8) (refer-let 0 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (frame 67) (frame 58) (constant %if) (argument) (frame 49) (constant it) (argument) (frame 40) (frame 8) (refer-let 0 0) (argument) (constant 1) (argument) (refer-global cadr) (indirect) (apply) (argument) (frame 24) (frame 15) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 1) (argument) (refer-free 0) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 4) (apply) (frame 17) (frame 8) (refer-let 0 0) (argument) (constant 1) (argument) (refer-global len) (indirect) (apply) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 9) (refer-let 0 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (shift 2 4) (apply) (refer-nil) (exit-let 2) (return 2) (assign-let 0 0) (exit-let 2) (apply) (argument) (constant 1) (argument) (refer-global expand-macro) (indirect) (shift 2 2) (apply) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 6) (apply) (refer-global expand-macro) (indirect) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global map) (indirect) (shift 3 6) (apply) (refer-local 0) (exit-let 2) (return 2) (assign-global expand-macro) (halt))",
"((close 0 68 4 -1) (refer-local 2) (test 64) (frame 8) (refer-local 2) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (enter-let) (frame 10) (refer-local 3) (argument) (refer-let 0 0) (argument) (constant 2) (argument) (refer-global pos) (indirect) (apply) (argument) (enter-let) (refer-let 0 0) (test 10) (refer-local 1) (argument) (refer-let 0 0) (argument) (constant 2) (argument) (refer-local 0) (shift 3 9) (apply) (refer-local 3) (argument) (frame 8) (refer-local 2) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (frame 10) (constant 1) (argument) (refer-local 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (refer-local 0) (argument) (constant 4) (argument) (refer-global compile-lookup-let) (indirect) (shift 5 9) (apply) (refer-nil) (return 5) (assign-global compile-lookup-let) (halt))",
"((close 0 92 7 -1) (frame 21) (refer-local 6) (argument) (frame 8) (refer-local 5) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (constant 0) (argument) (refer-local 3) (argument) (constant 4) (argument) (refer-global compile-lookup-let) (indirect) (apply) (argument) (enter-let) (refer-let 0 0) (test 4) (refer-let 0 0) (exit-let 2) (return 8) (frame 17) (refer-local 6) (argument) (frame 8) (refer-local 5) (argument) (constant 1) (argument) (refer-global cadr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global pos) (indirect) (apply) (argument) (enter-let) (refer-let 0 0) (test 8) (refer-let 0 0) (argument) (constant 1) (argument) (refer-local 2) (shift 2 12) (apply) (frame 17) (refer-local 6) (argument) (frame 8) (refer-local 5) (argument) (constant 1) (argument) (refer-global cddr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global pos) (indirect) (apply) (argument) (enter-let) (refer-let 0 0) (test 8) (refer-let 0 0) (argument) (constant 1) (argument) (refer-local 1) (shift 2 14) (apply) (refer-local 6) (argument) (constant 1) (argument) (refer-local 0) (shift 2 14) (apply) (assign-global compile-lookup) (halt))",
"((close 0 231 3 -1) (refer-local 2) (argument) (refer-local 1) (argument) (refer-local 0) (argument) (refer-local 0) (argument) (close 1 38 2 -1) (constant refer-let) (argument) (frame 28) (refer-local 1) (argument) (frame 19) (refer-local 0) (argument) (frame 10) (refer-free 0) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 3) (apply) (argument) (refer-local 0) (argument) (close 1 29 1 -1) (constant refer-local) (argument) (frame 19) (refer-local 0) (argument) (frame 10) (refer-free 0) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 2) (apply) (argument) (refer-local 0) (argument) (close 1 29 1 -1) (constant refer-free) (argument) (frame 19) (refer-local 0) (argument) (frame 10) (refer-free 0) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 2) (apply) (argument) (refer-local 0) (argument) (close 1 110 1 -1) (refer-local 0) (argument) (enter-let) (frame 10) (refer-let 0 0) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 20) (constant refer-nil) (argument) (frame 10) (refer-free 0) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 4) (apply) (frame 10) (refer-let 0 0) (argument) (constant t) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 20) (constant refer-t) (argument) (frame 10) (refer-free 0) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 4) (apply) (constant refer-global) (argument) (frame 37) (refer-local 0) (argument) (frame 28) (frame 19) (constant indirect) (argument) (frame 10) (refer-free 0) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 4) (apply) (argument) (constant 7) (argument) (refer-global compile-lookup) (indirect) (shift 8 4) (apply) (assign-global compile-refer) (halt))",
"((close 0 606 2 -1) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global type) (indirect) (apply) (argument) (enter-let) (frame 10) (refer-let 0 0) (argument) (constant sym) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 30) (frame 17) (frame 10) (refer-local 1) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global mem) (indirect) (apply) (argument) (constant 1) (argument) (refer-global no) (indirect) (apply) (test 9) (refer-local 1) (argument) (constant 1) (argument) (refer-global list) (indirect) (shift 2 5) (apply) (refer-nil) (exit-let 2) (return 3) (frame 10) (refer-let 0 0) (argument) (constant cons) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 542) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (enter-let) (frame 10) (refer-let 0 0) (argument) (constant quote) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 20) (close 0 3 1 0) (refer-nil) (return 2) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 7) (apply) (frame 10) (refer-let 0 0) (argument) (constant fn) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 49) (refer-local 0) (argument) (close 1 30 2 -1) (refer-local 0) (argument) (frame 20) (refer-global is) (indirect) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global dotted-to-proper) (indirect) (apply) (argument) (refer-free 0) (argument) (constant 3) (argument) (refer-global union) (indirect) (apply) (argument) (constant 2) (argument) (refer-global find-free) (indirect) (shift 3 3) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 7) (apply) (frame 10) (refer-let 0 0) (argument) (constant with) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 128) (refer-local 0) (argument) (close 1 109 2 -1) (frame 18) (refer-global car) (indirect) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global pair) (indirect) (apply) (argument) (constant 2) (argument) (refer-global map) (indirect) (apply) (argument) (frame 18) (refer-global cadr) (indirect) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global pair) (indirect) (apply) (argument) (constant 2) (argument) (refer-global map) (indirect) (apply) (argument) (enter-let) (refer-global is) (indirect) (argument) (frame 36) (frame 29) (frame 22) (refer-free 0) (argument) (close 1 11 1 -1) (refer-local 0) (argument) (refer-free 0) (argument) (constant 2) (argument) (refer-global find-free) (indirect) (shift 3 2) (apply) (argument) (refer-let 0 0) (argument) (constant 2) (argument) (refer-global map) (indirect) (apply) (argument) (constant 1) (argument) (refer-global flat) (indirect) (apply) (argument) (constant 1) (argument) (refer-global dedup) (indirect) (apply) (argument) (frame 22) (refer-local 0) (argument) (frame 13) (refer-global is) (indirect) (argument) (refer-let 0 1) (argument) (refer-free 0) (argument) (constant 3) (argument) (refer-global union) (indirect) (apply) (argument) (constant 2) (argument) (refer-global find-free) (indirect) (apply) (argument) (constant 3) (argument) (refer-global union) (indirect) (shift 4 6) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 7) (apply) (frame 10) (refer-let 0 0) (argument) (constant do) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 56) (refer-local 0) (argument) (close 1 37 1 0) (frame 29) (frame 22) (refer-free 0) (argument) (close 1 11 1 -1) (refer-local 0) (argument) (refer-free 0) (argument) (constant 2) (argument) (refer-global find-free) (indirect) (shift 3 2) (apply) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global map) (indirect) (apply) (argument) (constant 1) (argument) (refer-global flat) (indirect) (apply) (argument) (constant 1) (argument) (refer-global dedup) (indirect) (shift 2 2) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 7) (apply) (frame 10) (refer-let 0 0) (argument) (constant %if) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 56) (refer-local 0) (argument) (close 1 37 1 0) (frame 29) (frame 22) (refer-free 0) (argument) (close 1 11 1 -1) (refer-local 0) (argument) (refer-free 0) (argument) (constant 2) (argument) (refer-global find-free) (indirect) (shift 3 2) (apply) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global map) (indirect) (apply) (argument) (constant 1) (argument) (refer-global flat) (indirect) (apply) (argument) (constant 1) (argument) (refer-global dedup) (indirect) (shift 2 2) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 7) (apply) (frame 10) (refer-let 0 0) (argument) (constant assign) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 86) (refer-local 0) (argument) (close 1 67 2 -1) (refer-global is) (indirect) (argument) (frame 17) (frame 10) (refer-local 1) (argument) (refer-free 0) (argument) (constant 2) (argument) (refer-global mem) (indirect) (apply) (argument) (constant 1) (argument) (refer-global no) (indirect) (apply) (test 27) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global list) (indirect) (apply) (argument) (frame 10) (refer-local 0) (argument) (refer-free 0) (argument) (constant 2) (argument) (refer-global find-free) (indirect) (apply) (argument) (constant 3) (argument) (refer-global union) (indirect) (shift 4 3) (apply) (refer-nil) (argument) (frame 10) (refer-local 0) (argument) (refer-free 0) (argument) (constant 2) (argument) (refer-global find-free) (indirect) (apply) (argument) (constant 3) (argument) (refer-global union) (indirect) (shift 4 3) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 7) (apply) (frame 10) (refer-let 0 0) (argument) (constant ccc) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 30) (refer-local 0) (argument) (close 1 11 1 -1) (refer-local 0) (argument) (refer-free 0) (argument) (constant 2) (argument) (refer-global find-free) (indirect) (shift 3 2) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 7) (apply) (frame 29) (frame 22) (refer-local 0) (argument) (close 1 11 1 -1) (refer-local 0) (argument) (refer-free 0) (argument) (constant 2) (argument) (refer-global find-free) (indirect) (shift 3 2) (apply) (argument) (refer-local 1) (argument) (constant 2) (argument) (refer-global map) (indirect) (apply) (argument) (constant 1) (argument) (refer-global flat) (indirect) (apply) (argument) (constant 1) (argument) (refer-global dedup) (indirect) (shift 2 7) (apply) (refer-nil) (exit-let 2) (return 3) (assign-global find-free) (halt))",
"((close 0 553 2 -1) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global type) (indirect) (apply) (argument) (enter-let) (frame 10) (refer-let 0 0) (argument) (constant cons) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 529) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (enter-let) (frame 10) (refer-let 0 0) (argument) (constant quote) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 20) (close 0 3 1 -1) (refer-nil) (return 2) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 7) (apply) (frame 10) (refer-let 0 0) (argument) (constant fn) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 46) (refer-local 0) (argument) (close 1 27 2 -1) (refer-local 0) (argument) (frame 17) (refer-free 0) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global dotted-to-proper) (indirect) (apply) (argument) (constant 2) (argument) (refer-global set-minus) (indirect) (apply) (argument) (constant 2) (argument) (refer-global find-sets) (indirect) (shift 3 3) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 7) (apply) (frame 10) (refer-let 0 0) (argument) (constant with) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 125) (refer-local 0) (argument) (close 1 106 2 -1) (frame 18) (refer-global car) (indirect) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global pair) (indirect) (apply) (argument) (constant 2) (argument) (refer-global map) (indirect) (apply) (argument) (frame 18) (refer-global cadr) (indirect) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global pair) (indirect) (apply) (argument) (constant 2) (argument) (refer-global map) (indirect) (apply) (argument) (enter-let) (refer-global is) (indirect) (argument) (frame 36) (frame 29) (frame 22) (refer-free 0) (argument) (close 1 11 1 -1) (refer-local 0) (argument) (refer-free 0) (argument) (constant 2) (argument) (refer-global find-sets) (indirect) (shift 3 2) (apply) (argument) (refer-let 0 0) (argument) (constant 2) (argument) (refer-global map) (indirect) (apply) (argument) (constant 1) (argument) (refer-global flat) (indirect) (apply) (argument) (constant 1) (argument) (refer-global dedup) (indirect) (apply) (argument) (frame 19) (refer-local 0) (argument) (frame 10) (refer-free 0) (argument) (refer-let 0 1) (argument) (constant 2) (argument) (refer-global set-minus) (indirect) (apply) (argument) (constant 2) (argument) (refer-global find-sets) (indirect) (apply) (argument) (constant 3) (argument) (refer-global union) (indirect) (shift 4 6) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 7) (apply) (frame 10) (refer-let 0 0) (argument) (constant do) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 56) (refer-local 0) (argument) (close 1 37 1 0) (frame 29) (frame 22) (refer-free 0) (argument) (close 1 11 1 -1) (refer-local 0) (argument) (refer-free 0) (argument) (constant 2) (argument) (refer-global find-sets) (indirect) (shift 3 2) (apply) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global map) (indirect) (apply) (argument) (constant 1) (argument) (refer-global flat) (indirect) (apply) (argument) (constant 1) (argument) (refer-global dedup) (indirect) (shift 2 2) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 7) (apply) (frame 10) (refer-let 0 0) (argument) (constant %if) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 56) (refer-local 0) (argument) (close 1 37 1 0) (frame 29) (frame 22) (refer-free 0) (argument) (close 1 11 1 -1) (refer-local 0) (argument) (refer-free 0) (argument) (constant 2) (argument) (refer-global find-sets) (indirect) (shift 3 2) (apply) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global map) (indirect) (apply) (argument) (constant 1) (argument) (refer-global flat) (indirect) (apply) (argument) (constant 1) (argument) (refer-global dedup) (indirect) (shift 2 2) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 7) (apply) (frame 10) (refer-let 0 0) (argument) (constant assign) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 79) (refer-local 0) (argument) (close 1 60 2 -1) (refer-global is) (indirect) (argument) (frame 10) (refer-local 1) (argument) (refer-free 0) (argument) (constant 2) (argument) (refer-global mem) (indirect) (apply) (test 27) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global list) (indirect) (apply) (argument) (frame 10) (refer-local 0) (argument) (refer-free 0) (argument) (constant 2) (argument) (refer-global find-sets) (indirect) (apply) (argument) (constant 3) (argument) (refer-global union) (indirect) (shift 4 3) (apply) (refer-nil) (argument) (frame 10) (refer-local 0) (argument) (refer-free 0) (argument) (constant 2) (argument) (refer-global find-sets) (indirect) (apply) (argument) (constant 3) (argument) (refer-global union) (indirect) (shift 4 3) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 7) (apply) (frame 10) (refer-let 0 0) (argument) (constant ccc) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 30) (refer-local 0) (argument) (close 1 11 1 -1) (refer-local 0) (argument) (refer-free 0) (argument) (constant 2) (argument) (refer-global find-sets) (indirect) (shift 3 2) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 7) (apply) (frame 29) (frame 22) (refer-local 0) (argument) (close 1 11 1 -1) (refer-local 0) (argument) (refer-free 0) (argument) (constant 2) (argument) (refer-global find-sets) (indirect) (shift 3 2) (apply) (argument) (refer-local 1) (argument) (constant 2) (argument) (refer-global map) (indirect) (apply) (argument) (constant 1) (argument) (refer-global flat) (indirect) (apply) (argument) (constant 1) (argument) (refer-global dedup) (indirect) (shift 2 7) (apply) (refer-nil) (exit-let 2) (return 3) (assign-global find-sets) (halt))",
"((close 0 123 3 -1) (refer-local 1) (argument) (constant 0) (argument) (constant 2) (argument) (refer-nil) (argument) (enter-let) (box 0) (refer-local 0) (argument) (refer-let 0 0) (argument) (refer-local 2) (argument) (close 3 102 2 -1) (refer-local 1) (test 98) (frame 17) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (refer-free 0) (argument) (constant 2) (argument) (refer-global mem) (indirect) (apply) (test 54) (constant box) (argument) (frame 44) (refer-local 0) (argument) (frame 35) (frame 26) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (frame 10) (refer-local 0) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-free 1) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 3) (apply) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (frame 10) (refer-local 0) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-free 1) (indirect) (shift 3 3) (apply) (refer-free 2) (return 3) (assign-let 0 0) (exit-let 2) (shift 3 4) (apply) (assign-global make-boxes) (halt))",
"((close 0 152 1 -1) (frame 17) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (constant return) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 9) (refer-local 0) (argument) (constant 1) (argument) (refer-global cadr) (indirect) (shift 2 2) (apply) (frame 17) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (constant exit-let) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 66) (frame 24) (frame 15) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cddr) (indirect) (apply) (argument) (constant 1) (argument) (refer-global caar) (indirect) (apply) (argument) (constant return) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 39) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cadr) (indirect) (apply) (argument) (frame 22) (frame 15) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cddr) (indirect) (apply) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (constant 1) (argument) (refer-global cadr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global +) (indirect) (shift 3 2) (apply) (refer-nil) (return 2) (refer-nil) (test 39) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cadr) (indirect) (apply) (argument) (frame 22) (frame 15) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cddr) (indirect) (apply) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (constant 1) (argument) (refer-global cadr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global +) (indirect) (shift 3 2) (apply) (refer-nil) (return 2) (assign-global tailp) (halt))",
"((close 0 18 1 -1) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (constant exit-let) (argument) (constant 2) (argument) (refer-global is) (indirect) (shift 3 2) (apply) (assign-global nest-exit-p) (halt))",
"((close 0 58 3 -1) (frame 8) (refer-local 2) (argument) (constant 1) (argument) (refer-global no) (indirect) (apply) (test 3) (refer-local 0) (return 4) (frame 8) (refer-local 2) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (refer-local 1) (argument) (frame 28) (frame 8) (refer-local 2) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (refer-local 1) (argument) (frame 10) (constant argument) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global list) (indirect) (apply) (argument) (constant 3) (argument) (refer-global compile-refer) (indirect) (apply) (argument) (constant 3) (argument) (refer-global collect-free) (indirect) (shift 4 4) (apply) (assign-global collect-free) (halt))",
"((close 0 110 2 -1) (refer-local 1) (test 106) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cadr) (indirect) (apply) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cddr) (indirect) (apply) (argument) (enter-let) (refer-let 0 0) (argument) (refer-let 0 1) (argument) (refer-let 0 2) (argument) (close 3 62 1 -1) (frame 17) (refer-local 0) (argument) (frame 8) (refer-free 0) (argument) (constant 1) (argument) (refer-global flat) (indirect) (apply) (argument) (constant 2) (argument) (refer-global mem) (indirect) (apply) (argument) (enter-let) (refer-let 0 0) (test 4) (refer-let 0 0) (exit-let 2) (return 2) (frame 10) (refer-local 0) (argument) (refer-free 1) (argument) (constant 2) (argument) (refer-global mem) (indirect) (apply) (argument) (enter-let) (refer-let 0 0) (test 4) (refer-let 0 0) (exit-let 4) (return 2) (frame 10) (refer-local 0) (argument) (refer-free 2) (argument) (constant 2) (argument) (refer-global mem) (indirect) (apply) (argument) (enter-let) (refer-let 0 0) (test 4) (refer-let 0 0) (exit-let 6) (return 2) (refer-nil) (exit-let 6) (return 2) (argument) (refer-local 1) (argument) (constant 2) (argument) (refer-global keep) (indirect) (shift 3 7) (apply) (refer-nil) (return 3) (assign-global remove-globs) (halt))",
"((close 0 1844 4 -1) (frame 8) (refer-local 3) (argument) (constant 1) (argument) (refer-global type) (indirect) (apply) (argument) (enter-let) (frame 10) (refer-let 0 0) (argument) (constant sym) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 50) (refer-local 3) (argument) (refer-local 2) (argument) (frame 10) (refer-local 3) (argument) (refer-local 1) (argument) (constant 2) (argument) (refer-global mem) (indirect) (apply) (test 27) (frame 19) (constant indirect) (argument) (frame 10) (refer-local 0) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 3) (argument) (refer-global compile-refer) (indirect) (shift 4 7) (apply) (refer-local 0) (argument) (constant 3) (argument) (refer-global compile-refer) (indirect) (shift 4 7) (apply) (frame 10) (refer-let 0 0) (argument) (constant cons) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 1735) (frame 8) (refer-local 3) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (enter-let) (frame 10) (refer-let 0 0) (argument) (constant quote) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 48) (refer-local 0) (argument) (close 1 29 1 -1) (constant constant) (argument) (frame 19) (refer-local 0) (argument) (frame 10) (refer-free 0) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 2) (apply) (argument) (frame 8) (refer-local 3) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 9) (apply) (frame 10) (refer-let 0 0) (argument) (constant fn) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 269) (refer-local 0) (argument) (refer-local 1) (argument) (refer-local 2) (argument) (close 3 246 2 -1) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global dotted-pos) (indirect) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global dotted-to-proper) (indirect) (apply) (argument) (enter-let) (frame 10) (refer-local 0) (argument) (refer-let 0 0) (argument) (constant 2) (argument) (refer-global find-free) (indirect) (apply) (argument) (frame 10) (refer-local 0) (argument) (refer-let 0 0) (argument) (constant 2) (argument) (refer-global find-sets) (indirect) (apply) (argument) (enter-let) (frame 10) (refer-let 0 1) (argument) (refer-free 0) (argument) (constant 2) (argument) (refer-global remove-globs) (indirect) (apply) (argument) (enter-let) (refer-let 0 0) (argument) (refer-free 0) (argument) (frame 180) (constant close) (argument) (frame 171) (frame 8) (refer-let 0 0) (argument) (constant 1) (argument) (refer-global len) (indirect) (apply) (argument) (frame 155) (frame 8) (refer-let 2 0) (argument) (constant 1) (argument) (refer-global len) (indirect) (apply) (argument) (frame 139) (refer-let 2 1) (argument) (frame 130) (frame 112) (refer-let 1 0) (argument) (frame 8) (refer-let 2 0) (argument) (constant 1) (argument) (refer-global rev) (indirect) (apply) (argument) (frame 94) (refer-local 0) (argument) (frame 26) (constant nil) (argument) (frame 17) (frame 8) (refer-let 2 0) (argument) (constant 1) (argument) (refer-global rev) (indirect) (apply) (argument) (refer-let 0 0) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (frame 22) (refer-global is) (indirect) (argument) (refer-let 1 0) (argument) (frame 10) (refer-free 1) (argument) (refer-let 0 0) (argument) (constant 2) (argument) (refer-global set-intersect) (indirect) (apply) (argument) (constant 3) (argument) (refer-global union) (indirect) (apply) (argument) (frame 35) (constant return) (argument) (frame 26) (frame 17) (frame 8) (refer-let 2 0) (argument) (constant 1) (argument) (refer-global len) (indirect) (apply) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 4) (argument) (refer-global compile) (indirect) (apply) (argument) (constant 3) (argument) (refer-global make-boxes) (indirect) (apply) (argument) (frame 10) (refer-free 2) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 3) (argument) (refer-global collect-free) (indirect) (shift 4 11) (apply) (argument) (frame 8) (refer-local 3) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 9) (apply) (frame 10) (refer-let 0 0) (argument) (constant with) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 396) (refer-local 0) (argument) (refer-local 1) (argument) (refer-local 2) (argument) (close 3 373 2 -1) (frame 18) (refer-global car) (indirect) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global pair) (indirect) (apply) (argument) (constant 2) (argument) (refer-global map) (indirect) (apply) (argument) (frame 18) (refer-global cadr) (indirect) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global pair) (indirect) (apply) (argument) (constant 2) (argument) (refer-global map) (indirect) (apply) (argument) (enter-let) (frame 8) (refer-let 0 0) (argument) (constant 1) (argument) (refer-global rev) (indirect) (apply) (argument) (frame 40) (frame 24) (frame 8) (refer-let 0 1) (argument) (constant 1) (argument) (refer-global rev) (indirect) (apply) (argument) (frame 8) (refer-free 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (frame 8) (refer-free 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (frame 8) (refer-free 2) (argument) (constant 1) (argument) (refer-global nest-exit-p) (indirect) (apply) (argument) (frame 10) (refer-local 0) (argument) (refer-let 0 1) (argument) (constant 2) (argument) (refer-global find-sets) (indirect) (apply) (argument) (frame 19) (frame 10) (refer-local 0) (argument) (refer-let 0 1) (argument) (constant 2) (argument) (refer-global find-free) (indirect) (apply) (argument) (refer-free 0) (argument) (constant 2) (argument) (refer-global remove-globs) (indirect) (apply) (argument) (enter-let) (frame 157) (constant enter-let) (argument) (frame 148) (frame 139) (refer-let 0 1) (argument) (frame 8) (refer-let 1 1) (argument) (constant 1) (argument) (refer-global rev) (indirect) (apply) (argument) (frame 121) (refer-local 0) (argument) (refer-let 0 3) (argument) (frame 22) (refer-global is) (indirect) (argument) (refer-let 0 1) (argument) (frame 10) (refer-free 1) (argument) (refer-let 0 0) (argument) (constant 2) (argument) (refer-global set-intersect) (indirect) (apply) (argument) (constant 3) (argument) (refer-global union) (indirect) (apply) (argument) (frame 87) (constant exit-let) (argument) (frame 78) (frame 35) (frame 8) (refer-let 1 1) (argument) (constant 1) (argument) (refer-global len) (indirect) (apply) (argument) (constant 1) (argument) (refer-let 0 2) (test 15) (frame 8) (refer-free 2) (argument) (constant 1) (argument) (refer-global cadr) (indirect) (apply) (argument) (constant 3) (argument) (refer-global +) (indirect) (apply) (constant 0) (argument) (constant 3) (argument) (refer-global +) (indirect) (apply) (argument) (frame 35) (refer-let 0 2) (test 24) (frame 15) (frame 8) (refer-free 2) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 1) (argument) (refer-global cadr) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (refer-free 2) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 4) (argument) (refer-global compile) (indirect) (apply) (argument) (constant 3) (argument) (refer-global make-boxes) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (exit-let 5) (argument) (constant 2) (argument) (refer-nil) (argument) (enter-let) (box 0) (refer-free 1) (argument) (refer-free 0) (argument) (refer-let 0 0) (argument) (close 3 67 2 -1) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global no) (indirect) (apply) (test 3) (refer-local 0) (return 3) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (frame 39) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (refer-free 1) (argument) (refer-free 2) (argument) (frame 19) (constant argument) (argument) (frame 10) (refer-local 0) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 4) (argument) (refer-global compile) (indirect) (apply) (argument) (constant 2) (argument) (refer-free 0) (indirect) (shift 3 3) (apply) (assign-let 0 0) (exit-let 2) (shift 3 6) (apply) (argument) (frame 8) (refer-local 3) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 9) (apply) (frame 10) (refer-let 0 0) (argument) (constant do) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 100) (refer-local 0) (argument) (refer-local 1) (argument) (refer-local 2) (argument) (close 3 77 1 0) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global rev) (indirect) (apply) (argument) (refer-free 2) (argument) (constant 2) (argument) (refer-nil) (argument) (enter-let) (box 0) (refer-free 1) (argument) (refer-free 0) (argument) (refer-let 0 0) (argument) (close 3 49 2 -1) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global no) (indirect) (apply) (test 3) (refer-local 0) (return 3) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (frame 21) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (refer-free 1) (argument) (refer-free 2) (argument) (refer-local 0) (argument) (constant 4) (argument) (refer-global compile) (indirect) (apply) (argument) (constant 2) (argument) (refer-free 0) (indirect) (shift 3 3) (apply) (assign-let 0 0) (exit-let 2) (shift 3 2) (apply) (argument) (frame 8) (refer-local 3) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 9) (apply) (frame 10) (refer-let 0 0) (argument) (constant %if) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 96) (refer-local 0) (argument) (refer-local 1) (argument) (refer-local 2) (argument) (close 3 73 3 -1) (frame 14) (refer-local 1) (argument) (refer-free 0) (argument) (refer-free 1) (argument) (refer-free 2) (argument) (constant 4) (argument) (refer-global compile) (indirect) (apply) (argument) (frame 14) (refer-local 0) (argument) (refer-free 0) (argument) (refer-free 1) (argument) (refer-free 2) (argument) (constant 4) (argument) (refer-global compile) (indirect) (apply) (argument) (enter-let) (refer-local 2) (argument) (refer-free 0) (argument) (refer-free 1) (argument) (frame 28) (constant test) (argument) (frame 19) (refer-let 0 1) (argument) (frame 10) (refer-let 0 0) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 4) (argument) (refer-global compile) (indirect) (shift 5 7) (apply) (argument) (frame 8) (refer-local 3) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 9) (apply) (frame 10) (refer-let 0 0) (argument) (constant assign) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 249) (refer-local 1) (argument) (refer-local 0) (argument) (refer-local 2) (argument) (close 3 226 2 -1) (refer-local 1) (argument) (refer-free 0) (argument) (refer-free 1) (argument) (refer-free 1) (argument) (refer-free 2) (argument) (refer-free 0) (argument) (refer-local 0) (argument) (close 4 51 2 -1) (refer-free 0) (argument) (refer-free 1) (argument) (refer-free 2) (argument) (frame 37) (constant assign-let) (argument) (frame 28) (refer-local 1) (argument) (frame 19) (refer-local 0) (argument) (frame 10) (refer-free 3) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 4) (argument) (refer-global compile) (indirect) (shift 5 3) (apply) (argument) (refer-free 1) (argument) (refer-free 2) (argument) (refer-free 0) (argument) (refer-local 0) (argument) (close 4 42 1 -1) (refer-free 0) (argument) (refer-free 1) (argument) (refer-free 2) (argument) (frame 28) (constant assign-local) (argument) (frame 19) (refer-local 0) (argument) (frame 10) (refer-free 3) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 4) (argument) (refer-global compile) (indirect) (shift 5 2) (apply) (argument) (refer-free 1) (argument) (refer-free 2) (argument) (refer-free 0) (argument) (refer-local 0) (argument) (close 4 42 1 -1) (refer-free 0) (argument) (refer-free 1) (argument) (refer-free 2) (argument) (frame 28) (constant assign-free) (argument) (frame 19) (refer-local 0) (argument) (frame 10) (refer-free 3) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 4) (argument) (refer-global compile) (indirect) (shift 5 2) (apply) (argument) (refer-free 1) (argument) (refer-free 2) (argument) (refer-free 0) (argument) (refer-local 0) (argument) (close 4 42 1 -1) (refer-free 0) (argument) (refer-free 1) (argument) (refer-free 2) (argument) (frame 28) (constant assign-global) (argument) (frame 19) (refer-local 0) (argument) (frame 10) (refer-free 3) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 4) (argument) (refer-global compile) (indirect) (shift 5 2) (apply) (argument) (constant 7) (argument) (refer-global compile-lookup) (indirect) (shift 8 3) (apply) (argument) (frame 8) (refer-local 3) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 9) (apply) (frame 10) (refer-let 0 0) (argument) (constant ccc) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 235) (refer-local 0) (argument) (refer-local 1) (argument) (refer-local 2) (argument) (close 3 212 1 -1) (refer-free 1) (argument) (refer-free 0) (argument) (refer-local 0) (argument) (close 3 150 1 -1) (constant conti) (argument) (frame 140) (refer-local 0) (argument) (frame 131) (frame 122) (constant argument) (argument) (frame 113) (frame 104) (constant constant) (argument) (frame 95) (constant 1) (argument) (frame 86) (frame 77) (constant argument) (argument) (frame 68) (frame 59) (refer-free 0) (argument) (refer-free 1) (argument) (refer-free 2) (argument) (frame 10) (constant 0) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global <) (indirect) (apply) (test 35) (frame 28) (constant shift) (argument) (frame 19) (constant 2) (argument) (frame 10) (refer-local 0) (argument) (constant ((apply))) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 4) (argument) (refer-global compile) (indirect) (apply) (constant (apply)) (argument) (constant 4) (argument) (refer-global compile) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 2) (apply) (argument) (enter-let) (frame 8) (refer-free 2) (argument) (constant 1) (argument) (refer-global tailp) (indirect) (apply) (argument) (enter-let) (refer-let 0 0) (test 8) (refer-let 0 0) (argument) (constant 1) (argument) (refer-let 1 0) (shift 2 6) (apply) (constant frame) (argument) (frame 25) (refer-free 2) (argument) (frame 16) (frame 7) (constant 0) (argument) (constant 1) (argument) (refer-let 1 0) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 6) (apply) (argument) (frame 8) (refer-local 3) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 9) (apply) (frame 45) (frame 38) (frame 8) (refer-local 3) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (frame 22) (frame 15) (frame 8) (refer-local 3) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 1) (argument) (refer-global len) (indirect) (apply) (argument) (constant 1) (argument) (refer-global list) (indirect) (apply) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant 1) (argument) (refer-global rev) (indirect) (apply) (argument) (frame 92) (frame 8) (refer-local 3) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (refer-local 2) (argument) (refer-local 1) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global tailp) (indirect) (apply) (argument) (enter-let) (refer-let 0 0) (test 59) (frame 51) (constant shift) (argument) (frame 42) (frame 24) (frame 15) (frame 8) (refer-local 3) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 1) (argument) (refer-global len) (indirect) (apply) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (frame 10) (refer-let 0 0) (argument) (constant ((apply))) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (exit-let 2) (argument) (constant 4) (argument) (refer-global compile) (indirect) (apply) (constant (apply)) (exit-let 2) (argument) (constant 4) (argument) (refer-global compile) (indirect) (apply) (argument) (constant 2) (argument) (refer-nil) (argument) (enter-let) (box 0) (refer-local 1) (argument) (refer-local 2) (argument) (refer-let 0 0) (argument) (refer-local 0) (argument) (close 4 104 2 -1) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global no) (indirect) (apply) (test 40) (frame 8) (refer-free 0) (argument) (constant 1) (argument) (refer-global tailp) (indirect) (apply) (test 3) (refer-local 0) (return 3) (constant frame) (argument) (frame 19) (refer-free 0) (argument) (frame 10) (refer-local 0) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 3) (apply) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (frame 39) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (refer-free 2) (argument) (refer-free 3) (argument) (frame 19) (constant argument) (argument) (frame 10) (refer-local 0) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 4) (argument) (refer-global compile) (indirect) (apply) (argument) (constant 2) (argument) (refer-free 1) (indirect) (shift 3 3) (apply) (assign-let 0 0) (exit-let 2) (shift 3 9) (apply) (constant constant) (argument) (frame 19) (refer-local 3) (argument) (frame 10) (refer-local 0) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 7) (apply) (assign-global compile) (halt))",
"((close 0 1855 2 -1) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (enter-let) (frame 10) (refer-let 0 0) (argument) (constant frame) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 121) (refer-local 0) (argument) (close 1 102 2 -1) (frame 19) (refer-local 0) (argument) (frame 10) (refer-free 0) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-global preproc) (indirect) (apply) (argument) (enter-let) (frame 35) (constant frame) (argument) (frame 26) (frame 17) (frame 8) (refer-let 0 0) (argument) (constant 1) (argument) (refer-global len) (indirect) (apply) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (frame 37) (refer-let 0 0) (argument) (frame 28) (refer-local 1) (argument) (frame 19) (refer-free 0) (argument) (frame 8) (refer-let 0 0) (argument) (constant 1) (argument) (refer-global len) (indirect) (apply) (argument) (constant 1) (argument) (constant 3) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-global preproc) (indirect) (apply) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 5) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 5) (apply) (frame 10) (refer-let 0 0) (argument) (constant close) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 148) (refer-local 0) (argument) (close 1 129 5 -1) (frame 19) (refer-local 1) (argument) (frame 10) (refer-free 0) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-global preproc) (indirect) (apply) (argument) (enter-let) (frame 62) (constant close) (argument) (frame 53) (refer-local 4) (argument) (frame 44) (frame 17) (frame 8) (refer-let 0 0) (argument) (constant 1) (argument) (refer-global len) (indirect) (apply) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (frame 19) (refer-local 3) (argument) (frame 10) (refer-local 2) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (frame 37) (refer-let 0 0) (argument) (frame 28) (refer-local 0) (argument) (frame 19) (refer-free 0) (argument) (frame 8) (refer-let 0 0) (argument) (constant 1) (argument) (refer-global len) (indirect) (apply) (argument) (constant 1) (argument) (constant 3) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-global preproc) (indirect) (apply) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 8) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 5) (apply) (frame 10) (refer-let 0 0) (argument) (constant test) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 121) (refer-local 0) (argument) (close 1 102 2 -1) (frame 19) (refer-local 1) (argument) (frame 10) (refer-free 0) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-global preproc) (indirect) (apply) (argument) (enter-let) (frame 35) (constant test) (argument) (frame 26) (frame 17) (frame 8) (refer-let 0 0) (argument) (constant 1) (argument) (refer-global len) (indirect) (apply) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (frame 37) (refer-let 0 0) (argument) (frame 28) (refer-local 0) (argument) (frame 19) (refer-free 0) (argument) (frame 8) (refer-let 0 0) (argument) (constant 1) (argument) (refer-global len) (indirect) (apply) (argument) (constant 1) (argument) (constant 3) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-global preproc) (indirect) (apply) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 5) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 5) (apply) (frame 10) (refer-let 0 0) (argument) (constant conti) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 66) (refer-local 0) (argument) (close 1 47 2 -1) (frame 19) (constant conti) (argument) (frame 10) (refer-local 1) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (frame 19) (refer-local 0) (argument) (frame 10) (refer-free 0) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-global preproc) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 3) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 5) (apply) (frame 10) (refer-let 0 0) (argument) (constant shift) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 75) (refer-local 0) (argument) (close 1 56 3 -1) (frame 28) (constant shift) (argument) (frame 19) (refer-local 2) (argument) (frame 10) (refer-local 1) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (frame 19) (refer-local 0) (argument) (frame 10) (refer-free 0) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-global preproc) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 4) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 5) (apply) (frame 10) (refer-let 0 0) (argument) (constant constant) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 66) (refer-local 0) (argument) (close 1 47 2 -1) (frame 19) (constant constant) (argument) (frame 10) (refer-local 1) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (frame 19) (refer-local 0) (argument) (frame 10) (refer-free 0) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-global preproc) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 3) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 5) (apply) (frame 10) (refer-let 0 0) (argument) (constant argument) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 48) (refer-local 0) (argument) (close 1 29 1 -1) (constant (argument)) (argument) (frame 19) (refer-local 0) (argument) (frame 10) (refer-free 0) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-global preproc) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 2) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 5) (apply) (frame 10) (refer-let 0 0) (argument) (constant refer-let) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 75) (refer-local 0) (argument) (close 1 56 3 -1) (frame 28) (constant refer-let) (argument) (frame 19) (refer-local 2) (argument) (frame 10) (refer-local 1) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (frame 19) (refer-local 0) (argument) (frame 10) (refer-free 0) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-global preproc) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 4) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 5) (apply) (frame 10) (refer-let 0 0) (argument) (constant refer-local) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 66) (refer-local 0) (argument) (close 1 47 2 -1) (frame 19) (constant refer-local) (argument) (frame 10) (refer-local 1) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (frame 19) (refer-local 0) (argument) (frame 10) (refer-free 0) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-global preproc) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 3) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 5) (apply) (frame 10) (refer-let 0 0) (argument) (constant refer-free) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 66) (refer-local 0) (argument) (close 1 47 2 -1) (frame 19) (constant refer-free) (argument) (frame 10) (refer-local 1) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (frame 19) (refer-local 0) (argument) (frame 10) (refer-free 0) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-global preproc) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 3) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 5) (apply) (frame 10) (refer-let 0 0) (argument) (constant refer-global) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 66) (refer-local 0) (argument) (close 1 47 2 -1) (frame 19) (constant refer-global) (argument) (frame 10) (refer-local 1) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (frame 19) (refer-local 0) (argument) (frame 10) (refer-free 0) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-global preproc) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 3) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 5) (apply) (frame 10) (refer-let 0 0) (argument) (constant refer-nil) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 48) (refer-local 0) (argument) (close 1 29 1 -1) (constant (refer-nil)) (argument) (frame 19) (refer-local 0) (argument) (frame 10) (refer-free 0) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-global preproc) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 2) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 5) (apply) (frame 10) (refer-let 0 0) (argument) (constant refer-t) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 48) (refer-local 0) (argument) (close 1 29 1 -1) (constant (refer-t)) (argument) (frame 19) (refer-local 0) (argument) (frame 10) (refer-free 0) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-global preproc) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 2) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 5) (apply) (frame 10) (refer-let 0 0) (argument) (constant enter-let) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 48) (refer-local 0) (argument) (close 1 29 1 -1) (constant (enter-let)) (argument) (frame 19) (refer-local 0) (argument) (frame 10) (refer-free 0) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-global preproc) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 2) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 5) (apply) (frame 10) (refer-let 0 0) (argument) (constant exit-let) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 66) (refer-local 0) (argument) (close 1 47 2 -1) (frame 19) (constant exit-let) (argument) (frame 10) (refer-local 1) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (frame 19) (refer-local 0) (argument) (frame 10) (refer-free 0) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-global preproc) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 3) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 5) (apply) (frame 10) (refer-let 0 0) (argument) (constant assign-let) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 75) (refer-local 0) (argument) (close 1 56 3 -1) (frame 28) (constant assign-let) (argument) (frame 19) (refer-local 2) (argument) (frame 10) (refer-local 1) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (frame 19) (refer-local 0) (argument) (frame 10) (refer-free 0) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-global preproc) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 4) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 5) (apply) (frame 10) (refer-let 0 0) (argument) (constant assign-local) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 66) (refer-local 0) (argument) (close 1 47 2 -1) (frame 19) (constant assign-local) (argument) (frame 10) (refer-local 1) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (frame 19) (refer-local 0) (argument) (frame 10) (refer-free 0) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-global preproc) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 3) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 5) (apply) (frame 10) (refer-let 0 0) (argument) (constant assign-free) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 66) (refer-local 0) (argument) (close 1 47 2 -1) (frame 19) (constant assign-free) (argument) (frame 10) (refer-local 1) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (frame 19) (refer-local 0) (argument) (frame 10) (refer-free 0) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-global preproc) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 3) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 5) (apply) (frame 10) (refer-let 0 0) (argument) (constant assign-global) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 66) (refer-local 0) (argument) (close 1 47 2 -1) (frame 19) (constant assign-global) (argument) (frame 10) (refer-local 1) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (frame 19) (refer-local 0) (argument) (frame 10) (refer-free 0) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-global preproc) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 3) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 5) (apply) (frame 10) (refer-let 0 0) (argument) (constant box) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 66) (refer-local 0) (argument) (close 1 47 2 -1) (frame 19) (constant box) (argument) (frame 10) (refer-local 1) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (frame 19) (refer-local 0) (argument) (frame 10) (refer-free 0) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-global preproc) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 3) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 5) (apply) (frame 10) (refer-let 0 0) (argument) (constant indirect) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 48) (refer-local 0) (argument) (close 1 29 1 -1) (constant (indirect)) (argument) (frame 19) (refer-local 0) (argument) (frame 10) (refer-free 0) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-global preproc) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 2) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 5) (apply) (frame 10) (refer-let 0 0) (argument) (constant apply) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 20) (close 0 3 0 -1) (constant ((apply))) (return 1) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 5) (apply) (frame 10) (refer-let 0 0) (argument) (constant return) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 46) (close 0 29 1 -1) (frame 19) (constant return) (argument) (frame 10) (refer-local 0) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 2) (apply) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 5) (apply) (frame 10) (refer-let 0 0) (argument) (constant halt) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 20) (close 0 3 0 -1) (constant ((halt))) (return 1) (argument) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 5) (apply) (refer-nil) (exit-let 2) (return 3) (assign-global preproc) (halt))",
"((close 0 31 1 -1) (frame 21) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global expand-macro) (indirect) (apply) (argument) (constant nil) (argument) (constant nil) (argument) (constant (halt)) (argument) (constant 4) (argument) (refer-global compile) (indirect) (apply) (argument) (constant 0) (argument) (constant 2) (argument) (refer-global preproc) (indirect) (shift 3 2) (apply) (assign-global do-compile) (halt))",
"((close 0 40 2 -1) (frame 10) (refer-local 1) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global <) (indirect) (apply) (test 3) (refer-local 0) (return 3) (frame 10) (refer-local 1) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global -) (indirect) (apply) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global nthcdr) (indirect) (shift 3 3) (apply) (assign-global nthcdr) (halt))",
"((close 0 15 2 -1) (refer-local 1) (test 11) (refer-local 1) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 3) (apply) (refer-local 0) (return 3) (assign-global consif) (halt))",
"((close 0 104 2 -1) (refer-local 0) (test 56) (frame 10) (constant 0) (argument) (refer-local 1) (argument) (constant 2) (argument) (refer-global <) (indirect) (apply) (test 43) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (frame 26) (frame 10) (refer-local 1) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global -) (indirect) (apply) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global firstn) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 3) (apply) (refer-nil) (return 3) (refer-nil) (test 43) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (frame 26) (frame 10) (refer-local 1) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global -) (indirect) (apply) (argument) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 2) (argument) (refer-global firstn) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 3) (apply) (refer-nil) (return 3) (assign-global firstn) (halt))",
"((close 0 54 2 -1) (refer-local 0) (argument) (constant 1) (argument) (refer-nil) (argument) (enter-let) (box 0) (refer-let 0 0) (argument) (refer-local 1) (argument) (close 2 37 1 -1) (refer-local 0) (test 33) (frame 14) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (constant 1) (argument) (refer-free 0) (apply) (test 3) (refer-local 0) (return 2) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 1) (argument) (refer-free 1) (indirect) (shift 2 2) (apply) (refer-nil) (return 2) (assign-let 0 0) (exit-let 2) (shift 2 3) (apply) (assign-global %mem-fn) (halt))",
"((close 0 67 2 -1) (refer-local 0) (argument) (constant 0) (argument) (constant 2) (argument) (refer-nil) (argument) (enter-let) (box 0) (refer-let 0 0) (argument) (refer-local 1) (argument) (close 2 48 2 -1) (refer-local 1) (test 44) (frame 14) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (constant 1) (argument) (refer-free 0) (apply) (test 3) (refer-local 0) (return 3) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (frame 10) (refer-local 0) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-free 1) (indirect) (shift 3 3) (apply) (refer-nil) (return 3) (assign-let 0 0) (exit-let 2) (shift 3 3) (apply) (assign-global %pos-fn) (halt))",
"((close 0 3 3 -1) (refer-nil) (return 4) (assign-global %union-fn) (halt))",
"((close 0 44 1 -1) (frame 17) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global type) (indirect) (apply) (argument) (constant cons) (argument) (constant 2) (argument) (refer-global is) (indirect) (apply) (test 12) (refer-global flat) (indirect) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global mappend) (indirect) (shift 3 2) (apply) (refer-local 0) (test 11) (refer-local 0) (argument) (refer-nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 2) (apply) (refer-nil) (return 2) (assign-global flat) (halt))",
"((close 0 33 2 -1) (refer-local 1) (argument) (close 1 21 1 -1) (frame 7) (refer-local 0) (argument) (constant 1) (argument) (refer-free 0) (apply) (test 11) (refer-local 0) (argument) (refer-nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 2) (apply) (refer-nil) (return 2) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global mappend) (indirect) (shift 3 3) (apply) (assign-global keep) (halt))",
"((close 0 69 2 -1) (refer-local 0) (argument) (refer-nil) (argument) (constant 2) (argument) (refer-nil) (argument) (enter-let) (box 0) (refer-local 1) (argument) (refer-let 0 0) (argument) (close 2 50 2 -1) (refer-local 1) (test 40) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (frame 23) (frame 14) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (constant 1) (argument) (refer-free 1) (apply) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-free 0) (indirect) (shift 3 3) (apply) (refer-local 0) (argument) (constant 1) (argument) (refer-global nrev) (indirect) (shift 2 3) (apply) (assign-let 0 0) (exit-let 2) (shift 3 3) (apply) (assign-global map) (halt))",
"((close 0 87 2 -1) (frame 68) (refer-local 0) (argument) (refer-nil) (argument) (constant 2) (argument) (refer-nil) (argument) (enter-let) (box 0) (refer-local 1) (argument) (refer-let 0 0) (argument) (close 2 50 2 -1) (refer-local 1) (test 40) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (frame 23) (frame 14) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (constant 1) (argument) (refer-free 1) (apply) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global cons) (indirect) (apply) (argument) (constant 2) (argument) (refer-free 0) (indirect) (shift 3 3) (apply) (refer-local 0) (argument) (constant 1) (argument) (refer-global nrev) (indirect) (shift 2 3) (apply) (assign-let 0 0) (exit-let 2) (apply) (argument) (enter-let) (refer-let 0 0) (test 12) (refer-global +) (indirect) (argument) (refer-let 0 0) (argument) (constant 2) (argument) (refer-global apply) (indirect) (shift 3 5) (apply) (refer-nil) (exit-let 2) (return 3) (assign-global mappend) (halt))",
"((close 0 73 2 -1) (refer-local 1) (test 69) (frame 17) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global mem) (indirect) (apply) (test 18) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global set-minus) (indirect) (shift 3 3) (apply) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (frame 17) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global set-minus) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 3) (apply) (refer-nil) (return 3) (assign-global set-minus) (halt))",
"((close 0 73 2 -1) (refer-local 1) (test 69) (frame 17) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global mem) (indirect) (apply) (test 34) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (frame 17) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global set-intersect) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 3) (apply) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (refer-local 0) (argument) (constant 2) (argument) (refer-global set-intersect) (indirect) (shift 3 3) (apply) (refer-nil) (return 3) (assign-global set-intersect) (halt))",
"((close 0 62 1 -1) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global no) (indirect) (apply) (test 3) (refer-nil) (return 2) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global atom) (indirect) (apply) (test 11) (refer-local 0) (argument) (refer-nil) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 2) (apply) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global car) (indirect) (apply) (argument) (frame 15) (frame 8) (refer-local 0) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (constant 1) (argument) (refer-global dotted-to-proper) (indirect) (apply) (argument) (constant 2) (argument) (refer-global cons) (indirect) (shift 3 2) (apply) (assign-global dotted-to-proper) (halt))",
"((close 0 66 1 -1) (refer-local 0) (argument) (constant 0) (argument) (constant 2) (argument) (refer-nil) (argument) (enter-let) (box 0) (refer-let 0 0) (argument) (close 1 49 2 -1) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global no) (indirect) (apply) (test 3) (constant -1) (return 3) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global atom) (indirect) (apply) (test 3) (refer-local 0) (return 3) (frame 8) (refer-local 1) (argument) (constant 1) (argument) (refer-global cdr) (indirect) (apply) (argument) (frame 10) (refer-local 0) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (apply) (argument) (constant 2) (argument) (refer-free 0) (indirect) (shift 3 3) (apply) (assign-let 0 0) (exit-let 2) (shift 3 2) (apply) (assign-global dotted-pos) (halt))",
"((close 0 11 1 -1) (refer-local 0) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global +) (indirect) (shift 3 2) (apply) (assign-global inc) (halt))",
"((close 0 11 1 -1) (refer-local 0) (argument) (constant 1) (argument) (constant 2) (argument) (refer-global -) (indirect) (shift 3 2) (apply) (assign-global dec) (halt))",
];/** @} */

var VM = classify("VM", {
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
    global: {},
    reader: null
  },
  method: {
    init: function() {
      for (var p in primitives) {
        this.global[p] = new Box(primitives[p]);
      }
      this.reader = new Reader();
      for (var i=0,l=preload.length; i<l; i++) {
        var def = preload[i];
        this.run(def);
      }
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
        case 'assign-local':
        case 'assign-free':
        case 'frame':
        case 'return':
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
        this.global = {};
        for (var p in primitives) {
          this.global[p] = new Box(primitives[p]);
        }
      }
    },
    step: function() {
      return this.run(false, false, true);
    },
    run: function(asm_string, clean_all, step) {
      if (!step) this.cleanup(clean_all);
      if (asm_string)   this.load_string(asm_string);
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
          //this.l = this.stack.index(this.l, 0);
          //this.s = this.l;
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
          var name = op[1]; // symbol
          this.a = this.global[name];
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
          if (this.a === void(0)) {
            console.log('here');
          }
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
          this.a = new Closure(this.x, this.p + 1, n, v, d, this.stack, this.s);
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
        case 'shift':
          n = op[1];
          m = op[2];
          this.s = this.stack.shift(n, m, this.s);
          this.p++;
          break;
        case 'apply':
          var fn = this.a;
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
            this.a = this.a.apply(nil, this.stack.range_get(this.s - 1 - vlen, this.s - 2));
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
          this.a = new Continuation(this.stack, n, this.s);
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
/** @} */

  $(function() {
    var vm = new VM();

    function compile_srv() {
      $.ajax({
        url: '/arc-compiler',
        type: 'POST',
        data: {
          code: $("#arc").val()
        }
      }).done(function(res) {
        vm.cleanup();
        vm.load_string(res);
        show_asm(res);
      }).error(function(r) {
        alert(r.responseText);
      });
    }

    function read_compile() {
      var code = $("#arc").val();
      var asm = [
        ['frame', 8],
        ['constant', vm.reader.read(code)],
        ['argument'],
        ['constant', 1],
        ['argument'],
        ['refer-global', 'do-compile'],
        ['indirect'],
        ['apply'],
        ['halt']
      ];
      vm.cleanup();
      vm.set_asm(asm);
      var compiled = vm.run();
      vm.cleanup();
      vm.load(compiled);
      show_asm(res);
      reset();
    }

    function run() {
      var rt = stringify(vm.run());
      $('#res').text(rt);
    }

    function show_asm(asm) {
      var tbl = $("<table/>");
      for (var i=0, l=vm.x.length; i<l; i++) {
        var tr = $("<tr/>");
        if (vm.p == i) tr.addClass('p');
        var td = $("<td>" + i + "</td>");
        var td2 = $("<td/>");
        td2.text(vm.x[i]);
        tbl.append(tr.append(td, td2));
      }
      $("#asm").html(tbl);
      var h = tbl.height();
      var top = ((h / l) * vm.p)
      $("#asm").scrollTop(top);
    }

    function show_stack() {
      var tbl = $("<table/>");
      var h = 50;
      var stack = vm.stack.stack;
      var slen = stack.length;
      var top = Math.max(h, slen+1);
      for (var i=top; (top-h-1)<i; i--) {
        var tr = $("<tr/>",
                   (i == vm.s) ? {class: "s"} :
                   (i == vm.f) ? {class: "f"} :
                   (i == vm.l) ? {class: "l"} : {});
        var td = $("<td>" + i + "</td>");
        var td2 = $("<td/>");
        td2.text(((i < slen) ? (stringify(stack[i])+'').slice(0, 50) : ' ---- '));
        tbl.append(tr.append(td, td2));
      }
      $("#stack").html(tbl);
      var scroll_top = ((tbl.height() / (h + 1)) * (h - vm.s));
      $("#stack").scrollTop(scroll_top);
    }

    function show_status() {
      $("#status").text(
        ("[" + vm.count + "] " +
         " a: " + (stringify(vm.a)+'').slice(0, 30) +
         " f: " + vm.f +
         " l: " + vm.l +
         " c: " + vm.c +
         " s: " + vm.s));
    }

    function step() {
      var rt;
      try {
        rt = vm.step();
      } catch (e) {
        $('#res').text(e+'');
        throw e;
      }
      show_stack();
      show_asm();
      show_status();
      if (rt !== void(0))
        $('#res').text(stringify(rt));
    }

    function reset() {
      vm.cleanup();
      show_stack();
      show_asm();
      show_status();
    }

    $("#read-compile-btn").click(read_compile);
    $("#compile-srv-btn").click(compile_srv);
    $("#run-btn").click(run);
    $("#step-btn").click(step);
    $("#reset-btn").click(reset);

    $("#arc").val(
      ("(def fib (n)\n" +
       "  (if (< n 2)\n"+
       "      n\n" +
       "      (+ (fib (- n 1)) (fib (- n 2)))))\n\n; (fib 10)"));
    read_compile();

  });



})();
/** @} */
