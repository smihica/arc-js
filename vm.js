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
      return this.whitespace_p(c) || (-1 < '()[]";'.indexOf(c));
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
var preload = [];
/** @file core.fasl { */
// This is an auto generated file.
// Compiled from ['/Users/smihica/code/arc-js/src/arc/core.arc'].
// DON'T EDIT !!!
preload.push.apply(preload, [
[1,0,40,2,-1,0,10,8,1,6,5,"1",6,5,"2",6,10,"<",19,20,2,3,8,0,21,3,0,10,8,1,6,5,"1",6,5,"2",6,10,"-",19,20,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"nthcdr",19,4,3,3,20,17,"nthcdr",22,],
[1,0,15,2,-1,8,1,2,11,8,1,6,8,0,6,5,"2",6,10,"cons",19,4,3,3,20,8,0,21,3,17,"consif",22,],
[1,0,104,2,-1,8,0,2,56,0,10,5,"0",6,8,1,6,5,"2",6,10,"<",19,20,2,43,0,8,8,0,6,5,"1",6,10,"car",19,20,6,0,26,0,10,8,1,6,5,"1",6,5,"2",6,10,"-",19,20,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"firstn",19,20,6,5,"2",6,10,"cons",19,4,3,3,20,11,21,3,11,2,43,0,8,8,0,6,5,"1",6,10,"car",19,20,6,0,26,0,10,8,1,6,5,"1",6,5,"2",6,10,"-",19,20,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"firstn",19,20,6,5,"2",6,10,"cons",19,4,3,3,20,11,21,3,17,"firstn",22,],
[1,0,54,2,-1,8,0,6,5,"1",6,11,6,13,18,0,7,0,0,6,8,1,6,1,2,37,1,-1,8,0,2,33,0,14,0,8,8,0,6,5,"1",6,10,"car",19,20,6,5,"1",6,9,0,20,2,3,8,0,21,2,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"1",6,9,1,19,4,2,2,20,11,21,2,15,0,0,14,2,4,2,3,20,17,"%mem-fn",22,],
[1,0,67,2,-1,8,0,6,5,"0",6,5,"2",6,11,6,13,18,0,7,0,0,6,8,1,6,1,2,48,2,-1,8,1,2,44,0,14,0,8,8,1,6,5,"1",6,10,"car",19,20,6,5,"1",6,9,0,20,2,3,8,0,21,3,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,0,10,8,0,6,5,"1",6,5,"2",6,10,"+",19,20,6,5,"2",6,9,1,19,4,3,3,20,11,21,3,15,0,0,14,2,4,3,3,20,17,"%pos-fn",22,],
[1,0,3,3,-1,11,21,4,17,"%union-fn",22,],
[1,0,44,1,-1,0,17,0,8,8,0,6,5,"1",6,10,"type",19,20,6,5,"cons",6,5,"2",6,10,"is",19,20,2,12,10,"flat",19,6,8,0,6,5,"2",6,10,"mappend",19,4,3,2,20,8,0,2,11,8,0,6,11,6,5,"2",6,10,"cons",19,4,3,2,20,11,21,2,17,"flat",22,],
[1,0,33,2,-1,8,1,6,1,1,21,1,-1,0,7,8,0,6,5,"1",6,9,0,20,2,11,8,0,6,11,6,5,"2",6,10,"cons",19,4,3,2,20,11,21,2,6,8,0,6,5,"2",6,10,"mappend",19,4,3,3,20,17,"keep",22,],
[1,0,69,2,-1,8,0,6,11,6,5,"2",6,11,6,13,18,0,8,1,6,7,0,0,6,1,2,50,2,-1,8,1,2,40,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,0,23,0,14,0,8,8,1,6,5,"1",6,10,"car",19,20,6,5,"1",6,9,1,20,6,8,0,6,5,"2",6,10,"cons",19,20,6,5,"2",6,9,0,19,4,3,3,20,8,0,6,5,"1",6,10,"nrev",19,4,2,3,20,15,0,0,14,2,4,3,3,20,17,"map",22,],
[1,0,87,2,-1,0,68,8,0,6,11,6,5,"2",6,11,6,13,18,0,8,1,6,7,0,0,6,1,2,50,2,-1,8,1,2,40,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,0,23,0,14,0,8,8,1,6,5,"1",6,10,"car",19,20,6,5,"1",6,9,1,20,6,8,0,6,5,"2",6,10,"cons",19,20,6,5,"2",6,9,0,19,4,3,3,20,8,0,6,5,"1",6,10,"nrev",19,4,2,3,20,15,0,0,14,2,20,6,13,7,0,0,2,12,10,"+",19,6,7,0,0,6,5,"2",6,10,"apply",19,4,3,5,20,11,14,2,21,3,17,"mappend",22,],
[1,0,11,1,-1,8,0,6,5,"1",6,5,"2",6,10,"+",19,4,3,2,20,17,"inc",22,],
[1,0,11,1,-1,8,0,6,5,"1",6,5,"2",6,10,"-",19,4,3,2,20,17,"dec",22,],]);/** @} */
/** @file compiler.fasl { */
// This is an auto generated file.
// Compiled from ['/Users/smihica/code/arc-js/src/arc/compiler.arc'].
// DON'T EDIT !!!
preload.push.apply(preload, [
[1,0,73,2,-1,8,1,2,69,0,17,0,8,8,1,6,5,"1",6,10,"car",19,20,6,8,0,6,5,"2",6,10,"mem",19,20,2,18,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,8,0,6,5,"2",6,10,"set-minus",19,4,3,3,20,0,8,8,1,6,5,"1",6,10,"car",19,20,6,0,17,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,8,0,6,5,"2",6,10,"set-minus",19,20,6,5,"2",6,10,"cons",19,4,3,3,20,11,21,3,17,"set-minus",22,],
[1,0,73,2,-1,8,1,2,69,0,17,0,8,8,1,6,5,"1",6,10,"car",19,20,6,8,0,6,5,"2",6,10,"mem",19,20,2,34,0,8,8,1,6,5,"1",6,10,"car",19,20,6,0,17,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,8,0,6,5,"2",6,10,"set-intersect",19,20,6,5,"2",6,10,"cons",19,4,3,3,20,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,8,0,6,5,"2",6,10,"set-intersect",19,4,3,3,20,11,21,3,17,"set-intersect",22,],
[1,0,62,1,-1,0,8,8,0,6,5,"1",6,10,"no",19,20,2,3,11,21,2,0,8,8,0,6,5,"1",6,10,"atom",19,20,2,11,8,0,6,11,6,5,"2",6,10,"cons",19,4,3,2,20,0,8,8,0,6,5,"1",6,10,"car",19,20,6,0,15,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"1",6,10,"dotted-to-proper",19,20,6,5,"2",6,10,"cons",19,4,3,2,20,17,"dotted-to-proper",22,],
[1,0,66,1,-1,8,0,6,5,"0",6,5,"2",6,11,6,13,18,0,7,0,0,6,1,1,49,2,-1,0,8,8,1,6,5,"1",6,10,"no",19,20,2,3,5,"-1",21,3,0,8,8,1,6,5,"1",6,10,"atom",19,20,2,3,8,0,21,3,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,0,10,8,0,6,5,"1",6,5,"2",6,10,"+",19,20,6,5,"2",6,9,0,19,4,3,3,20,15,0,0,14,2,4,3,2,20,17,"dotted-pos",22,],
[1,0,190,1,-1,3,2,6,5,"1",6,8,0,6,1,1,181,1,-1,9,0,6,5,"1",6,11,6,13,18,0,7,0,0,6,8,0,6,1,2,164,1,-1,0,8,8,0,6,5,"1",6,10,"type",19,20,6,13,0,10,7,0,0,6,5,"cons",6,5,"2",6,10,"is",19,20,2,140,0,8,8,0,6,5,"1",6,10,"car",19,20,6,13,0,10,7,0,0,6,5,"unquote",6,5,"2",6,10,"is",19,20,2,27,9,0,6,1,1,8,1,-1,12,6,5,"1",6,9,0,4,2,2,20,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,6,20,0,10,7,0,0,6,5,"unquote-splicing",6,5,"2",6,10,"is",19,20,2,27,9,0,6,1,1,8,1,-1,12,6,5,"1",6,9,0,4,2,2,20,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,6,20,8,0,6,5,"1",6,11,6,13,18,0,7,0,0,6,9,1,6,1,2,39,1,-1,8,0,2,35,0,8,8,0,6,5,"1",6,10,"car",19,20,6,13,0,8,7,0,0,6,5,"1",6,9,0,19,20,14,2,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"1",6,9,1,19,4,2,2,20,11,21,2,15,0,0,14,2,4,2,6,20,11,14,2,21,2,15,0,0,14,2,4,2,2,20,4,2,2,20,17,"find-qq-eval",22,],
[1,0,894,1,-1,0,8,8,0,6,5,"1",6,10,"find-qq-eval",19,20,2,451,0,17,0,8,8,0,6,5,"1",6,10,"type",19,20,6,5,"cons",6,5,"2",6,10,"is",19,20,2,423,0,8,8,0,6,5,"1",6,10,"car",19,20,6,13,0,10,7,0,0,6,5,"unquote",6,5,"2",6,10,"is",19,20,2,20,1,0,3,1,-1,8,0,21,2,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,4,20,0,10,7,0,0,6,5,"unquote-splicing",6,5,"2",6,10,"is",19,20,2,26,1,0,9,1,-1,5,"\"cannot use ,@ after .\"",6,5,"1",6,10,"err",19,4,2,2,20,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,4,20,0,15,0,8,8,0,6,5,"1",6,10,"car",19,20,6,5,"1",6,10,"type",19,20,6,13,0,10,7,0,0,6,5,"cons",6,5,"2",6,10,"is",19,20,2,279,0,15,0,8,8,0,6,5,"1",6,10,"car",19,20,6,5,"1",6,10,"car",19,20,6,13,0,10,7,0,0,6,5,"quasiquote",6,5,"2",6,10,"is",19,20,2,67,8,0,6,1,1,41,1,-1,5,"cons",6,0,15,0,8,8,0,6,5,"1",6,10,"expand-qq",19,20,6,5,"1",6,10,"qq-pair",19,20,6,0,15,0,8,9,0,6,5,"1",6,10,"cdr",19,20,6,5,"1",6,10,"qq-pair",19,20,6,5,"3",6,10,"list",19,4,4,2,20,6,0,15,0,8,8,0,6,5,"1",6,10,"car",19,20,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,8,20,0,10,7,0,0,6,5,"unquote",6,5,"2",6,10,"is",19,20,2,53,8,0,6,1,1,27,1,-1,5,"cons",6,8,0,6,0,15,0,8,9,0,6,5,"1",6,10,"cdr",19,20,6,5,"1",6,10,"qq-pair",19,20,6,5,"3",6,10,"list",19,4,4,2,20,6,0,15,0,8,8,0,6,5,"1",6,10,"car",19,20,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,8,20,0,10,7,0,0,6,5,"unquote-splicing",6,5,"2",6,10,"is",19,20,2,71,8,0,6,1,1,45,1,-1,0,15,0,8,9,0,6,5,"1",6,10,"cdr",19,20,6,5,"1",6,10,"no",19,20,2,3,8,0,21,2,5,"+",6,8,0,6,0,15,0,8,9,0,6,5,"1",6,10,"cdr",19,20,6,5,"1",6,10,"qq-pair",19,20,6,5,"3",6,10,"list",19,4,4,2,20,6,0,15,0,8,8,0,6,5,"1",6,10,"car",19,20,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,8,20,5,"cons",6,0,15,0,8,8,0,6,5,"1",6,10,"car",19,20,6,5,"1",6,10,"qq-pair",19,20,6,0,15,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"1",6,10,"qq-pair",19,20,6,5,"3",6,10,"list",19,4,4,8,20,5,"cons",6,0,15,0,8,8,0,6,5,"1",6,10,"car",19,20,6,5,"1",6,10,"qq-pair",19,20,6,0,15,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"1",6,10,"qq-pair",19,20,6,5,"3",6,10,"list",19,4,4,6,20,5,"quote",6,8,0,6,5,"2",6,10,"list",19,4,3,2,20,11,2,423,0,8,8,0,6,5,"1",6,10,"car",19,20,6,13,0,10,7,0,0,6,5,"unquote",6,5,"2",6,10,"is",19,20,2,20,1,0,3,1,-1,8,0,21,2,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,4,20,0,10,7,0,0,6,5,"unquote-splicing",6,5,"2",6,10,"is",19,20,2,26,1,0,9,1,-1,5,"\"cannot use ,@ after .\"",6,5,"1",6,10,"err",19,4,2,2,20,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,4,20,0,15,0,8,8,0,6,5,"1",6,10,"car",19,20,6,5,"1",6,10,"type",19,20,6,13,0,10,7,0,0,6,5,"cons",6,5,"2",6,10,"is",19,20,2,279,0,15,0,8,8,0,6,5,"1",6,10,"car",19,20,6,5,"1",6,10,"car",19,20,6,13,0,10,7,0,0,6,5,"quasiquote",6,5,"2",6,10,"is",19,20,2,67,8,0,6,1,1,41,1,-1,5,"cons",6,0,15,0,8,8,0,6,5,"1",6,10,"expand-qq",19,20,6,5,"1",6,10,"qq-pair",19,20,6,0,15,0,8,9,0,6,5,"1",6,10,"cdr",19,20,6,5,"1",6,10,"qq-pair",19,20,6,5,"3",6,10,"list",19,4,4,2,20,6,0,15,0,8,8,0,6,5,"1",6,10,"car",19,20,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,8,20,0,10,7,0,0,6,5,"unquote",6,5,"2",6,10,"is",19,20,2,53,8,0,6,1,1,27,1,-1,5,"cons",6,8,0,6,0,15,0,8,9,0,6,5,"1",6,10,"cdr",19,20,6,5,"1",6,10,"qq-pair",19,20,6,5,"3",6,10,"list",19,4,4,2,20,6,0,15,0,8,8,0,6,5,"1",6,10,"car",19,20,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,8,20,0,10,7,0,0,6,5,"unquote-splicing",6,5,"2",6,10,"is",19,20,2,71,8,0,6,1,1,45,1,-1,0,15,0,8,9,0,6,5,"1",6,10,"cdr",19,20,6,5,"1",6,10,"no",19,20,2,3,8,0,21,2,5,"+",6,8,0,6,0,15,0,8,9,0,6,5,"1",6,10,"cdr",19,20,6,5,"1",6,10,"qq-pair",19,20,6,5,"3",6,10,"list",19,4,4,2,20,6,0,15,0,8,8,0,6,5,"1",6,10,"car",19,20,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,8,20,5,"cons",6,0,15,0,8,8,0,6,5,"1",6,10,"car",19,20,6,5,"1",6,10,"qq-pair",19,20,6,0,15,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"1",6,10,"qq-pair",19,20,6,5,"3",6,10,"list",19,4,4,8,20,5,"cons",6,0,15,0,8,8,0,6,5,"1",6,10,"car",19,20,6,5,"1",6,10,"qq-pair",19,20,6,0,15,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"1",6,10,"qq-pair",19,20,6,5,"3",6,10,"list",19,4,4,6,20,5,"quote",6,8,0,6,5,"2",6,10,"list",19,4,3,2,20,17,"qq-pair",22,],
[1,0,304,1,-1,0,8,8,0,6,5,"1",6,10,"find-qq-eval",19,20,2,156,0,17,0,8,8,0,6,5,"1",6,10,"type",19,20,6,5,"cons",6,5,"2",6,10,"is",19,20,2,128,0,8,8,0,6,5,"1",6,10,"car",19,20,6,13,0,10,7,0,0,6,5,"quasiquote",6,5,"2",6,10,"is",19,20,2,33,1,0,16,1,-1,0,8,8,0,6,5,"1",6,10,"expand-qq",19,20,6,5,"1",6,10,"expand-qq",19,4,2,2,20,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,4,20,0,10,7,0,0,6,5,"unquote",6,5,"2",6,10,"is",19,20,2,20,1,0,3,1,-1,8,0,21,2,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,4,20,0,10,7,0,0,6,5,"unquote-splicing",6,5,"2",6,10,"is",19,20,2,26,1,0,9,1,-1,5,"\",@ cannot be used immediately after `\"",6,5,"1",6,10,"err",19,4,2,2,20,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,4,20,8,0,6,5,"1",6,10,"qq-pair",19,4,2,4,20,5,"quote",6,8,0,6,5,"2",6,10,"list",19,4,3,2,20,11,2,128,0,8,8,0,6,5,"1",6,10,"car",19,20,6,13,0,10,7,0,0,6,5,"quasiquote",6,5,"2",6,10,"is",19,20,2,33,1,0,16,1,-1,0,8,8,0,6,5,"1",6,10,"expand-qq",19,20,6,5,"1",6,10,"expand-qq",19,4,2,2,20,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,4,20,0,10,7,0,0,6,5,"unquote",6,5,"2",6,10,"is",19,20,2,20,1,0,3,1,-1,8,0,21,2,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,4,20,0,10,7,0,0,6,5,"unquote-splicing",6,5,"2",6,10,"is",19,20,2,26,1,0,9,1,-1,5,"\",@ cannot be used immediately after `\"",6,5,"1",6,10,"err",19,4,2,2,20,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,4,20,8,0,6,5,"1",6,10,"qq-pair",19,4,2,4,20,5,"quote",6,8,0,6,5,"2",6,10,"list",19,4,3,2,20,17,"expand-qq",22,],
[1,0,2203,1,-1,0,8,8,0,6,5,"1",6,10,"type",19,20,6,13,0,10,7,0,0,6,5,"cons",6,5,"2",6,10,"is",19,20,2,2179,0,8,8,0,6,5,"1",6,10,"car",19,20,6,13,0,10,7,0,0,6,5,"quote",6,5,"2",6,10,"is",19,20,2,28,1,0,11,1,0,5,"quote",6,8,0,6,5,"2",6,10,"cons",19,4,3,2,20,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,6,20,0,10,7,0,0,6,5,"caselet",6,5,"2",6,10,"is",19,20,2,216,1,0,199,3,2,11,6,13,18,0,7,0,0,6,8,2,6,1,2,135,1,-1,0,15,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"1",6,10,"no",19,20,2,9,8,0,6,5,"1",6,10,"car",19,4,2,2,20,5,"if",6,0,101,0,53,5,"is",6,0,44,9,0,6,0,35,0,26,5,"quote",6,0,17,0,8,8,0,6,5,"1",6,10,"car",19,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,0,40,0,8,8,0,6,5,"1",6,10,"cadr",19,20,6,0,24,0,15,0,8,8,0,6,5,"1",6,10,"cddr",19,20,6,5,"1",6,9,1,19,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,4,3,2,20,15,0,0,14,2,6,13,0,43,5,"let",6,0,34,8,2,6,0,25,8,1,6,0,16,0,7,8,0,6,5,"1",6,7,0,0,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,14,2,6,5,"1",6,10,"expand-macro",19,4,2,4,20,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,6,20,0,10,7,0,0,6,5,"case",6,5,"2",6,10,"is",19,20,2,58,1,0,41,2,1,0,33,5,"caselet",6,0,24,0,6,5,"0",6,10,"uniq",19,20,6,0,10,8,1,6,8,0,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"1",6,10,"expand-macro",19,4,2,3,20,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,6,20,0,10,7,0,0,6,5,"reccase",6,5,"2",6,10,"is",19,20,2,211,1,0,194,2,1,0,17,0,8,8,0,6,5,"1",6,10,"len",19,20,6,5,"1",6,5,"2",6,10,"-",19,20,6,13,0,10,7,0,0,6,8,0,6,5,"2",6,10,"firstn",19,20,6,0,10,7,0,0,6,8,0,6,5,"2",6,10,"nthcdr",19,20,6,13,0,144,5,"case",6,0,135,0,19,5,"car",6,0,10,8,1,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,0,108,0,99,8,1,6,1,1,88,1,-1,0,8,8,0,6,5,"1",6,10,"car",19,20,6,0,71,0,62,5,"apply",6,0,53,0,17,5,"fn",6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"cons",19,20,6,0,28,0,19,5,"cdr",6,0,10,9,0,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,4,3,2,20,6,7,0,1,6,5,"2",6,10,"mappend",19,20,6,7,0,0,6,5,"2",6,10,"+",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"1",6,10,"expand-macro",19,4,2,8,20,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,6,20,0,10,7,0,0,6,5,"each",6,5,"2",6,10,"is",19,20,2,239,1,0,222,3,2,0,6,5,"0",6,10,"uniq",19,20,6,0,6,5,"0",6,10,"uniq",19,20,6,13,0,199,0,181,5,"rfn",6,0,172,7,0,1,6,0,163,0,10,7,0,0,6,11,6,5,"2",6,10,"cons",19,20,6,0,145,0,136,5,"if",6,0,127,7,0,0,6,0,118,0,109,5,"do",6,0,100,0,46,5,"let",6,0,37,8,2,6,0,28,0,19,5,"car",6,0,10,7,0,0,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,8,0,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,0,46,0,37,7,0,1,6,0,28,0,19,5,"cdr",6,0,10,7,0,0,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,0,10,8,1,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"1",6,10,"expand-macro",19,4,2,7,20,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,6,20,0,10,7,0,0,6,5,"%shortfn",6,5,"2",6,10,"is",19,20,2,53,1,0,36,1,-1,0,28,5,"fn",6,0,19,5,"(_)",6,0,10,8,0,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"1",6,10,"expand-macro",19,4,2,2,20,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,6,20,0,10,7,0,0,6,5,"fn",6,5,"2",6,10,"is",19,20,2,103,1,0,86,2,1,5,"fn",6,0,76,8,1,6,0,67,0,17,0,8,8,0,6,5,"1",6,10,"len",19,20,6,5,"2",6,5,"2",6,10,"<",19,20,2,24,0,15,0,8,8,0,6,5,"1",6,10,"car",19,20,6,5,"1",6,10,"expand-macro",19,20,6,11,6,5,"2",6,10,"cons",19,20,0,17,0,10,5,"do",6,8,0,6,5,"2",6,10,"cons",19,20,6,5,"1",6,10,"expand-macro",19,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,4,3,3,20,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,6,20,0,10,7,0,0,6,5,"rfn",6,5,"2",6,10,"is",19,20,2,107,1,0,90,3,2,0,82,5,"let",6,0,73,8,2,6,0,64,11,6,0,55,0,46,5,"assign",6,0,37,8,2,6,0,28,0,19,5,"fn",6,0,10,8,1,6,8,0,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"1",6,10,"expand-macro",19,4,2,4,20,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,6,20,0,10,7,0,0,6,5,"afn",6,5,"2",6,10,"is",19,20,2,53,1,0,36,2,1,0,28,5,"rfn",6,0,19,5,"self",6,0,10,8,1,6,8,0,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"1",6,10,"expand-macro",19,4,2,3,20,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,6,20,0,10,7,0,0,6,5,"quasiquote",6,5,"2",6,10,"is",19,20,2,33,1,0,16,1,-1,0,8,8,0,6,5,"1",6,10,"expand-qq",19,20,6,5,"1",6,10,"expand-macro",19,4,2,2,20,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,6,20,0,10,7,0,0,6,5,"if",6,5,"2",6,10,"is",19,20,2,169,1,0,152,1,0,0,144,0,8,8,0,6,5,"1",6,10,"pair",19,20,6,5,"1",6,11,6,13,18,0,7,0,0,6,1,1,123,1,-1,0,8,8,0,6,5,"1",6,10,"car",19,20,6,13,0,17,0,8,7,0,0,6,5,"1",6,10,"len",19,20,6,5,"2",6,5,"2",6,10,"is",19,20,2,66,5,"%if",6,0,56,0,8,7,0,0,6,5,"1",6,10,"car",19,20,6,0,40,0,8,7,0,0,6,5,"1",6,10,"cadr",19,20,6,0,24,0,15,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"1",6,9,0,19,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,4,3,4,20,0,17,0,8,7,0,0,6,5,"1",6,10,"len",19,20,6,5,"1",6,5,"2",6,10,"is",19,20,2,9,7,0,0,6,5,"1",6,10,"car",19,4,2,4,20,11,14,2,21,2,15,0,0,14,2,20,6,5,"1",6,10,"expand-macro",19,4,2,2,20,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,6,20,0,10,7,0,0,6,5,"and",6,5,"2",6,10,"is",19,20,2,129,1,0,112,1,0,0,8,8,0,6,5,"1",6,10,"cdr",19,20,2,59,0,51,5,"if",6,0,42,0,8,8,0,6,5,"1",6,10,"car",19,20,6,0,26,0,17,5,"and",6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"cons",19,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"1",6,10,"expand-macro",19,4,2,2,20,0,8,8,0,6,5,"1",6,10,"car",19,20,6,13,7,0,0,2,10,7,0,0,14,2,6,5,"1",6,10,"expand-macro",19,4,2,2,20,12,6,13,7,0,0,2,10,7,0,0,14,4,6,5,"1",6,10,"expand-macro",19,4,2,2,20,11,14,4,6,5,"1",6,10,"expand-macro",19,4,2,2,20,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,6,20,0,10,7,0,0,6,5,"or",6,5,"2",6,10,"is",19,20,2,140,1,0,123,1,0,8,0,2,113,0,6,5,"0",6,10,"uniq",19,20,6,13,0,96,5,"let",6,0,87,7,0,0,6,0,78,0,8,8,0,6,5,"1",6,10,"car",19,20,6,0,62,0,53,5,"if",6,0,44,7,0,0,6,0,35,7,0,0,6,0,26,0,17,5,"or",6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"cons",19,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,14,2,6,5,"1",6,10,"expand-macro",19,4,2,2,20,11,6,5,"1",6,10,"expand-macro",19,4,2,2,20,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,6,20,0,10,7,0,0,6,5,"with",6,5,"2",6,10,"is",19,20,2,110,1,0,93,2,1,5,"with",6,0,83,0,8,8,1,6,5,"1",6,10,"expand-macro",19,20,6,0,67,0,17,0,8,8,0,6,5,"1",6,10,"len",19,20,6,5,"2",6,5,"2",6,10,"<",19,20,2,24,0,15,0,8,8,0,6,5,"1",6,10,"car",19,20,6,5,"1",6,10,"expand-macro",19,20,6,11,6,5,"2",6,10,"cons",19,20,0,17,0,10,5,"do",6,8,0,6,5,"2",6,10,"cons",19,20,6,5,"1",6,10,"expand-macro",19,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,4,3,3,20,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,6,20,0,10,7,0,0,6,5,"let",6,5,"2",6,10,"is",19,20,2,62,1,0,45,3,2,0,37,5,"with",6,0,28,0,19,8,2,6,0,10,8,1,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,8,0,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"1",6,10,"expand-macro",19,4,2,4,20,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,6,20,0,10,7,0,0,6,5,"def",6,5,"2",6,10,"is",19,20,2,71,1,0,54,3,2,0,46,5,"assign",6,0,37,8,2,6,0,28,0,19,5,"fn",6,0,10,8,1,6,8,0,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"1",6,10,"expand-macro",19,4,2,4,20,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,6,20,0,10,7,0,0,6,5,"aif",6,5,"2",6,10,"is",19,20,2,205,1,0,188,1,0,0,180,0,8,8,0,6,5,"1",6,10,"pair",19,20,6,5,"1",6,11,6,13,18,0,7,0,0,6,1,1,159,1,-1,0,8,8,0,6,5,"1",6,10,"car",19,20,6,13,0,17,0,8,7,0,0,6,5,"1",6,10,"len",19,20,6,5,"2",6,5,"2",6,10,"is",19,20,2,102,5,"let",6,0,92,5,"it",6,0,83,0,8,7,0,0,6,5,"1",6,10,"car",19,20,6,0,67,0,58,5,"%if",6,0,49,5,"it",6,0,40,0,8,7,0,0,6,5,"1",6,10,"cadr",19,20,6,0,24,0,15,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"1",6,9,0,19,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,4,3,4,20,0,17,0,8,7,0,0,6,5,"1",6,10,"len",19,20,6,5,"1",6,5,"2",6,10,"is",19,20,2,9,7,0,0,6,5,"1",6,10,"car",19,4,2,4,20,11,14,2,21,2,15,0,0,14,2,20,6,5,"1",6,10,"expand-macro",19,4,2,2,20,6,0,8,8,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,6,20,10,"expand-macro",19,6,8,0,6,5,"2",6,10,"map",19,4,3,6,20,8,0,14,2,21,2,17,"expand-macro",22,],
[1,0,68,4,-1,8,2,2,64,0,8,8,2,6,5,"1",6,10,"car",19,20,6,13,0,10,8,3,6,7,0,0,6,5,"2",6,10,"pos",19,20,6,13,7,0,0,2,10,8,1,6,7,0,0,6,5,"2",6,8,0,4,3,9,20,8,3,6,0,8,8,2,6,5,"1",6,10,"cdr",19,20,6,0,10,5,"1",6,8,1,6,5,"2",6,10,"+",19,20,6,8,0,6,5,"4",6,10,"compile-lookup-let",19,4,5,9,20,11,21,5,17,"compile-lookup-let",22,],
[1,0,92,7,-1,0,21,8,6,6,0,8,8,5,6,5,"1",6,10,"car",19,20,6,5,"0",6,8,3,6,5,"4",6,10,"compile-lookup-let",19,20,6,13,7,0,0,2,4,7,0,0,14,2,21,8,0,17,8,6,6,0,8,8,5,6,5,"1",6,10,"cadr",19,20,6,5,"2",6,10,"pos",19,20,6,13,7,0,0,2,8,7,0,0,6,5,"1",6,8,2,4,2,12,20,0,17,8,6,6,0,8,8,5,6,5,"1",6,10,"cddr",19,20,6,5,"2",6,10,"pos",19,20,6,13,7,0,0,2,8,7,0,0,6,5,"1",6,8,1,4,2,14,20,8,6,6,5,"1",6,8,0,4,2,14,20,17,"compile-lookup",22,],
[1,0,231,3,-1,8,2,6,8,1,6,8,0,6,8,0,6,1,1,38,2,-1,5,"refer-let",6,0,28,8,1,6,0,19,8,0,6,0,10,9,0,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,4,3,3,20,6,8,0,6,1,1,29,1,-1,5,"refer-local",6,0,19,8,0,6,0,10,9,0,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,4,3,2,20,6,8,0,6,1,1,29,1,-1,5,"refer-free",6,0,19,8,0,6,0,10,9,0,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,4,3,2,20,6,8,0,6,1,1,110,1,-1,8,0,6,13,0,10,7,0,0,6,11,6,5,"2",6,10,"is",19,20,2,20,5,"refer-nil",6,0,10,9,0,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,4,3,4,20,0,10,7,0,0,6,12,6,5,"2",6,10,"is",19,20,2,20,5,"refer-t",6,0,10,9,0,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,4,3,4,20,5,"refer-global",6,0,37,8,0,6,0,28,0,19,5,"indirect",6,0,10,9,0,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,4,3,4,20,6,5,"7",6,10,"compile-lookup",19,4,8,4,20,17,"compile-refer",22,],
[1,0,606,2,-1,0,8,8,1,6,5,"1",6,10,"type",19,20,6,13,0,10,7,0,0,6,5,"sym",6,5,"2",6,10,"is",19,20,2,30,0,17,0,10,8,1,6,8,0,6,5,"2",6,10,"mem",19,20,6,5,"1",6,10,"no",19,20,2,9,8,1,6,5,"1",6,10,"list",19,4,2,5,20,11,14,2,21,3,0,10,7,0,0,6,5,"cons",6,5,"2",6,10,"is",19,20,2,542,0,8,8,1,6,5,"1",6,10,"car",19,20,6,13,0,10,7,0,0,6,5,"quote",6,5,"2",6,10,"is",19,20,2,20,1,0,3,1,0,11,21,2,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,7,20,0,10,7,0,0,6,5,"fn",6,5,"2",6,10,"is",19,20,2,49,8,0,6,1,1,30,2,-1,8,0,6,0,20,10,"is",19,6,0,8,8,1,6,5,"1",6,10,"dotted-to-proper",19,20,6,9,0,6,5,"3",6,10,"union",19,20,6,5,"2",6,10,"find-free",19,4,3,3,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,7,20,0,10,7,0,0,6,5,"with",6,5,"2",6,10,"is",19,20,2,128,8,0,6,1,1,109,2,-1,0,18,10,"car",19,6,0,8,8,1,6,5,"1",6,10,"pair",19,20,6,5,"2",6,10,"map",19,20,6,0,18,10,"cadr",19,6,0,8,8,1,6,5,"1",6,10,"pair",19,20,6,5,"2",6,10,"map",19,20,6,13,10,"is",19,6,0,36,0,29,0,22,9,0,6,1,1,11,1,-1,8,0,6,9,0,6,5,"2",6,10,"find-free",19,4,3,2,20,6,7,0,0,6,5,"2",6,10,"map",19,20,6,5,"1",6,10,"flat",19,20,6,5,"1",6,10,"dedup",19,20,6,0,22,8,0,6,0,13,10,"is",19,6,7,0,1,6,9,0,6,5,"3",6,10,"union",19,20,6,5,"2",6,10,"find-free",19,20,6,5,"3",6,10,"union",19,4,4,6,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,7,20,0,10,7,0,0,6,5,"do",6,5,"2",6,10,"is",19,20,2,56,8,0,6,1,1,37,1,0,0,29,0,22,9,0,6,1,1,11,1,-1,8,0,6,9,0,6,5,"2",6,10,"find-free",19,4,3,2,20,6,8,0,6,5,"2",6,10,"map",19,20,6,5,"1",6,10,"flat",19,20,6,5,"1",6,10,"dedup",19,4,2,2,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,7,20,0,10,7,0,0,6,5,"%if",6,5,"2",6,10,"is",19,20,2,56,8,0,6,1,1,37,1,0,0,29,0,22,9,0,6,1,1,11,1,-1,8,0,6,9,0,6,5,"2",6,10,"find-free",19,4,3,2,20,6,8,0,6,5,"2",6,10,"map",19,20,6,5,"1",6,10,"flat",19,20,6,5,"1",6,10,"dedup",19,4,2,2,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,7,20,0,10,7,0,0,6,5,"assign",6,5,"2",6,10,"is",19,20,2,86,8,0,6,1,1,67,2,-1,10,"is",19,6,0,17,0,10,8,1,6,9,0,6,5,"2",6,10,"mem",19,20,6,5,"1",6,10,"no",19,20,2,27,0,8,8,1,6,5,"1",6,10,"list",19,20,6,0,10,8,0,6,9,0,6,5,"2",6,10,"find-free",19,20,6,5,"3",6,10,"union",19,4,4,3,20,11,6,0,10,8,0,6,9,0,6,5,"2",6,10,"find-free",19,20,6,5,"3",6,10,"union",19,4,4,3,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,7,20,0,10,7,0,0,6,5,"ccc",6,5,"2",6,10,"is",19,20,2,30,8,0,6,1,1,11,1,-1,8,0,6,9,0,6,5,"2",6,10,"find-free",19,4,3,2,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,7,20,0,29,0,22,8,0,6,1,1,11,1,-1,8,0,6,9,0,6,5,"2",6,10,"find-free",19,4,3,2,20,6,8,1,6,5,"2",6,10,"map",19,20,6,5,"1",6,10,"flat",19,20,6,5,"1",6,10,"dedup",19,4,2,7,20,11,14,2,21,3,17,"find-free",22,],
[1,0,553,2,-1,0,8,8,1,6,5,"1",6,10,"type",19,20,6,13,0,10,7,0,0,6,5,"cons",6,5,"2",6,10,"is",19,20,2,529,0,8,8,1,6,5,"1",6,10,"car",19,20,6,13,0,10,7,0,0,6,5,"quote",6,5,"2",6,10,"is",19,20,2,20,1,0,3,1,-1,11,21,2,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,7,20,0,10,7,0,0,6,5,"fn",6,5,"2",6,10,"is",19,20,2,46,8,0,6,1,1,27,2,-1,8,0,6,0,17,9,0,6,0,8,8,1,6,5,"1",6,10,"dotted-to-proper",19,20,6,5,"2",6,10,"set-minus",19,20,6,5,"2",6,10,"find-sets",19,4,3,3,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,7,20,0,10,7,0,0,6,5,"with",6,5,"2",6,10,"is",19,20,2,125,8,0,6,1,1,106,2,-1,0,18,10,"car",19,6,0,8,8,1,6,5,"1",6,10,"pair",19,20,6,5,"2",6,10,"map",19,20,6,0,18,10,"cadr",19,6,0,8,8,1,6,5,"1",6,10,"pair",19,20,6,5,"2",6,10,"map",19,20,6,13,10,"is",19,6,0,36,0,29,0,22,9,0,6,1,1,11,1,-1,8,0,6,9,0,6,5,"2",6,10,"find-sets",19,4,3,2,20,6,7,0,0,6,5,"2",6,10,"map",19,20,6,5,"1",6,10,"flat",19,20,6,5,"1",6,10,"dedup",19,20,6,0,19,8,0,6,0,10,9,0,6,7,0,1,6,5,"2",6,10,"set-minus",19,20,6,5,"2",6,10,"find-sets",19,20,6,5,"3",6,10,"union",19,4,4,6,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,7,20,0,10,7,0,0,6,5,"do",6,5,"2",6,10,"is",19,20,2,56,8,0,6,1,1,37,1,0,0,29,0,22,9,0,6,1,1,11,1,-1,8,0,6,9,0,6,5,"2",6,10,"find-sets",19,4,3,2,20,6,8,0,6,5,"2",6,10,"map",19,20,6,5,"1",6,10,"flat",19,20,6,5,"1",6,10,"dedup",19,4,2,2,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,7,20,0,10,7,0,0,6,5,"%if",6,5,"2",6,10,"is",19,20,2,56,8,0,6,1,1,37,1,0,0,29,0,22,9,0,6,1,1,11,1,-1,8,0,6,9,0,6,5,"2",6,10,"find-sets",19,4,3,2,20,6,8,0,6,5,"2",6,10,"map",19,20,6,5,"1",6,10,"flat",19,20,6,5,"1",6,10,"dedup",19,4,2,2,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,7,20,0,10,7,0,0,6,5,"assign",6,5,"2",6,10,"is",19,20,2,79,8,0,6,1,1,60,2,-1,10,"is",19,6,0,10,8,1,6,9,0,6,5,"2",6,10,"mem",19,20,2,27,0,8,8,1,6,5,"1",6,10,"list",19,20,6,0,10,8,0,6,9,0,6,5,"2",6,10,"find-sets",19,20,6,5,"3",6,10,"union",19,4,4,3,20,11,6,0,10,8,0,6,9,0,6,5,"2",6,10,"find-sets",19,20,6,5,"3",6,10,"union",19,4,4,3,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,7,20,0,10,7,0,0,6,5,"ccc",6,5,"2",6,10,"is",19,20,2,30,8,0,6,1,1,11,1,-1,8,0,6,9,0,6,5,"2",6,10,"find-sets",19,4,3,2,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,7,20,0,29,0,22,8,0,6,1,1,11,1,-1,8,0,6,9,0,6,5,"2",6,10,"find-sets",19,4,3,2,20,6,8,1,6,5,"2",6,10,"map",19,20,6,5,"1",6,10,"flat",19,20,6,5,"1",6,10,"dedup",19,4,2,7,20,11,14,2,21,3,17,"find-sets",22,],
[1,0,123,3,-1,8,1,6,5,"0",6,5,"2",6,11,6,13,18,0,8,0,6,7,0,0,6,8,2,6,1,3,102,2,-1,8,1,2,98,0,17,0,8,8,1,6,5,"1",6,10,"car",19,20,6,9,0,6,5,"2",6,10,"mem",19,20,2,54,5,"box",6,0,44,8,0,6,0,35,0,26,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,0,10,8,0,6,5,"1",6,5,"2",6,10,"+",19,20,6,5,"2",6,9,1,19,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,4,3,3,20,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,0,10,8,0,6,5,"1",6,5,"2",6,10,"+",19,20,6,5,"2",6,9,1,19,4,3,3,20,9,2,21,3,15,0,0,14,2,4,3,4,20,17,"make-boxes",22,],
[1,0,152,1,-1,0,17,0,8,8,0,6,5,"1",6,10,"car",19,20,6,5,"return",6,5,"2",6,10,"is",19,20,2,9,8,0,6,5,"1",6,10,"cadr",19,4,2,2,20,0,17,0,8,8,0,6,5,"1",6,10,"car",19,20,6,5,"exit-let",6,5,"2",6,10,"is",19,20,2,66,0,24,0,15,0,8,8,0,6,5,"1",6,10,"cddr",19,20,6,5,"1",6,10,"caar",19,20,6,5,"return",6,5,"2",6,10,"is",19,20,2,39,0,8,8,0,6,5,"1",6,10,"cadr",19,20,6,0,22,0,15,0,8,8,0,6,5,"1",6,10,"cddr",19,20,6,5,"1",6,10,"car",19,20,6,5,"1",6,10,"cadr",19,20,6,5,"2",6,10,"+",19,4,3,2,20,11,21,2,11,2,39,0,8,8,0,6,5,"1",6,10,"cadr",19,20,6,0,22,0,15,0,8,8,0,6,5,"1",6,10,"cddr",19,20,6,5,"1",6,10,"car",19,20,6,5,"1",6,10,"cadr",19,20,6,5,"2",6,10,"+",19,4,3,2,20,11,21,2,17,"tailp",22,],
[1,0,18,1,-1,0,8,8,0,6,5,"1",6,10,"car",19,20,6,5,"exit-let",6,5,"2",6,10,"is",19,4,3,2,20,17,"nest-exit-p",22,],
[1,0,58,3,-1,0,8,8,2,6,5,"1",6,10,"no",19,20,2,3,8,0,21,4,0,8,8,2,6,5,"1",6,10,"cdr",19,20,6,8,1,6,0,28,0,8,8,2,6,5,"1",6,10,"car",19,20,6,8,1,6,0,10,5,"argument",6,8,0,6,5,"2",6,10,"list",19,20,6,5,"3",6,10,"compile-refer",19,20,6,5,"3",6,10,"collect-free",19,4,4,4,20,17,"collect-free",22,],
[1,0,110,2,-1,8,1,2,106,0,8,8,0,6,5,"1",6,10,"car",19,20,6,0,8,8,0,6,5,"1",6,10,"cadr",19,20,6,0,8,8,0,6,5,"1",6,10,"cddr",19,20,6,13,7,0,0,6,7,0,1,6,7,0,2,6,1,3,62,1,-1,0,17,8,0,6,0,8,9,0,6,5,"1",6,10,"flat",19,20,6,5,"2",6,10,"mem",19,20,6,13,7,0,0,2,4,7,0,0,14,2,21,2,0,10,8,0,6,9,1,6,5,"2",6,10,"mem",19,20,6,13,7,0,0,2,4,7,0,0,14,4,21,2,0,10,8,0,6,9,2,6,5,"2",6,10,"mem",19,20,6,13,7,0,0,2,4,7,0,0,14,6,21,2,11,14,6,21,2,6,8,1,6,5,"2",6,10,"keep",19,4,3,7,20,11,21,3,17,"remove-globs",22,],
[1,0,1964,4,-1,0,8,8,3,6,5,"1",6,10,"type",19,20,6,13,0,10,7,0,0,6,5,"sym",6,5,"2",6,10,"is",19,20,2,50,8,3,6,8,2,6,0,10,8,3,6,8,1,6,5,"2",6,10,"mem",19,20,2,27,0,19,5,"indirect",6,0,10,8,0,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"3",6,10,"compile-refer",19,4,4,7,20,8,0,6,5,"3",6,10,"compile-refer",19,4,4,7,20,0,10,7,0,0,6,5,"cons",6,5,"2",6,10,"is",19,20,2,1795,0,8,8,3,6,5,"1",6,10,"car",19,20,6,13,0,10,7,0,0,6,5,"quote",6,5,"2",6,10,"is",19,20,2,108,8,0,6,1,1,89,1,-1,0,10,8,0,6,11,6,5,"2",6,10,"is",19,20,2,20,5,"refer-nil",6,0,10,9,0,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,4,3,2,20,0,10,8,0,6,12,6,5,"2",6,10,"is",19,20,2,20,5,"refer-t",6,0,10,9,0,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,4,3,2,20,5,"constant",6,0,19,8,0,6,0,10,9,0,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,4,3,2,20,6,0,8,8,3,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,9,20,0,10,7,0,0,6,5,"fn",6,5,"2",6,10,"is",19,20,2,269,8,0,6,8,1,6,8,2,6,1,3,246,2,-1,0,8,8,1,6,5,"1",6,10,"dotted-pos",19,20,6,0,8,8,1,6,5,"1",6,10,"dotted-to-proper",19,20,6,13,0,10,8,0,6,7,0,0,6,5,"2",6,10,"find-free",19,20,6,0,10,8,0,6,7,0,0,6,5,"2",6,10,"find-sets",19,20,6,13,0,10,7,0,1,6,9,0,6,5,"2",6,10,"remove-globs",19,20,6,13,7,0,0,6,9,0,6,0,180,5,"close",6,0,171,0,8,7,0,0,6,5,"1",6,10,"len",19,20,6,0,155,0,8,7,2,0,6,5,"1",6,10,"len",19,20,6,0,139,7,2,1,6,0,130,0,112,7,1,0,6,0,8,7,2,0,6,5,"1",6,10,"rev",19,20,6,0,94,8,0,6,0,26,11,6,0,17,0,8,7,2,0,6,5,"1",6,10,"rev",19,20,6,7,0,0,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,0,22,10,"is",19,6,7,1,0,6,0,10,9,1,6,7,0,0,6,5,"2",6,10,"set-intersect",19,20,6,5,"3",6,10,"union",19,20,6,0,35,5,"return",6,0,26,0,17,0,8,7,2,0,6,5,"1",6,10,"len",19,20,6,5,"1",6,5,"2",6,10,"+",19,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"4",6,10,"compile",19,20,6,5,"3",6,10,"make-boxes",19,20,6,0,10,9,2,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"3",6,10,"collect-free",19,4,4,11,20,6,0,8,8,3,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,9,20,0,10,7,0,0,6,5,"with",6,5,"2",6,10,"is",19,20,2,396,8,0,6,8,1,6,8,2,6,1,3,373,2,-1,0,18,10,"car",19,6,0,8,8,1,6,5,"1",6,10,"pair",19,20,6,5,"2",6,10,"map",19,20,6,0,18,10,"cadr",19,6,0,8,8,1,6,5,"1",6,10,"pair",19,20,6,5,"2",6,10,"map",19,20,6,13,0,8,7,0,0,6,5,"1",6,10,"rev",19,20,6,0,40,0,24,0,8,7,0,1,6,5,"1",6,10,"rev",19,20,6,0,8,9,0,6,5,"1",6,10,"car",19,20,6,5,"2",6,10,"cons",19,20,6,0,8,9,0,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"cons",19,20,6,0,8,9,2,6,5,"1",6,10,"nest-exit-p",19,20,6,0,10,8,0,6,7,0,1,6,5,"2",6,10,"find-sets",19,20,6,0,19,0,10,8,0,6,7,0,1,6,5,"2",6,10,"find-free",19,20,6,9,0,6,5,"2",6,10,"remove-globs",19,20,6,13,0,157,5,"enter-let",6,0,148,0,139,7,0,1,6,0,8,7,1,1,6,5,"1",6,10,"rev",19,20,6,0,121,8,0,6,7,0,3,6,0,22,10,"is",19,6,7,0,1,6,0,10,9,1,6,7,0,0,6,5,"2",6,10,"set-intersect",19,20,6,5,"3",6,10,"union",19,20,6,0,87,5,"exit-let",6,0,78,0,35,0,8,7,1,1,6,5,"1",6,10,"len",19,20,6,5,"1",6,7,0,2,2,15,0,8,9,2,6,5,"1",6,10,"cadr",19,20,6,5,"3",6,10,"+",19,20,5,"0",6,5,"3",6,10,"+",19,20,6,0,35,7,0,2,2,24,0,15,0,8,9,2,6,5,"1",6,10,"cdr",19,20,6,5,"1",6,10,"cadr",19,20,6,11,6,5,"2",6,10,"cons",19,20,9,2,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"4",6,10,"compile",19,20,6,5,"3",6,10,"make-boxes",19,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,14,5,6,5,"2",6,11,6,13,18,0,9,1,6,9,0,6,7,0,0,6,1,3,67,2,-1,0,8,8,1,6,5,"1",6,10,"no",19,20,2,3,8,0,21,3,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,0,39,0,8,8,1,6,5,"1",6,10,"car",19,20,6,9,1,6,9,2,6,0,19,5,"argument",6,0,10,8,0,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"4",6,10,"compile",19,20,6,5,"2",6,9,0,19,4,3,3,20,15,0,0,14,2,4,3,6,20,6,0,8,8,3,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,9,20,0,10,7,0,0,6,5,"do",6,5,"2",6,10,"is",19,20,2,100,8,0,6,8,1,6,8,2,6,1,3,77,1,0,0,8,8,0,6,5,"1",6,10,"rev",19,20,6,9,2,6,5,"2",6,11,6,13,18,0,9,1,6,9,0,6,7,0,0,6,1,3,49,2,-1,0,8,8,1,6,5,"1",6,10,"no",19,20,2,3,8,0,21,3,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,0,21,0,8,8,1,6,5,"1",6,10,"car",19,20,6,9,1,6,9,2,6,8,0,6,5,"4",6,10,"compile",19,20,6,5,"2",6,9,0,19,4,3,3,20,15,0,0,14,2,4,3,2,20,6,0,8,8,3,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,9,20,0,10,7,0,0,6,5,"%if",6,5,"2",6,10,"is",19,20,2,96,8,0,6,8,1,6,8,2,6,1,3,73,3,-1,0,14,8,1,6,9,0,6,9,1,6,9,2,6,5,"4",6,10,"compile",19,20,6,0,14,8,0,6,9,0,6,9,1,6,9,2,6,5,"4",6,10,"compile",19,20,6,13,8,2,6,9,0,6,9,1,6,0,28,5,"test",6,0,19,7,0,1,6,0,10,7,0,0,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"4",6,10,"compile",19,4,5,7,20,6,0,8,8,3,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,9,20,0,10,7,0,0,6,5,"assign",6,5,"2",6,10,"is",19,20,2,249,8,1,6,8,0,6,8,2,6,1,3,226,2,-1,8,1,6,9,0,6,9,1,6,9,1,6,9,2,6,9,0,6,8,0,6,1,4,51,2,-1,9,0,6,9,1,6,9,2,6,0,37,5,"assign-let",6,0,28,8,1,6,0,19,8,0,6,0,10,9,3,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"4",6,10,"compile",19,4,5,3,20,6,9,1,6,9,2,6,9,0,6,8,0,6,1,4,42,1,-1,9,0,6,9,1,6,9,2,6,0,28,5,"assign-local",6,0,19,8,0,6,0,10,9,3,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"4",6,10,"compile",19,4,5,2,20,6,9,1,6,9,2,6,9,0,6,8,0,6,1,4,42,1,-1,9,0,6,9,1,6,9,2,6,0,28,5,"assign-free",6,0,19,8,0,6,0,10,9,3,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"4",6,10,"compile",19,4,5,2,20,6,9,1,6,9,2,6,9,0,6,8,0,6,1,4,42,1,-1,9,0,6,9,1,6,9,2,6,0,28,5,"assign-global",6,0,19,8,0,6,0,10,9,3,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"4",6,10,"compile",19,4,5,2,20,6,5,"7",6,10,"compile-lookup",19,4,8,3,20,6,0,8,8,3,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,9,20,0,10,7,0,0,6,5,"ccc",6,5,"2",6,10,"is",19,20,2,235,8,0,6,8,1,6,8,2,6,1,3,212,1,-1,9,1,6,9,0,6,8,0,6,1,3,150,1,-1,5,"conti",6,0,140,8,0,6,0,131,0,122,5,"argument",6,0,113,0,104,5,"constant",6,0,95,5,"1",6,0,86,0,77,5,"argument",6,0,68,0,59,9,0,6,9,1,6,9,2,6,0,10,5,"0",6,8,0,6,5,"2",6,10,"<",19,20,2,35,0,28,5,"shift",6,0,19,5,"2",6,0,10,8,0,6,5,"((apply))",6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"4",6,10,"compile",19,20,5,"(apply)",6,5,"4",6,10,"compile",19,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,4,3,2,20,6,13,0,8,9,2,6,5,"1",6,10,"tailp",19,20,6,13,7,0,0,2,8,7,0,0,6,5,"1",6,7,1,0,4,2,6,20,5,"frame",6,0,25,9,2,6,0,16,0,7,5,"0",6,5,"1",6,7,1,0,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,4,3,6,20,6,0,8,8,3,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,9,20,0,45,0,38,0,8,8,3,6,5,"1",6,10,"cdr",19,20,6,0,22,0,15,0,8,8,3,6,5,"1",6,10,"cdr",19,20,6,5,"1",6,10,"len",19,20,6,5,"1",6,10,"list",19,20,6,5,"2",6,10,"+",19,20,6,5,"1",6,10,"rev",19,20,6,0,92,0,8,8,3,6,5,"1",6,10,"car",19,20,6,8,2,6,8,1,6,0,8,8,0,6,5,"1",6,10,"tailp",19,20,6,13,7,0,0,2,59,0,51,5,"shift",6,0,42,0,24,0,15,0,8,8,3,6,5,"1",6,10,"cdr",19,20,6,5,"1",6,10,"len",19,20,6,5,"1",6,5,"2",6,10,"+",19,20,6,0,10,7,0,0,6,5,"((apply))",6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,14,2,6,5,"4",6,10,"compile",19,20,5,"(apply)",14,2,6,5,"4",6,10,"compile",19,20,6,5,"2",6,11,6,13,18,0,8,1,6,8,2,6,7,0,0,6,8,0,6,1,4,104,2,-1,0,8,8,1,6,5,"1",6,10,"no",19,20,2,40,0,8,9,0,6,5,"1",6,10,"tailp",19,20,2,3,8,0,21,3,5,"frame",6,0,19,9,0,6,0,10,8,0,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,4,3,3,20,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,0,39,0,8,8,1,6,5,"1",6,10,"car",19,20,6,9,2,6,9,3,6,0,19,5,"argument",6,0,10,8,0,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"4",6,10,"compile",19,20,6,5,"2",6,9,1,19,4,3,3,20,15,0,0,14,2,4,3,9,20,0,10,8,3,6,11,6,5,"2",6,10,"is",19,20,2,20,5,"refer-nil",6,0,10,8,0,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,4,3,7,20,0,10,8,3,6,12,6,5,"2",6,10,"is",19,20,2,20,5,"refer-t",6,0,10,8,0,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,4,3,7,20,5,"constant",6,0,19,8,3,6,0,10,8,0,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,4,3,7,20,17,"compile",22,],
[1,0,1855,2,-1,0,8,8,1,6,5,"1",6,10,"car",19,20,6,13,0,10,7,0,0,6,5,"frame",6,5,"2",6,10,"is",19,20,2,121,8,0,6,1,1,102,2,-1,0,19,8,0,6,0,10,9,0,6,5,"1",6,5,"2",6,10,"+",19,20,6,5,"2",6,10,"preproc",19,20,6,13,0,35,5,"frame",6,0,26,0,17,0,8,7,0,0,6,5,"1",6,10,"len",19,20,6,5,"1",6,5,"2",6,10,"+",19,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,0,37,7,0,0,6,0,28,8,1,6,0,19,9,0,6,0,8,7,0,0,6,5,"1",6,10,"len",19,20,6,5,"1",6,5,"3",6,10,"+",19,20,6,5,"2",6,10,"preproc",19,20,6,5,"2",6,10,"+",19,20,6,5,"2",6,10,"cons",19,4,3,5,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,5,20,0,10,7,0,0,6,5,"close",6,5,"2",6,10,"is",19,20,2,148,8,0,6,1,1,129,5,-1,0,19,8,1,6,0,10,9,0,6,5,"1",6,5,"2",6,10,"+",19,20,6,5,"2",6,10,"preproc",19,20,6,13,0,62,5,"close",6,0,53,8,4,6,0,44,0,17,0,8,7,0,0,6,5,"1",6,10,"len",19,20,6,5,"1",6,5,"2",6,10,"+",19,20,6,0,19,8,3,6,0,10,8,2,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,0,37,7,0,0,6,0,28,8,0,6,0,19,9,0,6,0,8,7,0,0,6,5,"1",6,10,"len",19,20,6,5,"1",6,5,"3",6,10,"+",19,20,6,5,"2",6,10,"preproc",19,20,6,5,"2",6,10,"+",19,20,6,5,"2",6,10,"cons",19,4,3,8,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,5,20,0,10,7,0,0,6,5,"test",6,5,"2",6,10,"is",19,20,2,121,8,0,6,1,1,102,2,-1,0,19,8,1,6,0,10,9,0,6,5,"1",6,5,"2",6,10,"+",19,20,6,5,"2",6,10,"preproc",19,20,6,13,0,35,5,"test",6,0,26,0,17,0,8,7,0,0,6,5,"1",6,10,"len",19,20,6,5,"1",6,5,"2",6,10,"+",19,20,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,0,37,7,0,0,6,0,28,8,0,6,0,19,9,0,6,0,8,7,0,0,6,5,"1",6,10,"len",19,20,6,5,"1",6,5,"3",6,10,"+",19,20,6,5,"2",6,10,"preproc",19,20,6,5,"2",6,10,"+",19,20,6,5,"2",6,10,"cons",19,4,3,5,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,5,20,0,10,7,0,0,6,5,"conti",6,5,"2",6,10,"is",19,20,2,66,8,0,6,1,1,47,2,-1,0,19,5,"conti",6,0,10,8,1,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,0,19,8,0,6,0,10,9,0,6,5,"1",6,5,"2",6,10,"+",19,20,6,5,"2",6,10,"preproc",19,20,6,5,"2",6,10,"cons",19,4,3,3,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,5,20,0,10,7,0,0,6,5,"shift",6,5,"2",6,10,"is",19,20,2,75,8,0,6,1,1,56,3,-1,0,28,5,"shift",6,0,19,8,2,6,0,10,8,1,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,0,19,8,0,6,0,10,9,0,6,5,"1",6,5,"2",6,10,"+",19,20,6,5,"2",6,10,"preproc",19,20,6,5,"2",6,10,"cons",19,4,3,4,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,5,20,0,10,7,0,0,6,5,"constant",6,5,"2",6,10,"is",19,20,2,66,8,0,6,1,1,47,2,-1,0,19,5,"constant",6,0,10,8,1,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,0,19,8,0,6,0,10,9,0,6,5,"1",6,5,"2",6,10,"+",19,20,6,5,"2",6,10,"preproc",19,20,6,5,"2",6,10,"cons",19,4,3,3,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,5,20,0,10,7,0,0,6,5,"argument",6,5,"2",6,10,"is",19,20,2,48,8,0,6,1,1,29,1,-1,5,"(argument)",6,0,19,8,0,6,0,10,9,0,6,5,"1",6,5,"2",6,10,"+",19,20,6,5,"2",6,10,"preproc",19,20,6,5,"2",6,10,"cons",19,4,3,2,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,5,20,0,10,7,0,0,6,5,"refer-let",6,5,"2",6,10,"is",19,20,2,75,8,0,6,1,1,56,3,-1,0,28,5,"refer-let",6,0,19,8,2,6,0,10,8,1,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,0,19,8,0,6,0,10,9,0,6,5,"1",6,5,"2",6,10,"+",19,20,6,5,"2",6,10,"preproc",19,20,6,5,"2",6,10,"cons",19,4,3,4,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,5,20,0,10,7,0,0,6,5,"refer-local",6,5,"2",6,10,"is",19,20,2,66,8,0,6,1,1,47,2,-1,0,19,5,"refer-local",6,0,10,8,1,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,0,19,8,0,6,0,10,9,0,6,5,"1",6,5,"2",6,10,"+",19,20,6,5,"2",6,10,"preproc",19,20,6,5,"2",6,10,"cons",19,4,3,3,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,5,20,0,10,7,0,0,6,5,"refer-free",6,5,"2",6,10,"is",19,20,2,66,8,0,6,1,1,47,2,-1,0,19,5,"refer-free",6,0,10,8,1,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,0,19,8,0,6,0,10,9,0,6,5,"1",6,5,"2",6,10,"+",19,20,6,5,"2",6,10,"preproc",19,20,6,5,"2",6,10,"cons",19,4,3,3,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,5,20,0,10,7,0,0,6,5,"refer-global",6,5,"2",6,10,"is",19,20,2,66,8,0,6,1,1,47,2,-1,0,19,5,"refer-global",6,0,10,8,1,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,0,19,8,0,6,0,10,9,0,6,5,"1",6,5,"2",6,10,"+",19,20,6,5,"2",6,10,"preproc",19,20,6,5,"2",6,10,"cons",19,4,3,3,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,5,20,0,10,7,0,0,6,5,"refer-nil",6,5,"2",6,10,"is",19,20,2,48,8,0,6,1,1,29,1,-1,5,"(refer-nil)",6,0,19,8,0,6,0,10,9,0,6,5,"1",6,5,"2",6,10,"+",19,20,6,5,"2",6,10,"preproc",19,20,6,5,"2",6,10,"cons",19,4,3,2,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,5,20,0,10,7,0,0,6,5,"refer-t",6,5,"2",6,10,"is",19,20,2,48,8,0,6,1,1,29,1,-1,5,"(refer-t)",6,0,19,8,0,6,0,10,9,0,6,5,"1",6,5,"2",6,10,"+",19,20,6,5,"2",6,10,"preproc",19,20,6,5,"2",6,10,"cons",19,4,3,2,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,5,20,0,10,7,0,0,6,5,"enter-let",6,5,"2",6,10,"is",19,20,2,48,8,0,6,1,1,29,1,-1,5,"(enter-let)",6,0,19,8,0,6,0,10,9,0,6,5,"1",6,5,"2",6,10,"+",19,20,6,5,"2",6,10,"preproc",19,20,6,5,"2",6,10,"cons",19,4,3,2,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,5,20,0,10,7,0,0,6,5,"exit-let",6,5,"2",6,10,"is",19,20,2,66,8,0,6,1,1,47,2,-1,0,19,5,"exit-let",6,0,10,8,1,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,0,19,8,0,6,0,10,9,0,6,5,"1",6,5,"2",6,10,"+",19,20,6,5,"2",6,10,"preproc",19,20,6,5,"2",6,10,"cons",19,4,3,3,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,5,20,0,10,7,0,0,6,5,"assign-let",6,5,"2",6,10,"is",19,20,2,75,8,0,6,1,1,56,3,-1,0,28,5,"assign-let",6,0,19,8,2,6,0,10,8,1,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,0,19,8,0,6,0,10,9,0,6,5,"1",6,5,"2",6,10,"+",19,20,6,5,"2",6,10,"preproc",19,20,6,5,"2",6,10,"cons",19,4,3,4,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,5,20,0,10,7,0,0,6,5,"assign-local",6,5,"2",6,10,"is",19,20,2,66,8,0,6,1,1,47,2,-1,0,19,5,"assign-local",6,0,10,8,1,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,0,19,8,0,6,0,10,9,0,6,5,"1",6,5,"2",6,10,"+",19,20,6,5,"2",6,10,"preproc",19,20,6,5,"2",6,10,"cons",19,4,3,3,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,5,20,0,10,7,0,0,6,5,"assign-free",6,5,"2",6,10,"is",19,20,2,66,8,0,6,1,1,47,2,-1,0,19,5,"assign-free",6,0,10,8,1,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,0,19,8,0,6,0,10,9,0,6,5,"1",6,5,"2",6,10,"+",19,20,6,5,"2",6,10,"preproc",19,20,6,5,"2",6,10,"cons",19,4,3,3,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,5,20,0,10,7,0,0,6,5,"assign-global",6,5,"2",6,10,"is",19,20,2,66,8,0,6,1,1,47,2,-1,0,19,5,"assign-global",6,0,10,8,1,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,0,19,8,0,6,0,10,9,0,6,5,"1",6,5,"2",6,10,"+",19,20,6,5,"2",6,10,"preproc",19,20,6,5,"2",6,10,"cons",19,4,3,3,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,5,20,0,10,7,0,0,6,5,"box",6,5,"2",6,10,"is",19,20,2,66,8,0,6,1,1,47,2,-1,0,19,5,"box",6,0,10,8,1,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,0,19,8,0,6,0,10,9,0,6,5,"1",6,5,"2",6,10,"+",19,20,6,5,"2",6,10,"preproc",19,20,6,5,"2",6,10,"cons",19,4,3,3,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,5,20,0,10,7,0,0,6,5,"indirect",6,5,"2",6,10,"is",19,20,2,48,8,0,6,1,1,29,1,-1,5,"(indirect)",6,0,19,8,0,6,0,10,9,0,6,5,"1",6,5,"2",6,10,"+",19,20,6,5,"2",6,10,"preproc",19,20,6,5,"2",6,10,"cons",19,4,3,2,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,5,20,0,10,7,0,0,6,5,"apply",6,5,"2",6,10,"is",19,20,2,20,1,0,3,0,-1,5,"((apply))",21,1,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,5,20,0,10,7,0,0,6,5,"return",6,5,"2",6,10,"is",19,20,2,46,1,0,29,1,-1,0,19,5,"return",6,0,10,8,0,6,11,6,5,"2",6,10,"cons",19,20,6,5,"2",6,10,"cons",19,20,6,11,6,5,"2",6,10,"cons",19,4,3,2,20,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,5,20,0,10,7,0,0,6,5,"halt",6,5,"2",6,10,"is",19,20,2,20,1,0,3,0,-1,5,"((halt))",21,1,6,0,8,8,1,6,5,"1",6,10,"cdr",19,20,6,5,"2",6,10,"apply",19,4,3,5,20,11,14,2,21,3,17,"preproc",22,],
[1,0,31,1,-1,0,21,0,8,8,0,6,5,"1",6,10,"expand-macro",19,20,6,11,6,11,6,5,"(halt)",6,5,"4",6,10,"compile",19,20,6,5,"0",6,5,"2",6,10,"preproc",19,4,3,2,20,17,"do-compile",22,],]);/** @} */
/** @} */

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
      this.init_def();
    },
    init_def: function() {
      var ops = ['frame', 'close', 'test', 'conti', 'shift', 'constant', 'argument',
                 'refer-let', 'refer-local', 'refer-free', 'refer-global',
                 'refer-nil', 'refer-t', 'enter-let', 'exit-let', 'assign-let', 'assign-local', 'assign-global',
                 'box', 'indirect', 'apply', 'return', 'halt'];
      for (var i=0,l=preload.length; i<l; i++) (function(i) {
        var asm = [], line = preload[i];
        for (var k=0,m=line.length; k<m; k++) {
          var op = ops[line[k]];
          switch (op) {
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
