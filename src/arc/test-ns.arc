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
     (prn "--- PASSED_ALL ---")
     nil))

(unit-tests

  ;; bound
  (defns A)                  nil
  (ns A)                     nil
  (assign x 1)               1
  (bound 'x)                 t
  (ns user)                  nil
  (bound 'x)                 nil

  ;; shadowing
  (defns A)                  nil
  (ns A)                     nil
  (assign x 1)               1
  (bound 'x)                 t
  (defns B)                  nil
  (ns B)                     nil
  (assign x 2)               2
  (defns C)                  nil
  (ns C)                     nil
  (assign x 3)               3
  (defns D :import A B C)    nil
  (ns D)                     nil
  x                          3
  (ns C)                     nil
  x                          3
  (ns B)                     nil
  x                          2
  (ns A)                     nil
  x                          1
  (ns user)                  nil
  (bound 'x)                 nil

  ;; global
  (defns A)                  nil
  (ns A)                     nil
  (assign X 10)              10
  (assign ***X*** 20)        20
  X                          10
  ***X***                    20
  (ns user)                  nil
  (bound 'X)                 nil
  (bound '***X***)           t
  ***X***                    20
  (assign ***X*** 30)        30
  ***X***                    30
  (ns A)                     nil
  ***X***                    30
)