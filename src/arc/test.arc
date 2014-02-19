(mac unit-tests exps
  `(do
     ,@(map1
         (fn (pair)
           (with (exp car.pair res cadr.pair)
             (w/uniq (sexp sres)
               `(with (,sexp ,exp ,sres ,res)
                  (if (no (iso ,sexp ,sres))
                      (err ',exp "is expected to"
                           ',res "but"
                           ,sexp "returned")
                      (prn "OK ... " ',exp))))))
         (pair exps))
     (prn "PASSED ALL TESTS.")))

(unit-tests
  (exact 1)                           t
  (exact 1.2)                         nil
  (exact 10)                          t
  (exact 2.45)                        nil
  (exact 'a)                          nil
  ((compose car cdr) '(a b))          'b
  (assoc 'a '((b a) (c d) (a b)))     '(a b)
  (assoc 'x '((a b) (2 10) ("x" y)))  nil
  (alref '((b a) (c d) (a b)) 'a)     'b
  (alref '((a b) (2 10) ("x" y)) 'x)  nil
  (join '(a b) nil '(c d))            '(a b c d)
  (join nil)                          nil
  (join)                              nil
  (isnt 'a 'b)                        t
  (isnt 'a 'a)                        nil
  (alist nil)                         t
  (alist '(x))                        t
  (alist '(a . b))                    t
  (alist "ab")                        nil
  (ret v (+ 1 2) (+ v 3 4 5))         3
  (in (car '(x y)) 'a 'b 'x)          t
  (in (car '(x y)) 'a 'b 'c)          nil
  (iso 'a 'b)                         nil
  (iso 'a 'a)                         t
  (iso '(a) '(a))                     t
  (iso '(a) '(a b))                   nil
  (when t (+ 1 2) (+ 3 4) 5)          5
  (when nil (+ 1 2) (+ 3 4) 5)        nil
  (unless nil (+ 1 2) 3)              3
  (unless t (+ 1 2) 3)                nil
  (with (lis nil x 0)
    (while (< x 3)
           (assign lis (cons x lis))
           (assign x (+ x 1)))
    lis)                              '(2 1 0)
  (reclist idfn '(1 2 3))             '(1 2 3)
  (reclist car '(nil nil 3))          3
  (reclist car '(1 2 3))              1
  (with (lis nil str "abc")
    (recstring
      (fn (i) (assign lis (cons (str i) lis)) nil)
      str)
    lis)                              '(#\c #\b #\a)
  (if ((testify '(1)) '(1)) 'a 'b)    'a
  (if ((testify is) 'a 'b) 'x 'y)     'y
  (carif 'a)                          'a
  (carif '(x y))                      'x
  (some 'x '(1 2 3 x y z))            t
  (some even '(1 2 3))                t
  (some odd '(2 4 6))                 nil
  (some #\a "hogehage")               t
  (all 'a '(a a a a))                 t
  (all 'a '(a b c d))                 nil
  (all 'a '(a a a b))                 nil
  (all 'a nil)                        t
  (all #\a "aaaa")                    t
  (all #\a "aaab")                    nil
  (all #\a "")                        t
  (mem 'x '(a b c))                   nil
  (mem 'b '(a b c))                   '(b c)
  (mem nil '(a nil c))                '(nil c)
  (find 'abc '(def ghi jkl abc))      'abc
  (find 'abc '(xxx yyy zzz))          nil
  (find odd  '(2 4 6 8 9))            9
  (find even '(3 1 5))                nil
  ;; map
  (map (fn (a b c) (list a b c)) "abc" "def" "ghi") "adgbehcfi"
  ;; mappend
  ;; firstn
  (lastn 1 '(1 2 3))                  '(3)
  (lastn 10 nil)                      nil
  ;; nthcdr
  (lastcons '(1 2 3))                 '(3)
  (lastcons nil)                      nil
  (lastcons '(1 . 2))                 '(1 . 2)
  (lastcons '(1 2 . 3))               '(2 . 3)
  (tuples '(1 2 3))                   '((1 2) (3))
  (tuples '(1 2 3) 3)                 '((1 2 3))
  (tuples '(1 2 3 4) 3)               '((1 2 3) (4))
  (tuples nil 1000)                   nil
  ;; defs
  (caris 'x 'x)                       nil
  (caris '(x) 'x)                     t
  (caris nil 'x)                      nil
  ;; warn     ;; todo support (write x)
  ;; atomic   ;; todo support thread
  ;; atlet
  ;; atwith
  ;; =
  (let x (list 10) (= (car x) (+ (car x) 1)) x) '(11)
  (let x '((10 (11 . 12))) (= (cdr (cadar x)) '(12 . nil)) x) '((10 (11 12)))
  (let x '((10)) (= (caar x) (+ (caar x) 1)) x) '((11))
  (let x (table) (= (x 'k) 'v) (x 'k)) 'v
  (let x (table) (= (x 'k) 'v (x 'k2) 'v2) (x 'k2)) 'v2
  (let x 1 (= x 2) x) 2
  ;; iters
  (let l nil (loop (= x 0) (< x 3) (= x (+ x 1)) (= l (cons x l))) l) '(2 1 0)
  (let l nil (for x 2.5 4.0 (= l (cons x l))) l) '(4.5 3.5 2.5)
  (let l nil (down x 4.0 2.5 (= l (cons x l))) l) '(2 3 4)
  (let x 1 (repeat 10 (= x (+ x x))) x) 1024
  (with (x '(a b c) a "") (forlen i x (= a (+ (x i) "-" a))) a) "c-b-a-"
  (with (x "abcd" a "") (forlen i x (= a (+ (x i) "-" a))) a) "d-c-b-a-"
  (let l nil (walk '(1 2 3) [= l (cons (+ _ 1) l)]) (nrev l)) '(2 3 4)
  (with (l nil s "smihica") (walk s [= l (cons _ l)]) (nrev l)) '(#\s #\m #\i #\h #\i #\c #\a)
  (with (l nil s "smihica") (each iter s (= l (cons iter l))) (nrev l)) '(#\s #\m #\i #\h #\i #\c #\a)
  (let s '(1 2 3) (push 0 s) s) '(0 1 2 3)
  (let s '(1 2 3) (swap (s 0) (s 2)) s) '(3 2 1)
  (let s '(1 2 3) (rotate (s 0) (s 1) (s 2)) s) '(2 3 1)
  (let s '(1 2 3) (list (pop s) s)) '(1 (2 3))

  )