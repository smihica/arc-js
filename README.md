### ArcJS

__An Arc-langugage compiler and VM-interpreter written in JavaScript__

Arc-language can run both on nodejs and on a web-site.
You can get more information from the [web site](http://smihica.github.io/arc-js/).

A lot of inspired from Paul Graham version of [Arc](http://arclanguage.org/) and [Anarki](https://github.com/arclanguage/anarki)

### Demo (work in a web-site)

- Demo1: [Maze generator](http://smihica.github.io/arc-js/demo_mg.html)

### How to make

#### install Node.js

    $ sudo port install nodejs

#### install uglifyjs

    $ sudo npm install -g uglify-js

#### make ArcJS

    $ make

### How to run tests

    $ make test

### How to run repl

    $ ./bin/arcjs
    arc> (+ 1 2 3)
    6
    arc> (for n 1 100
           (prn (case (gcd n 15)
                  1 n
                  3 'Fizz
                  5 'Buzz
                  'FizzBuzz)))
    1
    2
    Fizz
    ...
    arc> (def average (x y) (/ (+ x y) 2))
    #<fn:average>
    arc> (average 2 4)
    3

Try Arc's [tutorial](http://ycombinator.com/arc/tut.txt)

### How to run scripts

    $ echo "(prn (gcd 33 77))" > test.arc
    $ ./bin/arcjs -r test.arc
    11

### How to run repl with loading some scripts

    $ echo "(def average (x y) (/ (+ x y) 2))" > avg.arc
    $ ./bin/arcjs avg.arc
    arc> (average 10 20)
    15

### How to run compiler

    $ echo "(def average (x y) (/ (+ x y) 2))" > avg.arc
    $ ./bin/arcjsc -o avg.js.fasl avg.arc
    $ cat avg.js.fasl
    // This is an auto generated file.
    // Compiled from ['avg.arc'].
    // DON'T EDIT !!!
    preloads.push([
    [12,7,14,20,0,1,0,20,2,-1,0,10,9,1, ...
    ]);
    preload_vals.push(["2","+","/", ...
    $

### License

    # ArcJS

    Copyright (c) 2012 Shin Aoyama
    -----------------
    Perl Foundations's Artistic License 2.0

    # Arc language

    Copyright (c) Paul Graham
    Copyright (c) Robert Morris
    -----------------
    Perl Foundations's Artistic License 2.0

    # Anarki

    Copyright (c) Paul Graham
    Copyright (c) Robert Morris
    Copyright (c) A lot of contributors (see https://github.com/arclanguage/anarki/graphs/contributors)
    -----------------
    Perl Foundations's Artistic License 2.0
