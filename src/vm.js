var VM = classify("VM", {
  static: {
    operators:
    include("operators.js");
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
    call_stack: null,
    recent_call_args: null,
    warn: null,
  },
  method: {
    init: function() {
      this.namespace = NameSpace.root;
      this.global = this.namespace.vars;
      for (var p in primitives) {
        this.global[p] = new Box(primitives[p]);
      }
      this.reader = new Reader();
      this.init_def(preloads, preload_vals);
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
          var name = op[1]; // symbol name
          var value = void(0);
          var ns = this.namespace;
          var vars = this.global;
          while (value === void(0)) {
            value = vars[name];
            if (ns.upper === null) {
              if (value === void(0))
                throw new Error('Unbound variable ' + stringify_for_disp(Symbol.get(name)));
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
          this.call_stack.shift();
          this.p++;
          break;
        case 'apply':
          var fn = this.a;
          var fn_type = type(fn);
          if (fn_type !== s_fn) {
            var tfs = this.global['***type_functions***'];
            var tfn;
            if (tfs && (tfn = tfs.v.get(fn_type)) !== nil) {
              tfn = rep(tfn);
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
          this.call_stack.shift();
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
