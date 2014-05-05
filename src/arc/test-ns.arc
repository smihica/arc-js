(mac unit-tests exps
  `(do
     ,@(map1
         (fn (pair)
           (with (exp (car pair) res (cadr pair))
             (w/uniq (sexp sres)
               `(with (,sexp ,exp ,sres ,res)
                  (if (no (is ,sexp ,sres))
                      (err ',exp "is expected to"
                           ',res "but"
                           ,sexp "returned")
                      (prn "OK ... " ',exp))))))
         (%pair exps))
     (prn "--- PASSED-ALL ---")
     nil))

(unit-tests

  ;; bound
  (do (defns A)
      (ns 'A)
      (assign x 1))             1
  (bound 'x)                    t
  (do (ns 'user)
      (bound 'x))               nil

  ;; shadowing
  (do (defns A)
      (ns 'A)
      (assign x 1))             1
  (bound 'x)                    t
  (do (defns B)
      (ns 'B)
      (assign x 2))             2
  (do (defns C)
      (ns 'C)
      (assign x 3))             3
  (do (defns D :import A B C)
      (ns 'D)
      x)                        3
  (do (ns 'C)
      x)                        3
  (do (ns 'B)
      x)                        2
  (do (ns 'A)
      x)                        1
  (do (ns 'user)
      (bound 'x))               nil

  ;; global
  (do (defns A)
      (ns 'A)
      (assign X 10))            10
  (assign ***X*** 20)           20
  X                             10
  ***X***                       20
  (do (ns 'user)
      (bound 'X))               nil
  (bound '***X***)              t
  ***X***                       20
  (assign ***X*** 30)           30
  ***X***                       30
  (do (ns 'A)
      ***X***)                  30

  ;; ***curr-ns***
  (do (defns A)
      (ns 'A)
      (do (def x () (***curr-ns***)))
      (is (x) (ns 'A)))         t
  (do (ns 'user)
      (defns B :import A)
      (ns 'B)
      (is (x) (ns 'B)))         t

  ;; ***macro***
  (do (ns 'user)
      (do (mac m (a b) `(- ,a ,b)) nil)
      (ns 'A)
      (do (mac m (a b) `(+ ,a ,b)) nil)
      (car (macex '(m 20 10))))   '+
  (do (ns 'user)
      (car (macex '(m 20 10))))   '-

  ;; export and :: syntax
  (do (ns (defns A :export a b))
      (= a 10)
      (= b 20)
      (= c 30)
      (ns (defns B :import A :export c))
      a) 10
  b 20
  (bound 'c) nil
  A::c       30
  (= c 40)   40
  c          40
  B::c       40
  (do (ns (defns C :import A B))
      a)     10
  b          20
  c          40
  A::c       30

  )