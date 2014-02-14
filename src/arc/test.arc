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
                           ,sexp "returned"))))))
         (pair exps))))

(unit-tests
  (exact 1)                           t
  (exact 1.2)                         nil
  ((compose car cdr) '(a b))          'b
  (assoc 'a '((b a) (c d) (a b)))     '(a b)
  (assoc 'x '((a b) (2 10) ("x" y)))  nil
  (alref 'a '((b a) (c d) (a b)))     'b
  (alref 'x '((a b) (2 10) ("x" y)))  nil
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
  (unless nil (+ 1 2) 3)              3)