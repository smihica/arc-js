---
layout: default
title: Arc.js
---

## Arc.js
This is an Arc-language interpreter written in JavaScript.

## Features

- Stack based vm
- Self-hosting compiler
- First-class continuations
- Tail call optimization
- mac macro
- almost of [anarki](https://github.com/arclanguage/anarki)'s functions.
- user tagged objects (annotate)
- defgeneric (object system)
- complex-args
- regexp (#/exp/)
- special syntax (:~.!)
- user defined special syntax (defss)
- user difined type function (deftf)
- REPL
- stack-tracer

## How to install (on your machine)

You have to install nodejs and npm first.

    $ sudo npm install arc-js

Then, You can run REPL.

    $ arcjs
    arc> (pr 'hello-world)
    hello-world
    hello-world
    arc> (+ 1 2)
    3
    arc> (def average (x y) (/ (+ x y) 2))
    #<fn:average>
    arc> (average 2 4)
    3

## How to use in your web-site

### 1. Basic interface
In the HTML '<head>'
{% highlight html %}
<script type="text/javascript" src="arc.min.js"></script>
{% endhighlight %}
Then, You can run arc-language in your javascript.
{% highlight javascript %}
var arc_runner = ArcJS.context();
var res = arc_runner.evaluate("(+ 1 2 3 4)");
console.log(res); // 10
// FizzBuzz
var code = [
 "(prn 'Start_FizzBuzz)",
 "(for n 1 100",
 "  (prn (case (gcd n 15)",
 "         1 n",
 "         3 'Fizz",
 "         5 'Buzz",
 "         'FizzBuzz)))"].join("\n");
arc_runner.evaluate(code);  // 1, 2, Fizz ...
{% endhighlight %}
[Demo Page](demo_01.html)

### 2. Auto loading interface
In the HTML '<head>'
{% highlight html %}
<script type="text/javascript" src="arc.min.js"></script>
<!-- jQuery is required in arc-loader.js -->
<script type="text/javascript" src="jquery.min.js"></script>
<script type="text/javascript" src="arc-loader.js"></script>
{% endhighlight %}
Then, You can load arc files as follows.
{% highlight html %}
<script type="text/arc" src="fizzbuzz.arc"></script>
{% endhighlight %}
__fizzbuzz.arc__
{% highlight clojure %}
(def fizzbuzz (limit)
  (for x 1 limit
    (prn
      (aif (mappend [if (is 0 (mod x car._)) cdr._] '((3 Fizz) (5 Buzz)))
           (string it)
           x))))
{% endhighlight %}
Then you can do following
{% highlight html %}
<script type="text/arc">
(fizzbuzz 3)
(fizzbuzz 100)
</script>
{% endhighlight %}
[Demo Page](demo_02.html)

## Other demos

- [REPL](http://smihica.com/arc-js/demo/repl.html)
- [stack visualizer](http://smihica.com/arc-js/demo/stack_visualizer.html)

## test

- [test runner](http://smihica.com/arc-js/test/unit.html)
- [compiling compiler](http://smihica.com/arc-js/test/compiling-compiler.html)

## referred to

- [Arc Language](http://arclanguage.github.io/)
- [anarki](https://github.com/arclanguage/anarki)
- [3imp.pdf](http://www.cs.indiana.edu/~dyb/papers/3imp.pdf)
- [biwascheme](http://www.biwascheme.org/)

## License

- MIT License
