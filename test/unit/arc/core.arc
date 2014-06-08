(ns (defns tests.arc.core :import arc.unit))

(desc "fundamental"

  (test "eval"
    (iso
      (eval '(+ 1 2 3))                   6
      (eval '(eval '(+ 1 2 3)))           6
      (eval '(eval '(eval '(+ 1 2 3))))   6
      (eval '(eval '(eval '(eval '(+ 1 2 3))))) 6))

  (test "exact"
    (iso
      (exact 1)                           t
      (exact 1.2)                         nil
      (exact 10)                          t
      (exact 2.45)                        nil
      (exact 'a)                          nil))

  (test "compose"
    (iso
      ((compose car cdr) '(a b))          'b))

  (test "assoc"
    (iso
      (assoc 'a '((b a) (c d) (a b)))     '(a b)
      (assoc 'x '((a b) (2 10) ("x" y)))  nil))

  (test "alref"
    (iso
      (alref '((b a) (c d) (a b)) 'a)     'b
      (alref '((a b) (2 10) ("x" y)) 'x)  nil))

  (test "join"
    (iso
      (join '(a b) nil '(c d))            '(a b c d)
      (join nil)                          nil
      (join)                              nil))

  (test "isnt"
    (iso
      (isnt 'a 'b)                        t
      (isnt 'a 'a)                        nil))

  (test "alist"
    (iso
      (alist nil)                         t
      (alist '(x))                        t
      (alist '(a . b))                    t
      (alist "ab")                        nil))

  (test "ret"
    (iso
      (ret v (+ 1 2) (+ v 3 4 5))         3))

  (test "in"
    (iso
      (in (car '(x y)) 'a 'b 'x)          t
      (in (car '(x y)) 'a 'b 'c)          nil))

  (test "iso"
    (iso
      (iso 'a 'b)                         nil
      (iso 'a 'a)                         t
      (iso '(a) '(a))                     t
      (iso '(a) '(a b))                   nil))

  (test "when / unless"
    (is
      (when t (+ 1 2) (+ 3 4) 5)          5
      (when nil (+ 1 2) (+ 3 4) 5)        nil
      (unless nil (+ 1 2) 3)              3
      (unless t (+ 1 2) 3)                nil))

  (test "while"
    (iso
      (with (lis nil x 0)
        (while (< x 3)
               (assign lis (cons x lis))
               (assign x (+ x 1)))
        lis)                              '(2 1 0)))

  (test "reclist"
    (iso
      (reclist idfn '(1 2 3))             '(1 2 3)
      (reclist car '(nil nil 3))          3
      (reclist car '(1 2 3))              1))

  (test "recstring"
    (iso
      (with (lis nil str "abc")
        (recstring
          (fn (i) (assign lis (cons (str i) lis)) nil)
          str)
        lis)                              '(#\c #\b #\a)))

  (test "testify"
    (iso
      (if ((testify '(1)) '(1)) 'a 'b)    'a
      (if ((testify is) 'a 'b) 'x 'y)     'y))

  (test "carif"
    (iso
      (carif 'a)                          'a
      (carif '(x y))                      'x))

  (test "some"
    (iso
      (some 'x '(1 2 3 x y z))            t
      (some arc.math::even '(1 2 3))      t
      (some arc.math::odd '(2 4 6))       nil
      (some #\a "hogehage")               t))

  (test "all"
    (iso
      (all 'a '(a a a a))                 t
      (all 'a '(a b c d))                 nil
      (all 'a '(a a a b))                 nil
      (all 'a nil)                        t
      (all #\a "aaaa")                    t
      (all #\a "aaab")                    nil
      (all #\a "")                        t))

  (test "mem"
    (iso
      (mem 'x '(a b c))                   nil
      (mem 'b '(a b c))                   '(b c)
      (mem nil '(a nil c))                '(nil c)))

  (test "find"
    (iso
      (find 'abc '(def ghi jkl abc))      'abc
      (find 'abc '(xxx yyy zzz))          nil
      (find arc.math::odd  '(2 4 6 8 9))  9
      (find arc.math::even '(3 1 5))      nil))

  (test "map"
    (iso
      (map (fn (a b c) (+ a b c)) "abc" "def" "ghi") "adgbehcfi"))

  (test "mappend"
    (iso
      (mappend idfn '((a) (b) (c)))       '(a b c)))

  (test "firstn"
    (iso
      (firstn 10 nil)                     nil
      (firstn 3 '(1 2 3 4 5))             '(1 2 3)))

  (test "lastn"
    (iso
      (lastn 1 '(1 2 3))                  '(3)
      (lastn 10 nil)                      nil))

  (test "lastcons"
    :ns arc.collection
    (iso
      (lastcons '(1 2 3))                 '(3)
      (lastcons nil)                      nil
      (lastcons '(1 . 2))                 '(1 . 2)
      (lastcons '(1 2 . 3))               '(2 . 3)
      ))

  (test "nthcdr"
    (iso
      (nthcdr 3 '(1 2 3 4 5))             '(4 5)
      (nthcdr 10 '(1 2 3))                nil
      (nthcdr 1 nil)                      nil
      (nthcdr -10 '(1 2 3))               '(1 2 3)))

  (test "tuples"
    (iso
      (tuples '(1 2 3))                   '((1 2) (3))
      (tuples '(1 2 3) 3)                 '((1 2 3))
      (tuples '(1 2 3 4) 3)               '((1 2 3) (4))
      (tuples nil 1000)                   nil))

  (test "defs"
    (iso
      (do1 nil
           (defs a (x) (+ x x)
                 b (x) (- x x)))          nil
      (a 10)                              20
      (b 10)                              0))

  (test "caris"
    (iso
      (caris 'x 'x)                       nil
      (caris '(x) 'x)                     t
      (caris nil 'x)                      nil))

  (desc "anaphoras"

    (test "iflet"
      (iso
        (let s '(nil nil 1) (iflet x (s 0) (+ x 1) (s 1) (+ x 1) (s 2) (+ x 1))) 2))

    (test "whenlet"
      (iso
        (whenlet x 1 (+ x x))                                                  2))

    (test "aif"
      (iso
        (aif (+ 1 1) (+ it it) nil)                                            4))

    (test "awhen"
      (iso
        (awhen (+ 1 1) it)                                                     2))

    (test "aand"
      (iso
        (aand (+ 1 1) (+ 1 it) (+ 1 it))                                       4
        (aand (+ 1 1) (+ 1 it) (+ 1 it) (is it 10))                            nil))

    (test "accum"
      (iso
        (accum acc (for i 0 5 (acc i)))                                       '(0 1 2 3 4 5)))

    (test "drain"
      (iso
        (let x 256 (drain (= x (/ x 2)) 1))                                   '(128 64 32 16 8 4 2)))

    (test "whilet"
      (iso
        (with (s '(1 2 3) r nil) (whilet x s (push x r) (= s (cdr x))) r)      '((3) (2 3) (1 2 3)))))


  (desc "iter-collections"

    (test "loop"
      (iso
        (let l nil (loop (= x 0) (< x 3) (= x (+ x 1)) (= l (cons x l))) l)   '(2 1 0)))

    (test "for"
      (iso
        (let l nil (for x 2.5 4.0 (= l (cons x l))) l)                        '(4.5 3.5 2.5)))

    (test "down"
      (iso
        (let l nil (down x 4.0 2.5 (= l (cons x l))) l)                       '(2 3 4)))

    (test "repeat"
      (iso
        (let x 1 (repeat 10 (= x (+ x x))) x)                                 1024))

    (test "forlen"
      (iso
        (with (x '(a b c) a "") (forlen i x (= a (+ (x i) "-" a))) a)         "c-b-a-"
        (with (x "abcd" a "") (forlen i x (= a (+ (x i) "-" a))) a)           "d-c-b-a-"))

    (test "walk"
      (iso
        (let l nil (walk '(1 2 3) [= l (cons (+ _ 1) l)]) (nrev l))           '(2 3 4)
        (with (l nil s "smihica") (walk s [= l (cons _ l)]) (nrev l))         '(#\s #\m #\i #\h #\i #\c #\a)))

    (test "each"
      (iso
        (with (l nil s "smihica") (each iter s (= l (cons iter l))) (nrev l)) '(#\s #\m #\i #\h #\i #\c #\a)))

    (test "push"
      (iso
        (let s '(1 2 3) (push 0 s) s)                                         '(0 1 2 3)))

    (test "swap"
      (iso
        (let s '(1 2 3) (swap (s 0) (s 2)) s)                                 '(3 2 1)))

    (test "rotate"
      (iso
        (let s '(1 2 3) (rotate (s 0) (s 1) (s 2)) s)                         '(2 3 1)))

    (test "pop"
      (iso
        (let s '(1 2 3) (list (pop s) s))                                     '(1 (2 3))))

    (test "on"
      (iso
        (let s nil (on x '(1 2 3) (push (list index x) s)) s)                 '((2 3) (1 2) (0 1))
        (let s nil (on x "abc"    (push (list index x) s)) s)                 '((2 #\c) (1 #\b) (0 #\a))))
    )

  ;;;;
  (desc "set-functions"

    (test "adjoin"
      (iso
        (adjoin 'x '(a b c))                                                  '(x a b c)
        (adjoin 'x '(a b c x))                                                '(a b c x)
        (adjoin '(a b c) '((d e f) g))                                        '((a b c) (d e f) g)
        (adjoin '(a b c) '((d e f) g (a b c)))                                '((d e f) g (a b c))
        (adjoin 'a nil)                                                       '(a)))

    (test "pushnew"
      (iso
        (let s '(a b c) (pushnew 'd s) s)                                     '(d a b c)
        (let s '(a b c) (pushnew 'b s) s)                                     '(a b c)
        (let s '((a) (b) (c)) (pushnew '(b) s is) s)                          '((b) (a) (b) (c))))

    (test "pull"
      (iso
        (let s '(a b c) (pull 'b s) s)                                        '(a c)
        (let s '(a b c) (pull 'x s) s)                                        '(a b c)))

    (test "togglemem"
      (iso
        (let s '(a b c) (togglemem 'x s) s)                                   '(x a b c)
        (let s '(a b c) (togglemem 'a s) s)                                   '(b c))))

  (desc "replace-macros"

    (test "++"
      (iso
        (let x '(0) (++ (car x)) x)                                           '(1)
        (with (x 0 y '(1 2)) (++ x) (++ x) (++ (cadr y)) (++ (cadr y)) (list x y)) '(2 (1 4))))

    (test "--"
      (iso
        (let x '(1) (-- (car x)) x)                                           '(0)))

    (test "zap"
      (iso
        (let x 1 (zap + x 1) (zap + x 1) x)                                   3
        (let x '(1) (zap + (car x) 1) (zap + (car x) 1) x)                   '(3)))

    (test "wipe"
      (iso
        (do (wipe x y z) (list x y z))                                       '(nil nil nil)))

    (test "set"
      (iso
        (do (set x y z) (list x y z))                                        '(t t t))))

  ;;;;;
  (desc "primitives"

    (test "nconc"
      :ns arc.collection
      (iso
        (nconc '(1 2 3) '(2 3 4))                                             '(1 2 3 2 3 4)
        (with (x '(1 2 3) y '(4 5 6)) (list (is (nconc x y) x) x))            '(t (1 2 3 4 5 6))
        (nconc '(1 2) nil '(3 4))                                             '(1 2 3 4)
        (nconc nil)                                                           nil
        (nconc nil nil nil)                                                   nil
        (nconc)                                                               nil
        (nconc nil '(1 2))                                                    '(1 2)
        (nconc nil '(1 2) nil '(3 4))                                         '(1 2 3 4)
        (with (x '(1) y '(2) z '(3)) (list (nconc nil x nil y nil z) x y z))  '((1 2 3) (1 2 3) (2 3) (3))))

    (test "flat"
      (iso
        (flat '(1 2 (3 4 nil (5 6 7) ((8))) 9))                               '(1 2 3 4 5 6 7 8 9)
        (flat '(1 2 (3 4 nil (5 6 7) ((8))) 9) 10)                            '(1 2 3 4 5 6 7 8 9)
        (flat '(1 2 (3 4 nil (5 6 7) ((8))) 9) 3)                             '(1 2 3 4 5 6 7 8 9)
        (flat '(1 2 (3 4 nil (5 6 7) ((8))) 9) 2)                             '(1 2 3 4 5 6 7 (8) 9)
        (flat '(1 2 (3 4 nil (5 6 7) ((8))) 9) 1)                             '(1 2 3 4 nil (5 6 7) ((8)) 9)
        (flat '(1 2 (3 4 nil (5 6 7) ((8))) 9) 0)                             '(1 2 (3 4 nil (5 6 7) ((8))) 9)
        (flat '(nil 1 2 nil 3 ((nil))))                                       '(1 2 3)
        (flat '((((((nil)))))))                                               nil
        (flat nil)                                                            nil
        (flat 'a)                                                             '(a)))

    (test "rand-string"
      (iso
        :f [no (no _)]
        (match #/^[A-Za-z0-9]{10}$/ (rand-string 10))                         t
        (match #/^[abc]{10}$/ (rand-string 10 "abc"))                         t)
      (is
        (rand-string 0)                                                       "")))

  (desc "sorts"

    (test "best"
      (iso
        (best > '(3 1 5 2 4))                                 5))

    (test "most"
      (iso
        (most len '("hoge" "fuga" "moemoe"))                  "moemoe"))

    (test "insert-sorted"
      (iso
        (insert-sorted > 5 '(10 3 1))                         '(10 5 3 1)
        (insert-sorted > 5 '(10 5 1))                         '(10 5 5 1)))

    (test "insort"
      (iso
        (let x '(2 4 6) (insort < 3 x) x)                     '(2 3 4 6)))

    (test "reinsert-sorted"
      (iso
        (reinsert-sorted > 5 '(10 3 1))                       '(10 5 3 1)
        (reinsert-sorted > 5 '(10 5 1))                       '(10 5 1)))

    (test "insertnew"
      (iso
        (let x '(2 4 6) (insortnew < 3 x) x)                  '(2 3 4 6))))


  ;; defs
  ;; warn     ;; todo support (write x)
  ;; atomic   ;; todo support thread
  ;; atlet
  ;; atwith

  (test "="
    (iso
      (let x (list 10) (= (car x) (+ (car x) 1)) x)      '(11)
      (let x '((10 (11 . 12))) (= (cdr (cadar x)) '(12 . nil)) x) '((10 (11 12)))
      (let x '((10)) (= (caar x) (+ (caar x) 1)) x)      '((11))
      (let x (table) (= (x 'k) 'v) (x 'k))               'v
      (let x (table) (= x!k 'v) (x 'k))                  'v
      (let x (table) (= (x 'k) 'v (x 'k2) 'v2) (x 'k2))  'v2
      (let x 1 (= x 2) x)                                2))


  )