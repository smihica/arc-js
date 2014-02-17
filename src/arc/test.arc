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
  ;(while t )
  (reclist idfn '(1 2 3))             '(1 2 3)
  (reclist car '(nil nil 3))          3
  (reclist car '(1 2 3))              1
  ; (recstring (fn (x) (prn x) nil) "abc") nil
  (if ((testify '(1)) '(1)) 'a 'b)    'a
  (if ((testify is) 'a 'b) 'x 'y)     'y
  (carif 'a)                          'a
  (carif '(x y))                      'x
  (some 'x '(1 2 3 x y z))            t
  (some even '(1 2 3))                t
  (some odd '(2 4 6))                 nil
  ;; (some "a" "hogehage")            t ;; todo support object default functions.
  ;; (some "hage" "hogehage")         nil ;; but this should be able to do.
  (all 'a '(a a a a))                 t
  (all 'a '(a b c d))                 nil
  (all 'a '(a a a b))                 nil
  (mem 'x '(a b c))                   nil
  (mem 'b '(a b c))                   '(b c)
  (mem nil '(a nil c))                '(nil c)
  (find 'abc '(def ghi jkl abc))      'abc
  (find 'abc '(xxx yyy zzz))          nil
  (find odd  '(2 4 6 8 9))            9
  (find even '(3 1 5))                nil
  ;; map
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
  
  )