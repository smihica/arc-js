
********
Tutorial
********

Installation and Usage
======================

from npm
--------

.. code-block:: sh

   $ sudo npm install -g arc-js

from source
-----------

Install nodejs first.

In mac:

.. code-block:: sh

   $ sudo port install nodejs
   $ sudo port install npm

In linux (debian):

.. code-block:: sh

   $ sudo apt-get install nodejs
   $ sudo apt-get install npm
   $ sudo apt-get install node-legacy

Clone this repository and make.

.. code-block:: sh

   $ git clone https://github.com/smihica/arc-js.git
   $ cd arc-js
   $ npm install
   $ make; make test;

Then go to your project.

.. code-block:: sh

   $ npm install /ArcJS/Repository/PATH

Using in node
-------------

.. code-block:: sh

   $ node
   arc> var ArcJS = require('arc-js');
   arc> ArcJS.version
   'X.X.X'
   arc> var arc = ArcJS.context();
   arc> arc.evaluate('(prn "hello world")');
   hello world
   'hello world'
   arc>

more information

Using in web-page (JavaScript)
------------------------------

.. code-block:: html

   $ cp /ArcJS/Repository/PATH/arc.min.js .
   $ echo index.html
   <html>
     <head>
       <script type="text/javascript" src="arc.min.js"></script>
       <script>
         var arc = ArcJS.context();
         arc.evaluate('(prn "hello world")');
       </script>
     </head>
     <body></body>
   </html>

When open the web-page then "hello world" will be in console.

Using in web-page (Arc)
-------------------------

.. code-block:: html

   $ echo index.html
   <html>
     <head>
       <script type="text/javascript" src="arc.min.js"></script>
       <script type="text/javascript" src="jquery.min.js"></script>
       <script type="text/javascript" src="arc-loader.js"></script>
       <script type="text/arc">
         (prn "hello world")
       </script>
     </head>
   </html>

more information

Playing in REPL
===============

Starting REPL
-------------

If you've installed via ``npm install -g``

.. code-block:: sh

   $ arcjs
   arc>

otherwise ``npm install``

.. code-block:: sh

   $ node_modules/arc-js/bin/arcjs
   arc>

Atoms
-----

after ``;`` will be comment in arc.

Symbols
^^^^^^^

.. code-block:: scheme

   arc> t
   t
   arc> nil
   nil
   arc> 'a
   a
   arc> 'u-nk_~o#abc$$%%moemoe
   u-nk_~o#abc$$%%moemoe
   arc> '|a b c| ;; A symbol has delimiter strings
   |a b c|

Numbers
^^^^^^^

.. code-block:: scheme

   arc> 0
   0
   arc> 3.14
   3.14
   arc> -inf.0
   -inf.0
   arc> #x10 ;; hexadecimal notation
   16

Characters
^^^^^^^^^^

.. code-block:: clojure

   arc> #\a
   #\a
   arc> #\あ ;; unicode
   #\あ

Escape characters are
``#\nul`` ``#\null`` ``#\backspace`` ``#\tab`` ``#\linefeed``
``#\newline`` ``#\vtab`` ``#\page`` ``#\return`` ``#\space`` ``#\rubout``

.. code-block:: scheme

   arc> #\newline
   #\newline

Strings
^^^^^^^

.. code-block:: scheme

   arc> "abc"
   "abc"
   arc> "あいう" ;; unicode
   "あいう"
   arc> "a\nb"
   "a\nb"
   arc> "\u000A" ;; unicode
   "\n"

Cons
^^^^

.. code-block:: scheme

   arc> '(a b)
   (a b)
   arc> '(a . (b . c))
   (a b . c)

.. arc> '#0=(a b . #0#) ;; ring list => (a b a b a b a b ... )

Regular Expression (using JavaScript's RegExp() internally)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: clojure

   arc> #/a/
   #<regex /a/>
   arc> #/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/
   #<regex /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/>

Hash table
^^^^^^^^^^

.. code-block:: scheme

   arc> (table)
   #<table n=0>
   arc> (table 'key 'val)
   #<table n=1>

``n=d`` means properties num.
And to access the key

.. code-block:: scheme

   arc> (= tbl (table 'key 'val))
   #<table n=1>
   arc> (tbl 'key)
   val
   arc> (tbl 'notfound)
   nil

If the key is not found then nil returns.

Special syntax for table.
``{ key value }`` to be ``(table key value)``

.. code-block:: clojure

   arc> { :key1 :value1 "key2" "value2" }
   #<table n=2>


keys are able to be any type.

.. code-block:: clojure

   arc> (= tbl {
    :abc  "def"
    "GHI" 'jkl
    'mno  "pqr"
     10   100
   })
   #<table n=4>
   arc> (tbl :abc)
   "def"
   arc> (tbl "GHI")
   jkl
   arc> (tbl 'mno)
   "pqr"
   arc> (tbl 10)
   100
   arc> (tbl 'notfound)
   nil

Tagged
^^^^^^

.. code-block:: clojure

   arc> (annotate 'my-type (table))
   #<tagged my-type #<table n=0>>

Expressions
-----------

Arc (and most of all lisp languages) uses S-Expression.

.. code-block:: clojure

   arc> (+ 1 2)
   3
   arc> (+ (/ 1 2) 3)
   3.5

Binding local variables
^^^^^^^^^^^^^^^^^^^^^^^

To bind local variables, there are ``let``, ``with`` and ``withs`` syntax.

- ``let``  binds just 1 value

``(let var val body)``

.. code-block:: clojure

  arc> (let a 10
         (+ a (* a 2)))
  30

- ``with`` binds multiple values

``(with (var1 val1 var2 val2) body)``

.. code-block:: clojure

   arc> (with (x 3 y 4)
          (sqrt (+ (expt x 2) (expt y 2))))
   5

There is also ``withs`` syntax that can bind sequentially.

``(withs (var1 val1 var2 using-var1) body)``

.. code-block:: clojure

   arc> (withs (x 3 y (* x 10))
          (+ x y))
   33

You also can use pattern matching in ``let / with / withs``.

.. code-block:: clojure

   arc> (let (a b c . d) '(1 2 3 . 4)
          (* a b c d))
   24

Conditions
^^^^^^^^^^

There is some condition statements. ``if`` ``when`` ``aif`` ``awhen`` ``case``

``(if condition then else)``

In arc, all the non-nil values will be considered as true.

.. code-block:: clojure

   arc> (if 0 'a 'b)
   a
   arc> (if nil 'a 'b)
   b
   arc> (if nil 'a)
   nil

Use (no x) to invert the logic.

.. code-block:: clojure

   arc> (if (no nil) 'a 'b)
   'a
   arc> (if (no (odd 2)) 'a)
   'a

In arc

.. code-block:: clojure

   (if a b c d e)

is same as

.. code-block:: clojure

   (if a
       b
       (if c
           d
           e))

is / iso
^^^^^^^^

.. code-block:: clojure

   arc> (is 'a 'a)
   t
   arc> (is '(a b) '(a b))
   nil
   arc> (iso '(a b) '(a b))
   t

Binding
^^^^^^^

using ``=``, you can bind value into a variable.

.. code-block:: clojure

   arc> (= s '(f o o))
   (f o o)
   arc> s
   (f o o)

You also can bind into a place.

.. code-block:: clojure

   arc> (= (s 0) 'm)
   m
   arc> s
   (m o o)

You can define your own set function by using ``defset``.

.. code-block:: clojure

   arc> (defset caddr (x)
          (w/uniq g
            (list (list g x)
                  `(caddr ,g)
                  `(fn (val) (scar (cddr ,g) val)))))

Then

.. code-block:: clojure

   arc> (= (caddr s) 'v)
   v
   arc> s
   (m o v)

to get more information for ``defset`` read `here <refs.html#defset>`_.

multiple expressions
^^^^^^^^^^^^^^^^^^^^

You can run some expressions sequentially using ``do`` ``do1``.
``do`` returns result of the last expression.

.. code-block:: clojure

   arc> (let x 2
          (if (even x)
              (do (prn x " is even value !!")
                  (* x 10))
              (do (prn x " is odd value!!")
                  (/ x 10))))
   2 is even value !!
   20

``do1`` returns result of the first expression.

.. code-block:: clojure

   arc> (do1 (prn (+ 2 " is even value !!"))
             (prn (+ 3 " is odd value !!")))
   2 is even value !!
   3 is odd value !!
   "2 is even value !!"

def
^^^

``def`` defines new global function into current namespace.

.. code-block:: clojure

   arc> (def fizz-buzz (l)
          (for n 1 l
            (prn (case (gcd n 15)
                  1 n
                  3 'Fizz
                  5 'Buzz
                 'FizzBuzz))))
   #<fn:fizz-buzz>
   arc> (fizz-buzz 100)
   1
   2
   Fizz
   ...

iterate syntaxes
^^^^^^^^^^^^^^^^

There are a lot of iterate syntax in arc.
``for`` ``each`` ``while`` ``repeat`` ``map``

.. code-block:: clojure

   arc> (for i 1 10 (pr i " "))
   1 2 3 4 5 6 7 8 9 10 nil
   arc> (each x '(a b c d e)
          (pr x " "))
   a b c d e nil
   arc> (let x 10
          (while (> x 5)
            (= x (- x 1))
            (pr x)))
   98765nil
   arc> (repeat 5 (pr "la "))
   la la la la la nil
   arc> (map (fn (x) (+ x 10)) '(1 2 3))
   (11 12 13)

short cut function syntax
^^^^^^^^^^^^^^^^^^^^^^^^^

``[+ _ 10]`` will be compiled to ``(fn (_) (+ _ 10))``

.. code-block:: clojure

   arc> (map [+ _ 10] '(1 2 3))
   (11 12 13)

mac
^^^

.. code-block:: clojure

   arc> (mac when2 (tes . then) `(if ,tes (do ,@then)))
   #<tagged mac #<fn:when2>>
   arc> (when2 t 1 2 3)
   3

Arc's mac creates legacy macros, so you can create macros that binds variables implicitly.

.. code-block:: clojure

   arc> (mac aif2 (tes then else)
          `(let it ,tes
             (if it ,then ,else)))
   #<tagged mac #<fn:aif2>>
   arc> (aif2 (car '(a b c)) it 'x)
   a

By using ``w/uniq``, you can create one-time symbols.

.. code-block:: clojure

   arc> (mac prn-x-times (form times)
          (w/uniq v
            `(let ,v ,form
               (do ,@(map (fn (_) `(prn ,v)) (range 1 times))
                   nil))))
   #<tagged mac #<fn:prn-x-times>>
   arc> (let i 5 (prn-x-times (++ i) 3))
   6
   6
   6
   nil

``(w/uniq (v1 v2 v3 ...) body)`` is also OK.

continuation
^^^^^^^^^^^^

You can create continuations by using ``ccc``

.. code-block:: clojure

   arc> (ccc
          (fn (c)
            (do (c 10)
                (err))))
   10
   ;; like yield
   arc> (ccc
          (fn (return)
            (let x 0
              (while t
                (let adder
                  (or (ccc (fn (c)
                             (= next c)
                             (return x)))
                      1)
                  (++ x adder))))))
   0
   arc> (next nil)
   1
   arc> (next nil)
   2
   arc> (next 10)
   12
   arc> (next nil)
   13

symbol-syntax
^^^^^^^^^^^^^

As an arc's function, there are macros that'll be expanded when a symbol matches some patterns.
This function named ``symbol-syntax``.
For example ``(car:cdr x)`` will be expanded ``(car (cdr x))`` (If there is ``:`` in the symbol then expands).

.. code-block:: clojure

   arc> (car:cdr '(1 2 3))
   2

And ``~x`` will be expanded ``(complement x)``

.. code-block:: clojure

   arc> (if (~no 'a) 'b 'c)
   c

You can check the expanded expression of ``symbol-syntax`` by using ``ssexpand``.

.. code-block:: clojure

   arc> (ssexpand 'abc:def)
   (compose abc def)
   arc> (ssedpand '~no)
   (complement no)

As ArcJS's expantion, there is a function that makes users be able to define arbitrary ``symbol-syntax``; ``defss``.

For example, lets define new special-syntax that is able to expand ``(caadaar x)`` or ``(cadadadadadar x)`` to
expressions composed ``car`` and ``cdr``.

.. code-block:: clojure

   arc> (defss cxr-ss #/^c([ad]{3,})r$/ (xs)
          (let ac [case _ #\a 'car #\d 'cdr]
            `(fn (x)
               ,((afn (xs) (if xs `(,(ac (car xs)) ,(self (cdr xs))) 'x))
                 (coerce (string xs) 'cons)))))
   #<tagged special-syntax (#<regex /^c([ad]{3,})r$/> 12 #<fn:cxr-ss>)>

Then

.. code-block:: clojure

   arc> (ssexpand 'caaaar)
   (fn (x) (car (car (car (car x)))))
   arc> (ssexpand 'cadadar)
   (fn (x) (car (cdr (car (cdr (car x))))))

So you are able to do

.. code-block:: clojure

   arc> (caddddddddr '(1 2 3 4 5 6 7 8 9 0))
   9

namespaces
^^^^^^^^^^

ArcJS has a clojure like namespace expansion.
To create a namespace use ``(defns xx)``.

.. code-block:: clojure

   arc> (defns A)
   #<namespace A>

And then you can go into the namespace by using ``(ns namespace)``.

.. code-block:: clojure

   arc> (ns 'A)
   #<namespace A>
   arc:A>

Or you also can use ``string`` or ``namespace object`` as the argument.

.. code-block:: clojure

   ;; using string
   arc> (ns "A")
   #<namespace A>
   arc:A>

.. code-block:: clojure

   ;; This way is the most commonly pattern.
   arc> (ns (defns B))
   #<namespace B>
   arc:B>

As you see, the prompt changes ``arc:A>`` to describe where namespace we are in now.

To get the namespace we are in now, use ``(***curr-ns***)``.

.. code-block:: clojure

   arc:A> (***curr-ns***)
   #<namespace A>

By the way, To the value that was bound in a variable named like ``***VAR***``, You can access from any namespaces.
In a word, a variable named like ``***VAR***`` will be truly global.

To export names use ``:export`` like

.. code-block:: clojure

   arc> (defns A :export fn1 macro1 fn2)

Then, You can access ``fn1 / macro1 / fn2`` in any namespaces that import ``namespace A``.
If you don't specify ``:export``, every variables in the namespace will export.

And To import other namespace use ``:import`` like

.. code-block:: clojure

   arc> (defns C :import A B)

Then, You can access values export in namespace B and C when you go into namespace A but you can't access values import in B and C.
By this time, namespace B and C must be loaded beforhand.

And there is also ``:extend`` option.

.. code-block:: clojure

   arc> (defns D :extend A)

When you use it, you can extend the specified namespace.
In the new namespace, you can access all variables in specified namespace.

more information

Using in a web-page
===================

Now, let's create a simple example on a web-page.
For example, I'd like to create a reversi game that works on the web.
シンプルなオセロゲームを作りたいと思います。
And I plan to use ArcJS for its search engine.
例として、自動プレイの思考部にArcJSで作った探索エンジンを使いたいと思います。
まずは以下のようなHTMLを書きます。

See :download:`this example script <_static/othello.html>`

arc_loader.js をロードすると、script type に "text/arc" が指定された arc スクリプトが onload上から順番に読み込まれます。

.. code-block:: html

   <script type="text/arc" src="othello.arc"></script>

   <script type="text/arc">
   (start-game)
   </script>

arc_loader.js を使うにはjqueryが必要です。

othello.arcはこのようになっています。

See :download:`this example script <_static/othello.arc>`

単純なAB探索で3手先まで読むようになっています。
読みの深さと一手についての最大幅をev-depthとev-spaceでそれぞれ指定できます。

See :download:`this example script <_static/arc.min.js>`
See :download:`this example script <_static/arc_loader.js>`




Prepare project tree
--------------------


Create HTML
-----------


Create 


Run compiler
============



How to write your own JavaScript driver
=======================================

How to use in your JavaScript application
=========================================

Case1: A little game in your webpage
====================================

Case2: web server
=================
