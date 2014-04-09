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
      try {
        var r = read(obj);
        if (reader_for_primitives.completed_p() &&
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
}

var type = function(x) {
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
    if (x instanceof Symbol)   return s_sym;
    if (x instanceof Cons)     return s_cons;
    if (x instanceof Closure)  return s_fn;
    if (x instanceof Char)     return s_char;
    if (x instanceof Table)    return s_table;
    if (x instanceof Tagged)   return x.tag;
  default:
    return Symbol.get('%javascript-' + type);
  }
};

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

// use decycle from https://raw.github.com/douglascrockford/JSON-js/master/cycle.js
include("../lib/json/cycle.js");
var stringify = function(x) {
  var type_name = type(x).name;
  switch (type_name) {
  case 'int':
    if (x === Infinity)  return '+inf.0';
    if (x === -Infinity) return '-inf.0';
    break;
  case 'num':
  case 'string':
    break;
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

var reader_for_primitives = new Reader();

var primitives = (function() {
  var rt = {
    'read': [{dot: -1}, function(str) {
      return reader_for_primitives.read(str);
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
    'type': [{dot: -1}, type],
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
    'match': [{dot: -1}, function(reg, str) {
      var mat = str.match(new RegExp(rep(reg)));
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
    'coerce': [{dot: 2}, coerce],
    'bound': [{dot: -1}, function(symbol) {
      return (symbol.name in this.global) ? t : nil;
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
    }]
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
      } else {
        var vs = args.split(/\s*,\s*/g);
        f.arglen = vs.length;
      }
      f.prim_name = n;
      rt[n] = f;
    }
  }
  return rt;
})();

var read        = primitives.read;
var cons        = primitives.cons;
var list        = primitives.list;
var car         = primitives.car;
var scar        = primitives.scar;
var cdr         = primitives.cdr;
var scdr        = primitives.scdr;
var caar        = primitives.caar;
var cadr        = primitives.cadr;
var cddr        = primitives.cddr;
var nthcdr      = primitives.nthcdr;
var lastcons    = primitives.lastcons;
var append      = primitives.append;
var nconc       = primitives.nconc;
var reverse     = primitives.rev;
var nreverse    = primitives.nrev;
var rep         = primitives.rep;
var annotate    = primitives.annotate;

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
