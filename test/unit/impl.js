if (typeof ArcJS === 'undefined') {
  ArcJS = require('../../arc.js');
}

if (typeof chai === 'undefined') {
  chai = require('chai');
}

var vm     = new ArcJS.VM();
var reader = vm.reader;
var nil       = ArcJS.nil;
var t         = ArcJS.t;
var stringify = ArcJS.stringify;
var type      = ArcJS.type;
var cons      = ArcJS.cons;
var car       = ArcJS.car;
var cdr       = ArcJS.cdr;
var rep       = ArcJS.rep;

var expect = chai.expect;

function evaluate(code) {
  var asm = [
    ['frame', 8],
    ['constant', vm.reader.read(code)],
    ['argument'],
    ['constant', 1],
    ['argument'],
    ['refer-global', 'compile'],
    ['indirect'],
    ['apply'],
    ['halt']
  ];
  vm.cleanup();
  vm.set_asm(asm);
  var compiled = vm.run();
  vm.cleanup();
  vm.load(compiled);
  return vm.run();
}

function compile_srv(code, after) {
  $.ajax({
    url: '/arc-compiler',
    type: 'POST',
    data: { code: code }
  }).done(after).error(function(r) {
    throw new Error(r.responseText);
  });
};

describe('Reader', function(){
  function rex(str) {
    return expect(reader.read(str));
  }
  describe('atom', function(){
    it('number', function() {
      rex("0").equal(0);
      rex("42").equal(42);
      rex("0002").equal(2);
      rex("10.5").equal(10.5);
      rex("22.2903").equal(22.2903);
      rex("-inf.0").equal(-Infinity);
      rex("+inf.0").equal(+Infinity);
      rex("#x10").equal(16);
      rex("#d10").equal(10);
      rex("#o10").equal(8);
      rex("#b10").equal(2);
      rex("1e3").equal(1e3);
      //TODO
      // rex("2/7")      // flaction
      // rex("2.0-3.0i") // imagine
      // rex("1/2+3/4i") // expression
    });
    it('symbol', function() {
      rex('a').equal(ArcJS.Symbol.get('a'));
      rex('abcd').equal(ArcJS.Symbol.get('abcd'));
      rex('u-nk_~o#abc$$%%moemoe').equal(ArcJS.Symbol.get('u-nk_~o#abc$$%%moemoe'));
      rex('nil').equal(nil);
      rex('t').equal(t);
      rex('|b|').equal(ArcJS.Symbol.get('b')).property('evaluable_name', false);
      rex('|10|').equal(ArcJS.Symbol.get('10')).property('evaluable_name', true);
      rex('|a b c|').equal(ArcJS.Symbol.get('a b c')).property('evaluable_name', true);
      rex("|'|").equal(ArcJS.Symbol.get("'")).property('evaluable_name', true);
      rex('|"|').equal(ArcJS.Symbol.get('"')).property('evaluable_name', true);
      rex('|#|').equal(ArcJS.Symbol.get('#')).property('evaluable_name', true);
      rex('||').equal(ArcJS.Symbol.get('')).property('evaluable_name', true);
      rex('x[abc]').equal(ArcJS.Symbol.get('x[abc]'))
      rex('x[10]').equal(ArcJS.Symbol.get('x[10]'))
      rex('.x[10]').equal(ArcJS.Symbol.get('.x[10]'))
      rex('x["name"]').equal(ArcJS.Symbol.get('x["name"]'))
      rex('x[y[z[2]]]').equal(ArcJS.Symbol.get('x[y[z[2]]]'))
      rex('x[abc].m[10:20].s[xyz]').equal(ArcJS.Symbol.get('x[abc].m[10:20].s[xyz]'))
      rex('x[(abc)]').equal(ArcJS.Symbol.get('x'))
      rex('x[abc def]').equal(ArcJS.Symbol.get('x'))
      rex('x[[abc]]').equal(ArcJS.Symbol.get('x'))
    });
    it('character', function() {
      // normal
      rex('#\\a').equal(ArcJS.Char.get('a'));
      // delimiter char
      rex('#\\(').equal(ArcJS.Char.get('('));
      rex('#\\ ').equal(ArcJS.Char.get(' '));
      // unicode
      rex('#\\あ').equal(ArcJS.Char.get('あ'));
      // escaped
      rex('#\\space').equal(ArcJS.Char.get(' '));
      rex('#\\040').equal(ArcJS.Char.get(' '));
      rex('#\\077').equal(ArcJS.Char.get('?'));
      rex('#\\u20').equal(ArcJS.Char.get(' '));
      rex('#\\u3042').equal(ArcJS.Char.get('あ'));
      rex('#\\U9b31').equal(ArcJS.Char.get('鬱'));
    });
    it('string', function() {
      rex('"abc"').equal("abc");
      rex('"ab\\"cd"').equal('ab"cd');
      rex('"ab\\ncd"').equal('ab\ncd');
      rex('"ab\\rcd"').equal('ab\rcd');
      rex('"ab\\scd"').equal('ab\scd');
      rex('"ab\\tcd"').equal('ab\tcd');
      rex('"\\u000A"').equal('\n');
      // TODO more escape patterns.
    });
    it('char', function() {
      function c(x) { return ArcJS.Char.get(x); }
      rex('#\\a').equal(c('a'));
      expect(stringify(reader.read("#\\a"))).to.equal('#\\a');
      expect(stringify(reader.read("#\\("))).to.equal('#\\(');
      // escaped
      expect(stringify(reader.read("#\\ "))).to.equal('#\\space');
      expect(stringify(reader.read("#\\null"))).to.equal('#\\nul');
      expect(stringify(reader.read("#\\linefeed"))).to.equal('#\\newline');
      expect(stringify(reader.read("#\\040"))).to.equal('#\\space');
      expect(stringify(reader.read("#\\077"))).to.equal('#\\?');
      expect(stringify(reader.read("#\\u20"))).to.equal('#\\space');
      expect(stringify(reader.read("#\\u3042"))).to.equal('#\\あ');
      expect(stringify(reader.read("#\\u9b31"))).to.equal('#\\鬱');
    });
    it('cons', function() {
      function s(x) { return ArcJS.Symbol.get(x); }
      rex("(a b c)").to.deep.equal(
        cons(s('a'), cons(s('b'), cons(s('c'), nil))));
      rex("(a (b c))").to.deep.equal(
        cons(s('a'), cons(cons(s('b'), cons(s('c'), nil)), nil)));
      rex("(a . b)").to.deep.equal(cons(s('a'), s('b')));
      rex("(0 . 0)").to.deep.equal(cons(0, 0));
      rex("(a b (d (e . f)) g)").to.deep.equal(
        cons(s('a'),
             cons(s('b'),
                  cons(cons(s('d'), cons(cons(s('e'), s('f')), nil)),
                       cons(s('g'), nil)))));
    });
    it('quote/quasiquote', function() {
      function s(x) { return ArcJS.Symbol.get(x); }
      rex("'a").to.deep.equal({ car: s('quote'),
                                cdr: { car: s('a'),
                                       cdr: nil}});
      rex("`a").to.deep.equal({ car: s('quasiquote'),
                                cdr: { car: s('a'),
                                       cdr: nil}});
      rex(",a").to.deep.equal({ car: s('unquote'),
                                cdr: { car: s('a'),
                                       cdr: nil}});
      rex(",@a").to.deep.equal({ car: s('unquote-splicing'),
                                 cdr: { car: s('a'),
                                        cdr: nil}});
      expect(stringify(reader.read("`(1 2 ,x ,(+ 1 y))"))).to.equal('(quasiquote (1 2 (unquote x) (unquote (+ 1 y))))');
    });
    it('shortfn', function() {
      expect(stringify(reader.read("[car _]"))).to.equal('(***cut-fn*** (car _))');
      expect(stringify(reader.read("[car ([car _] _)]"))).to.equal('(***cut-fn*** (car ((***cut-fn*** (car _)) _)))');

      expect(stringify(reader.read("x[x _ y]"))).to.equal('x');
      expect(stringify(reader.read())).to.equal('(***cut-fn*** (x _ y))');

      expect(stringify(reader.read("x[[abc]]"))).to.equal('x');
      expect(stringify(reader.read())).to.equal('(***cut-fn*** ((***cut-fn*** (abc))))');

    });
    it('table', function() {
      expect(stringify(reader.read("{ :abc \"abc\" 'def 2 }"))).to.equal('(table :abc "abc" (quote def) 2)');
      expect(stringify(reader.read("{ :a { :b :c } :d { :e { :f { :g :h }}}} "))).to.equal('(table :a (table :b :c) :d (table :e (table :f (table :g :h))))');
      expect(stringify(reader.read("x{:a :b}"))).to.equal('x');
      expect(stringify(reader.read())).to.equal('(table :a :b)');
      expect(stringify(reader.read("x{ {:x :y} :z }"))).to.equal('x');
      expect(stringify(reader.read())).to.equal('(table (table :x :y) :z)');

    });
    it('regexp', function() {
      expect(car(cdr(reader.read("#/abc\\ndef/")))).to.equal('abc\ndef');
      expect(car(cdr(reader.read("#/\\/\\/\\~/")))).to.equal('//\\~');
      expect(car(cdr(reader.read("#/\\/\\/\\.\\t/")))).to.equal('//\\.\t');
    });
  });
});

describe('VM eval', function(){

  function eval_eql(code, res) {
    var args = arguments;
    for (var i=0, l=args.length; i<l; i+=2) (function(i){
      var code = args[i];
      var res  = args[i+1];
      it(code, function() {
        expect(evaluate(code)).eql(res);
        /*
        compile_srv(code, function(asm) {
          expect(vm.run(asm)).eql(res);
          done();
        });
        */
      });
    })(i);
  }

  function replace_uniq(str) {
    // "abc %g10 %arc %g1-str %g %g6-x m".replace(/%g\d+(:?\-[^ '()\[\]";]+|)/g, "%UNIQ");
    return str.replace(/%g\d+(:?\-[^ '()\[\]";]+|)/g, "%UNIQ");
  }

  function eval_print_eql(code, res) {
    var args = arguments;
    for (var i=0, l=args.length; i<l; i+=2) (function(i){
      var code = args[i];
      var res  = args[i+1];
      it(code, function() {
        expect(replace_uniq(stringify(evaluate(code)))).eql(replace_uniq(res));
        /*
        compile_srv(code, function(asm) {
          expect(stringify(vm.run(asm))).eql(res);
          done();
        });
        */
      });
    })(i);
  }

  describe('values', function(){
    eval_eql(
      't',                                       t,
      'nil',                                     nil,
      '1',                                       1,
      '20',                                      20,
      '"abc"',                                   "abc",
      '"def\\nxyz"',                             "def\nxyz",
      "'(1 2 3)",                                cons(1,cons(2,cons(3,nil))),
      "'(1 . 2)",                                cons(1,2),
      "'a",                                      ArcJS.Symbol.get('a')
    );
  });

  describe('exprs', function(){
    eval_eql(
      '(+ 1 2)',                                 3,
      '(+ (/ 1 2) 3)',                           3.5,
      '(- 1 2 3)',                               -4,
      '(+ 1 (+ 2 3))',                           6,
      '(+ (- 3 4) (+ 1 (- 1 (* 3 2))))',         -5,
      '((fn (a b) (+ a b)) 10 20)',              30,
      "(if 'a 1 2)",                             1,
      '(if nil 1 2)',                            2,

      '((fn (c d)' +
        '  (* c' +
        '   ((fn (a b) (+ (- d c) a b d))' +
        '    d (+ d d))))' +
        ' 10 3)',                                  50,

      '((fn (a b)' +
        '   (+ a b)' +
        '   (- a b)' +
        '   (/ a b))' +
        ' 20 10)',                                 2,

      '((fn (a b)' +
        '  (do (+ 1 2)' +
        '    (+ a b)))' +
        ' 10 20)',                                 30,


      '((fn (a b)' +
        '   (assign a 10)' +
        '   (* a b))' +
        ' 1 3)', 30,

      '((fn (a b)' +
        '   (assign b 30)' +
        '   (* a b))' +
        ' 1 3)', 30,

      '((fn (a b)' +
        '   (assign a 10)' +
        '   (assign b 30)' +
        '   (* a b))' +
        ' 1 3)', 300,

      '((fn (a b)' +
        '   ((fn ()' +
        '      (assign a 10)))' +
        '   (* a b))' +
        ' 1 3)', 30,

      '((fn (a)' +
        '   ((fn (b)' +
        '      ((fn (c d)' +
        '         (assign a 100)' +
        '         ((fn (e)' +
        '            (assign e (+ a e))' +
        '            (assign c 20)' +
        '            (+ a b c d e))' +
        '          5))' +
        '       3 4))' +
        '    2))' +
        ' 1)', 231,

      '(> 10 20)', nil,

      '(< 10 10)', nil,
      '(< 10 11)', t,
      '(<= 10 10)', t,
      '(<= 10 9)',  nil,
      '(no nil)', t,
      '(no 10)', nil,
      '(is (no t) nil)', t
    );
  });

  describe('with / let', function(){

    evaluate('(def nth2 (n lis)' +
             '  (with (x (car lis) next (cdr lis))' +
             '    (if (< n 1) x (nth2 (- n 1) next))))');

    eval_eql(
      '(with (a 10) a)',   10,
      '(let a 10 a)',      10,

      '((fn (a b)' +
      ' (with (x (+ a b) y (- a b))' +
      '   (with (z (/ x y))' +
      '     (- a b x y z))))' +
      ' 3 5)',             -4,

      '(nth2 3 \'(1 2 3 4 5))', 4
    );

    eval_print_eql(
      '(let s \'(1 2) (list (with (x s) (cdr x)) s))', '(#0=(2) (1 . #0#))',
      '(let s \'(1 2) (list (list (list (with (x s) (cdr x)) s))))', '(((#0=(2) (1 . #0#))))',
      '(let s \'(1 2) (list (let x s (list (let y x (cdr y)) (car x))) s))', '((#0=(2) 1) (1 . #0#))',
      '((fn (a) (let b \'a (if b (with (c b d b) (list a b c d))))) \'a)', '(a a a a)',
      '(with (s \'(1 2 3)) (list (with (ss s) (with (sss ss) (with (ssss (car sss)) ((fn (sss) (assign s sss)) (cdr ss)) ssss))) s))', '(1 (2 3))'
    );

  });

  describe('def', function() {
    evaluate('(def fib (n) (if (< n 2) n (+ (fib (- n 1)) (fib (- n 2)))))');
    eval_eql(
      '(fib 10)', 55
    );
  });

  describe('fn dotted argument', function() {
    evaluate('(def a (x y) (+ x y))');
    evaluate('(def b (x . y) y)');
    evaluate('(def c x x)');
    eval_eql(
      '(a 1 2)', 3,
      '(b 1 2)', cons(2, nil),
      '(b 1)', nil,
      '(b 1 2 3 4)', cons(2, cons(3, cons(4, nil))),
      '(c)', nil,
      '(c 1)', cons(1, nil),
      '(c 1 2)', cons(1, cons(2, nil))
    );
  });

  describe('ccc', function () {
    eval_print_eql(
      // inner -> outer (non-tail-call)
      '(+ 1 (ccc (fn (c) (+ 3 5) (c (* 8 3)))))', "25",

      // inner -> outer (non-tail-call and through-native)
      '(+ 1 (ccc (fn (c) (+ 3 5) (apply (fn () (c (* 8 3)))))))', "25",

      // hungup case (TODO fix this. hint: evaluating order of arguments)
      /*
      ('((fn (x)' +
       '  ((fn (cc)' +
       '      (assign x (+ x (ccc (fn (c) (assign cc c) (c 1)))))' +
       '      (if (< x 4) (cc 2) x))' +
       '    nil))' +
       ' 0)'), "5",
      */

      // outer -> inner (non-tail-call)
      ('((fn (x)' +
       '  ((fn (cc)' +
       '      (assign x (+ (ccc (fn (c) (assign cc c) (c 1))) x))' +
       '      (if (< x 4) (cc 2) x))' +
       '    nil))' +
       ' 0)'), "5",

      // outer -> inner (non-tail-call and through-native)
      ('((fn (x)' +
       '  ((fn (cc)' +
       '      (assign x (apply (fn () (+ (ccc (fn (c) (assign cc c) (c 1))) x))))' +
       '      (if (< x 4) (cc 2) x))' +
       '    nil))' +
       ' 0)'), "5",

      // inner -> outer (tail-call)
      "((fn () (ccc (fn (c) (+ 1 2 (c 3))))))", "3",

      // outer -> inner (tail-call)
      "((fn () (ccc (fn (c) (assign cc c)))))", "#<fn>",
      "(cc 10)", "10",

      // inner -> outer (tail-call and through-native)
      "((fn () (ccc (fn (cc) (apply (fn (a b c) (cc (+ a b c))) (list 1 2 3))))))", "6",

      // outer -> inner (tail-call and through-native)
      "(apply (fn () (ccc (fn (c) (assign cc c)))))", "#<fn>",
      "(cc 10)", "10"

    );
  });

  describe('list manipuration', function() {
    eval_print_eql(
      "(car '(1 2 3))", "1",
      "(cdr '(1 2 3))", "(2 3)",
      "(caar '((1 2) 3 4))", "1",
      "(cadr '((1 2) 3 4))", "3",
      "(cddr '((1 2) 3 4))", "(4)",

      //"(conswhen (fn (_) (< (len _) 3)) '(1 2) '(3 4 5))", "((1 2) 3 4 5)",
      //"(conswhen (fn (_) (< (len _) 3)) '(1 2 3 4) '(3 4 5))", "(3 4 5)",

      "(firstn 3 '(1 2))", "(1 2)",
      "(firstn 3 '(a b c d e))", "(a b c)",

      "(nthcdr 0 '(1 2 3))", "(1 2 3)",
      "(nthcdr 2 '(1 2 3))", "(3)",
      "(nthcdr 10 '(1 2 3))", "nil"

    );
  });

  describe('tag', function() {
    eval_print_eql(
      "(assign x (annotate 'my-type (fn () x)))", "#<tagged my-type #<fn>>",
      "(type x)", "my-type",
      "(rep x)", "#<fn>"
    );
  });

  describe('table', function() {
    eval_print_eql(
      "(table)", "#<table n=0>",
      "(assign tbl (table))", "#<table n=0>",
      "(sref tbl 'a 0)", "a",
      "(ref tbl 0)", "a",
      "(sref tbl 'b 1.3)", "b",
      "(ref tbl 1.3)", "b",
      "(sref tbl 'c \"abc\")", "c",
      "(ref tbl \"abc\")", "c",
      "(sref tbl 'd 'sym)", "d",
      "(ref tbl 'sym)", "d",
      "(sref tbl 'e '(a b c))", "e",
      "(ref tbl (list 'a 'b 'c))", "e",
      "(assign tblf (fn () tblf))", "#<fn>",
      "(sref tbl 'f tblf)", "f",
      "(ref tbl tblf)", "f",
      "(ref tbl (fn () tblf))", "nil",
      "(ref tbl 'aaa)", "nil"
    );
  });

  describe('mac', function() {
    eval_print_eql(
      "(mac mac-test (x) `(+ ,x ,x))", "#<tagged mac #<fn:mac-test>>",
      "mac-test", "#<tagged mac #<fn:mac-test>>",
      "(mac-test 10)", "20",
      "((fn (mac-test) (mac-test 10)) -)", "-10", // shadowing
      "(with (mac-test -) (mac-test 10))", "-10", // shadowing
      "(mac mac-test2 (x) `(let a 10 ,x))", "#<tagged mac #<fn:mac-test2>>",
      "(macex1 '(mac-test2 a))", "(let a 10 a)"
    );
  });

  describe('afn', function() {
    eval_print_eql(
      "((afn (x y) (if (< x 0) (+ x y) (self (- x 1) (- y 1)))) 1 2)", "-1"
    );
  });

  describe('type-functions', function() {
    eval_print_eql(
      "('(1 2 3) 1)", "2",
      "(\"abcd\" 0)", "#\\a",
      "((let tbl (table) (sref tbl 'v 'k) tbl) 'k)", "v",
      "((let tbl (table) (sref tbl 'v 'k) tbl) 'x)", "nil"
    );
  });

  describe('compiler', function() {
    describe('micro utils', function() {
      eval_print_eql(
        // append
        "(+ '(1 2 3) '(4 5 6))", "(1 2 3 4 5 6)",
        "(+ '(1 2 3) '(4 5 . 6))", "(1 2 3 4 5 . 6)",
        // should error
        // "(+ '(1 2 . 3) '(4 5 6))", "",
        "(mem 3 '(1 2 3 4 5))", "(3 4 5)",
        "(mem (fn (x) (is x 3)) '(1 2 3 4 5))", "(3 4 5)",
        "(pos 3 '(1 2 3 4 5))", "2",
        "(pos (fn (x) (is x 3)) '(1 2 3 4 5))", "2",
        "(atom 1)", "t",
        "(atom nil)", "t",
        "(atom \"abc\")", "t",
        "(atom '(1 2))", "nil",
        "(atom '())", "t",
        "(rev '(1 2 3 4))", "(4 3 2 1)",
        "(nrev '(1 2 3 4))", "(4 3 2 1)",
        "(map (fn (x) (+ 1 x)) '(1 2 3))", "(2 3 4)",
        "(mappend (fn (x) (list (+ 1 x))) '(1 2 3))", "(2 3 4)",
        "(len '(1 2 3))", "3",
        "(len nil)", "0",
        "(len \"abc\")", "3",
        "(len \"\")", "0",
        "(uniq)", "%g0",
        "(%pair '())", "nil",
        "(%pair '(a))", "((a))",
        "(%pair '(a b))", "((a b))",
        "(%pair '(a b c))", "((a b) (c))",
        "(%pair '(a b c d))", "((a b) (c d))",
        "(union is '(a b c) '(b c d))", "(a b c d)",
        "(union is '(a a a b c) '(b c d))", "(a a a b c d)", // true ??

        "(flat '(a b c))", "(a b c)",
        "(flat nil)", "nil",
        "(flat '(a b (c)))", "(a b c)",
        "(flat '(a b (c (d (e) () (f (g) h) i))))", "(a b c d e f g h i)",
        "(dedup nil)", "nil",
        "(dedup '(a b c))", "(a b c)",
        "(dedup '(a c a b a b b c))", "(a c b)",
        "(keep (fn (x) (is x 2)) '(1 2 3))", "(2)",
        "(keep (fn (x) (is x 1)) nil)", "nil",
        "(keep (fn (x) (is x 3)) '(3 2 3 2 3 1))", "(3 3 3)",
        "(keep (fn (x) (is x 4)) '(3 2 3 2 3 1))", "nil"
      );
    });
    describe('utils', function() {
      eval_print_eql(
        "(set-minus '(1 2 3) '(1 3))", "(2)",
        "(set-intersect '(1 2 3 4) '(2 4))", "(2 4)",
        "(arc.compiler::dotted-to-proper '(a b))", "(a b)",
        "(arc.compiler::dotted-to-proper '(a b . c))", "(a b c)",
        "(arc.compiler::dotted-to-proper 'a)", "(a)"
      );
    });
    describe('qq', function() {
      eval_print_eql(
        "(arc.core::expand-qq (cadr '`(x x x x)))", "(quote (x x x x))", // (x x x x)
        "(arc.core::expand-qq (cadr '`(a b c ,@(list x x) x y z)))", "(cons (quote a) (cons (quote b) (cons (quote c) (+ (list x x) (quote (x y z))))))", // (a b c 2 2 x y z)
        "(arc.core::expand-qq (cadr '`(x x '(x ,x) x x)))", "(cons (quote x) (cons (quote x) (cons (cons (quote quote) (cons (cons (quote x) (cons x (quote nil))) (quote nil))) (quote (x x)))))" // (x x (quote (x 2)) x x)
      );
    });
    describe('complex-args', function() {
      eval_print_eql(
        "(arc.compiler::complex-args-get-var '(a b c d))",
        "(d c b a)",
        "(arc.compiler::complex-args-get-var '(a (x y z) b c d))",
        "(d c b z y x a)",
        "(arc.compiler::complex-args-get-var '(a (x y z . a) b c d))",
        "(d c b a z y x a)",
        "(arc.compiler::complex-args-get-var '(a (x y z . m) b (o xxx 10) (x1 x2) d . f))",
        "(f d x2 x1 xxx b m z y x a)",
        "(arc.compiler::complex-args-get-var '(o p q))",
        "(q p o)",
        "(arc.compiler::complex-args? nil)",
        "nil",
        "(arc.compiler::complex-args? '(x y z))",
        "nil",
        "(arc.compiler::complex-args? '(x y z . a))",
        "nil",
        "(arc.compiler::complex-args? '(x y z (a b) . a))",
        "t",
        "(arc.compiler::complex-args? '(x y z (o x 0) . a))",
        "t",
        "(arc.compiler::complex-args '(x) '(y))",
        "(x y)",
        "(arc.compiler::complex-args '(x (a b c)) '(y z))",
        "(x y a (car z) b (car #0=(cdr z)) c (car (cdr #0#)))",
        "(arc.compiler::complex-args '(x (a b (o c 'x))) '(y z))",
        "(x y a (car z) b (car #0=(cdr z)) c (if (acons #1=(cdr #0#)) (car #1#) (quote x)))",
        "(arc.compiler::complex-args '(x (a b c) (o a b)) '(y z k))",
        "(x y a (car z) b (car #0=(cdr z)) c (car (cdr #0#)) o (car k) a (car #1=(cdr k)) b (car (cdr #1#)))"
      );
    });
    describe('macex', function() {
      eval_print_eql(
        "(macex '(quote (1 2 3)))", "(quote (1 2 3))",

        "(macex '(caselet xx yy a 1 b 2 c 3 4))",
        "(with (xx yy) (%if (is xx (quote a)) 1 (%if (is xx (quote b)) 2 (%if (is xx (quote c)) 3 4))))",

        "(macex '(case (car x) a 1 b 2 c 3 4))",
        "(with (%g1 (car x)) (%if (is %g1 (quote a)) 1 (%if (is %g1 (quote b)) 2 (%if (is %g1 (quote c)) 3 4))))",

//        "(macex '(reccase (car x) (a (x) (+ x x)) (b (y) (- y y)) (c x)))",
//        "(with (%g2 (car (car x))) (%if (is %g2 (quote a)) (apply (fn (x) (+ x x)) (cdr (car x))) (%if (is %g2 (quote b)) (apply (fn (y) (- y y)) (cdr (car x))) (c x))))",

//        "(macex '(each a (cdr list) (prn a) (+ 1 p)))",
//        "((with (%g3 nil) (assign %g3 (fn (%g4) (%if %g4 (do (with (a (car %g4)) (do (prn a) (+ 1 p))) (%g3 (cdr %g4))) nil)))) (cdr list))",

        "(macex '(***cut-fn*** (+ (car _) 10)))",
        "(fn (_) (+ (car _) 10))",

        "(macex '(fn (a b . c) a b (list (+ a b) c)))",
        "(fn (a b . c) (do a b (list (+ a b) c)))",

        "(macex '(rfn y (a b c) (if (< 0 a) (+ a b c) (y (inc a) (inc b) (inc c)))))",
        "(with (y nil) (do (assign y (fn (a b c) (%if (< 0 a) (+ a b c) (y (inc a) (inc b) (inc c))))) (fn-name y (quote y)) y))",

        "(macex '((afn (x) (if (< 0 x) (self (dec x)) x)) 10))",
        "((with (self nil) (do (assign self (fn (x) (%if (< 0 x) (self (dec x)) x))) (fn-name self (quote self)) self)) 10)",

        "(macex '`(a b ,c ,@d e f))",
        "(cons (quote a) (cons (quote b) (cons c (+ d (quote (e f))))))",

        "(macex '(if a b))",
        "(%if a b nil)",
        "(macex '(aif a b))",
        "(with (it a) (%if it b nil))",

        "(macex '(if a b c))",
        "(%if a b c)",
        "(macex '(aif a b c))",
        "(with (it a) (%if it b c))",

        "(macex '(if a b c d))",
        "(%if a b (%if c d nil))",
        "(macex '(aif a b c d))",
        "(with (it a) (%if it b (with (it c) (%if it d nil))))",

        "(macex '(if a b c d e))",
        "(%if a b (%if c d e))",
        "(macex '(aif a b c d e))",
        "(with (it a) (%if it b (with (it c) (%if it d e))))",

        "(macex '(and a b c))",
        "(%if a (%if b c nil) nil)",

        "(macex '(or a b c))",
        "(with (%g3 a) (%if %g3 %g3 (with (%g4 b) (%if %g4 %g4 (with (%g5 c) (%if %g5 %g5 nil))))))",

        "(macex '(with (x a y b) x y (+ x y)))",
        "(with (x a y b) (do x y (+ x y)))",

        "(macex '(let x y (+ x y) (- x y)))",
        "(with (x y) (do (+ x y) (- x y)))",

        "(macex '(def f (a . b) (+ a (car b))))",
        "(assign f (with (f nil) (do (assign f (fn (a . b) (+ a (car b)))) (fn-name f (quote f)) f)))",

        "(macex 'car:car:cdr:cdr)",
        "(fn %g6-g ((fn %g7-g ((fn %g8-g (car (apply car %g8-g))) (apply cdr %g7-g))) (apply cdr %g6-g)))",

        "(macex '~abc)",
        "(complement abc)",

        "(macex 'abc.def.ghi)",
        "((abc def) ghi)",

        "(macex '1...10)",
        "1...10",

        "(macex 'abc!def!ghi)",
        "((abc (quote def)) (quote ghi))",

        "(macex 'arc.compiler::refer-free)",
        "(with (%g6-orig (***curr-ns***)) (do (ns (quote arc.compiler)) (with (%g7-rt refer-free) (do (ns %g6-orig) %g7-rt))))"

      );
    });

    describe('compile-refer', function() {
      eval_print_eql(
        "(arc.compiler::compile-refer 'a '(((a b) (c d e) (f)) (g h i) j k l) '(halt))",
        "(refer-let 0 0 (halt))",

        "(arc.compiler::compile-refer 'd '(((a b) (c d e) (f)) (g h i) j k l) '(halt))",
        "(refer-let 1 1 (halt))",

        "(arc.compiler::compile-refer 'f '(((a b) (c d e) (f)) (g h i) j k l) '(halt))",
        "(refer-let 2 0 (halt))",

        "(arc.compiler::compile-refer 'i '(((a b) (c d e) (f)) (g h i) j k l) '(halt))",
        "(refer-local 2 (halt))",

        "(arc.compiler::compile-refer 'k '(((a b) (c d e) (f)) (g h i) j k l) '(halt))",
        "(refer-free 1 (halt))",

        "(arc.compiler::compile-refer 'x '(((a b) (c d e) (f)) (g h i) j k l) '(halt))",
        "(refer-global x (indirect (halt)))"
      );
    });
    describe('find-free', function() {
      eval_print_eql(
        "(arc.compiler::find-free '(fn (a b c) ((fn (x y) (+ a b c d (- x y))) y z)) '())",
        "(+ d - y z)",

        "(arc.compiler::find-free '(fn (a b c) (with (x (- y z) y 2) (+ a b c d x y z))) '())",
        "(- y z + d)",

        "(arc.compiler::find-free '(fn (a b c) (do (+ a b c d) (with (x y) (+ x z)) (- a c))) '())",
        "(+ d y z -)",

        "(arc.compiler::find-free '(fn (a b . c) (+ a b c d)) '())",
        "(+ d)"
      );
    });

    describe('find-sets', function() {
      eval_print_eql(
        "(arc.compiler::find-sets '(fn (a b c) (assign d x)) '(a b c d e f g))",
        "(d)",

        "(arc.compiler::find-sets '(fn (a b c) (with (g (assign e x)) (assign g y))) '(a b c d e f g))",
        "(e)",

        "(arc.compiler::find-sets '(fn x (assign x e)) '(x e))",
        "nil"
      );
    });

    describe('make-boxes', function() {
      eval_print_eql(
        "(arc.compiler::make-boxes '(a b) '(a b c) '(halt))", "(box 0 (box 1 (halt)))"
      );
    });

    describe('tailp', function() {
      eval_print_eql(
        "(arc.compiler::tailp '(return 3 (halt)))", "3",
        "(arc.compiler::tailp '(halt))", "nil",
        "(arc.compiler::tailp '(exit-let 3 3 (return 3 (halt))))", "6"
      );
    });

    describe('collect-free', function() {
      eval_print_eql(
        "(arc.compiler::collect-free '(a d f i k x) '(((a b) (c d e) (f)) (g h i) j k l) '(halt))",
        "(refer-global x (indirect (argument (refer-free 1 (argument (refer-local 2 (argument (refer-let 2 0 (argument (refer-let 1 1 (argument (refer-let 0 0 (argument (halt))))))))))))))"
      );
    });

    describe('remove-globs', function() {
      eval_print_eql(
        "(arc.compiler::collect-free '(a d f i k x) '(((a b) (c d e) (f)) (g h i) j k l) '(halt))",
        "(refer-global x (indirect (argument (refer-free 1 (argument (refer-local 2 (argument (refer-let 2 0 (argument (refer-let 1 1 (argument (refer-let 0 0 (argument (halt))))))))))))))"
      );
    });

    describe('compile', function() {
      eval_print_eql(
        "(compile '(+ 1 2))",
        "((frame 10) (constant 1) #0=(argument) (constant 2) #0# (constant 2) #0# (refer-global +) (indirect) (apply) (halt))",

        "(compile '(+ (- 3 4) (+ 1 (- 1 (* 3 2)))))",
        "((frame 46) (frame 10) (constant 3) #0=(argument) (constant 4) #0# (constant 2) #0# (refer-global -) #1=(indirect) #2=(apply) #0# (frame 28) (constant 1) #0# (frame 19) (constant 1) #0# (frame 10) (constant 3) #0# (constant 2) #0# (constant 2) #0# (refer-global *) #1# #2# #0# (constant 2) #0# (refer-global -) #1# #2# #0# (constant 2) #0# (refer-global +) #1# #2# #0# (constant 2) #0# (refer-global +) #1# #2# (halt))",

        "(compile '((fn (a b) (+ a b)) 10 20))",
        "((frame 19) (constant 10) #0=(argument) (constant 20) #0# (constant 2) #0# (close 0 11 2 -1) (refer-local 1) #0# (refer-local 0) #0# (constant 2) #0# (refer-global +) (indirect) (shift 3 3) #1=(apply) #1# (halt))",

        "(compile '(if 'a 1 2))",
        "((constant a) (test 3) (constant 1) (jump 2) (constant 2) (halt))",

        "(compile '((fn (c d) (* c ((fn (a b) (+ (- d c) a b d)) d (+ d d)))) 10 3))",
        "((frame 63) (constant 10) #0=(argument) (constant 3) #0# (constant 2) #0# (close 0 55 2 -1) (refer-local 1) #0# (frame 45) (refer-local 0) #0# (frame 10) (refer-local 0) #0# (refer-local 0) #0# (constant 2) #0# (refer-global +) #1=(indirect) #2=(apply) #0# (constant 2) #0# (refer-local 1) #0# (refer-local 0) #0# (close 2 24 2 -1) (frame 10) (refer-free 0) #0# (refer-free 1) #0# (constant 2) #0# (refer-global -) #1# #2# #0# (refer-local 1) #0# (refer-local 0) #0# (refer-free 0) #0# (constant 4) #0# (refer-global +) #1# (shift 5 3) #2# #2# #0# (constant 2) #0# (refer-global *) #1# (shift 3 3) #2# #2# (halt))",

        "(compile '((fn (a b) (assign a 10) (assign b 30) (* a b)) 1 3))",
        "((frame 27) (constant 1) #0=(argument) (constant 3) #0# (constant 2) #0# (close 0 19 2 -1) (box 0) (box 1) (constant 10) (assign-local 1) (constant 30) (assign-local 0) (refer-local 1) #1=(indirect) #0# (refer-local 0) #1# #0# (constant 2) #0# (refer-global *) #1# (shift 3 3) #2=(apply) #2# (halt))",

        "(compile '((fn (a) ((fn (b) ((fn (c d) (assign a 100) ((fn (e) (assign e (+ a e)) (assign c 20) (+ a b c d e)) 5)) 3 4)) 2)) 1))",
        "((frame 83) (constant 1) #0=(argument) (constant 1) #0# (close 0 77 1 -1) (box 0) (constant 2) #0# (constant 1) #0# (refer-local 0) #0# (close 1 67 1 -1) (constant 3) #0# (constant 4) #0# (constant 2) #0# (refer-local 0) #0# (refer-free 0) #0# (close 2 54 2 -1) (box 1) (constant 100) (assign-free 0) (constant 5) #0# (constant 1) #0# (refer-local 0) #0# (refer-free 1) #0# (refer-local 1) #0# (refer-free 0) #0# (close 4 36 1 -1) (box 0) (frame 12) (refer-free 0) #1=(indirect) #0# (refer-local 0) #1# #0# (constant 2) #0# (refer-global +) #1# #2=(apply) (assign-local 0) (constant 20) (assign-free 1) (refer-free 0) #1# #0# (refer-free 2) #0# (refer-free 1) #1# #0# (refer-free 3) #0# (refer-local 0) #1# #0# (constant 5) #0# (refer-global +) #1# (shift 6 2) #2# (shift 2 3) #2# (shift 3 2) #2# (shift 2 2) #2# #2# (halt))",

        "(compile '(let a 10 a))",
        "((constant 10) (argument) (enter-let) (refer-let 0 0) (exit-let 2 2) (halt))",

        "(compile '(def fib (n) (if (< n 2) n (+ (fib (- n 1)) (fib (- n 2))))))",
        "((refer-nil) #0=(argument) (enter-let) (box 0) (refer-let 0 0) #0# (close 1 57 1 -1) (frame 10) (refer-local 0) #0# (constant 2) #0# (constant 2) #0# (refer-global <) #1=(indirect) #2=(apply) (test 3) (refer-local 0) (jump 43) (frame 17) (frame 10) (refer-local 0) #0# (constant 1) #0# (constant 2) #0# (refer-global -) #1# #2# #0# (constant 1) #0# (refer-free 0) #1# #2# #0# (frame 17) (frame 10) (refer-local 0) #0# (constant 2) #0# (constant 2) #0# (refer-global -) #1# #2# #0# (constant 1) #0# (refer-free 0) #1# #2# #0# (constant 2) #0# (refer-global +) #1# (shift 3 2) #2# (return 2) (assign-let 0 0) (frame 11) (refer-let 0 0) #1# #0# (constant fib) #0# (constant 2) #0# (refer-global fn-name) #1# #2# (refer-let 0 0) #1# (exit-let 2 2) (assign-global fib) (halt))",

        "(compile '(+ 1 (ccc (fn (c) (+ 3 5) (apply (fn () (c (* 8 3))))))))",
        "((frame 52) (constant 1) #0=(argument) (frame 43) (conti 0) #0# (constant 1) #0# (close 0 37 1 -1) (frame 10) (constant 3) #0# (constant 5) #0# (constant 2) #0# (refer-global +) #1=(indirect) #2=(apply) (refer-local 0) #0# (close 1 17 0 -1) (frame 10) (constant 8) #0# (constant 3) #0# (constant 2) #0# (refer-global *) #1# #2# #0# (constant 1) #0# (refer-free 0) (shift 2 1) #2# #0# (constant 1) #0# (refer-global apply) #1# (shift 2 2) #2# #2# #0# (constant 2) #0# (refer-global +) #1# #2# (halt))"
      );
    });
  });

  describe('complex args (with / let / fn)', function(){

    eval_eql(
      '(with ((a b c) \'(1 2 3)) (+ a b c))',   6,
      '(let (a b c) \'(1 2 3) (+ a b c))',      6,
      '(let (a b c . d) \'(1 2 3 . 4) d)',      4,
      '(let ((a b c) d (e f) (o g 10)) \'((1 2 3) 4 (5 6) 7) (+ a b c d e f g))', 28,
      '(let ((a b c) d (e f (g)) (o h 100)) \'((1 2 3) 4 (5 6 (7)) 8) (+ a b c d e f g h))', 36,
      '(let (a (o b 10)) \'(1) (+ a b))',       11,
      '(let (o a (o b 3)) \'(1 2) (+ o a b))',  6,
      '((fn (a b c) a) 1 2 3)',                 1,
      '((fn (a b . c) (+ a b (car c))) 1 2 3)', 6,
      '((fn ((a) b . c) (+ a b (car c))) \'(1) 2 3)', 6,
      '((fn (a b)' +
      ' (with ((x y) (list (+ a b) (- a b)))' +
      '   (with (z (/ x y))' +
      '     (- a b x y z))))' +
      ' 3 5)',             -4,
      '((fn (a (o b 10)) (+ a b)) 1)', 11
    );

    eval_print_eql(
      ('(def nth3 (n lis)' +
       '  (with ((x . next) lis)' +
       '    (if (< n 1) x (nth3 (- n 1) next))))'),
      "#<fn:nth3>",
      '(nth3 3 \'(1 2 3 4 5))', '4'
    );

  });

  describe('arc', function() {
    describe('coerce', function() {
      // char to
      eval_print_eql('(coerce #\\A \'int)', '65');
      eval_print_eql('(coerce #\\B \'num)', '66');
      eval_print_eql('(coerce #\\C \'sym)', 'C');
      eval_print_eql('(coerce #\\D \'string)', '"D"');
      eval_print_eql('(coerce #\\E \'char)', '#\\E');
      // int to
      eval_print_eql('(coerce 65 \'char)', '#\\A');
      eval_print_eql('(coerce 66 \'string 16)', '"42"');
      eval_print_eql('(coerce 67 \'int)', '67');
      eval_print_eql('(coerce 68 \'num)', '68');
      // num to
      eval_print_eql('(coerce 68.4 \'char)', '#\\D');
      eval_print_eql('(coerce 67.2 \'string 10)', '"67.2"');
      eval_print_eql('(coerce 65.5 \'int)', '65');
      eval_print_eql('(coerce 66.7 \'num)', '66.7');
      // string to
      eval_print_eql('(coerce "ABC" \'sym)', 'ABC');
      eval_print_eql('(coerce "A B C" \'sym)', '|A B C|');
      eval_print_eql('(coerce "abc" \'cons)', '(#\\a #\\b #\\c)');
      eval_print_eql('(coerce "0101001" \'int 2)', '41');
      eval_print_eql('(coerce "23.45" \'num)', '23.45');
      eval_print_eql('(coerce "string" \'string)', '"string"');
      // cons to
      eval_print_eql('(coerce \'(#\\A #\\b #\\() \'string)', '"Ab("');
      eval_print_eql('(coerce \'(1 2 3) \'cons)', '(1 2 3)');
      // sym to
      eval_print_eql('(coerce \'asym \'string)', '"asym"');
      eval_print_eql('(coerce \'bsym \'sym)', 'bsym');
      eval_print_eql('(coerce nil \'string)', '""');
      eval_print_eql('(coerce t \'string)', '"t"');
      eval_print_eql('(coerce nil \'cons)', 'nil');
    });
    describe('+', function() {
      eval_print_eql('(+ 1 2 3)', '6');
      eval_print_eql('(+ 1 2.256)', '3.256');
      eval_print_eql('(+ \'(a b c) "xyz")', '"abcxyz"');
      eval_print_eql('(+ 1 "abc" 2 \'(b 3 #\\x "xy" (z a)) \'z nil)', '"1abc2b3xxyzaz"');
      eval_print_eql('(+ #\\a #\\b #\\c)', '"abc"');
      eval_print_eql("(+ '(1 2 3) '(4 5 6))", "(1 2 3 4 5 6)");
    });
    describe('bound', function() {
      eval_print_eql('(bound \'xxxx)', 'nil');
      eval_print_eql('(bound \'bound)', 't');
      eval_print_eql('(do (assign xxxx \'a) (bound \'xxxx))', 't');
    });
    describe('newstring', function() {
      eval_print_eql('(newstring 5 #\\a)', '"aaaaa"');
    });
    describe('scar/scdr', function() {
      eval_print_eql('(assign x \'(n b))', '(n b)');
      eval_print_eql('(scar x \'a)', 'a');
      eval_print_eql('x', '(a b)');
      eval_print_eql('(scdr x \'b)', 'b');
      eval_print_eql('x', '(a . b)');
    });
    describe('apply', function() {
      eval_print_eql("(apply list)",             "nil");
      eval_print_eql("(apply list nil)",         "nil");
      eval_print_eql("(apply list 'x)",          "(x)");  // is this ok? anarki raises an error but this is more convenient.
      eval_print_eql("(apply list '(b c) '(d))", "((b c) d)");
      eval_print_eql("(apply list 'x '(a))",     "(x a)");
      eval_print_eql("(apply list 'x 'y)",       "(x y)");
      eval_print_eql("(apply list 'x 'y nil)",   "(x y)");
    });
    describe('circular-list', function() {
      eval_print_eql("(let s \'(1 2) (list (cdr s) s))",
                     "(#0=(2) (1 . #0#))");
      eval_print_eql("(let x \'(b c) `((a ,x) (b ,x)))",
                     "((a #0=(b c)) (b #0#))");
      eval_print_eql("(let x \'(b c) (let y `(a ,x) `((a ,x) (b ,y) (c ,y))))",
                     "((a #0=(b c)) (b #1=(a #0#)) (c #1#))");
      eval_print_eql("(do (= a \'(a b c)) (scdr (cddr a) a) a)",
                     "#0=(a b c . #0#)");
      eval_print_eql("(do (= a \'(a b c)) (scdr (cddr a) a) (cdr a))",
                     "#0=(b c a . #0#)");
      eval_print_eql("(do (= a \'(a b c)) (scdr (cddr a) a) (cddr a))",
                     "#0=(c a b . #0#)");
      eval_print_eql("(do (= a \'(a b c)) (scdr (cddr a) a) (cdddr a))",
                     "#0=(a b c . #0#)");
      eval_print_eql("(do (= b \'(a b (c d (e f)))) (scdr (cdr (caddr (caddr b))) (caddr (caddr b))) b)",
                     "(a b (c d #0=(e f . #0#)))");
      eval_print_eql("(do (= b \'(a b (c d (e f)))) (scdr (cdr (caddr (caddr b))) (caddr (caddr b))) (cddr b))",
                     "((c d #0=(e f . #0#)))");
      eval_print_eql("(do (= b \'(a b (c d (e f)))) (scdr (cdr (caddr (caddr b))) (caddr (caddr b))) (scdr (cddr b) b) b)",
                     "#0=(a b (c d #1=(e f . #1#)) . #0#)");
      eval_print_eql("(do (= b \'(a b (c d (e f)))) (scdr (cdr (caddr (caddr b))) (caddr (caddr b))) (scdr (cddr b) b) (scdr (cddr (caddr b)) b) b)",
                     "#0=(a b (c d #1=(e f . #1#) . #0#) . #0#)");
      eval_print_eql("(do (= c \'(a b c)) (scdr (cddr c) (cddr c)) c)",
                     "(a b . #0=(c . #0#))");
      eval_print_eql("(do (= b \'(a b (c d (e f)))) (scdr (cdr (caddr (caddr b))) (caddr (caddr b))) (scdr (cddr b) b) (scdr (cddr (caddr b)) b) (cdr b))",
                     "#0=(b (c d #1=(e f . #1#) . #2=(a . #0#)) . #2#)");
      eval_print_eql("(do (= b \'(a b (c d (e f)))) (scdr (cdr (caddr (caddr b))) (caddr (caddr b))) (scdr (cddr b) b) (scdr (cddr (caddr b)) b) (cddr b))",
                     "#0=((c d #1=(e f . #1#) . #2=(a b . #0#)) . #2#)");
    });

  });

});
