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

  ;; extend
  (do (ns (defns A :export a b)) 
      (= a 10)
      (= b 20)
      (= c 30)
      (ns (defns B :import A))
      (= d 40)
      (= f 50)
      a)     10
  b          20
  (bound 'c) nil
  A::c       30

  (do (ns (defns C :extend B)) ;; can access parent's import
      a)     10
  b          20
  (bound 'c) nil

  (do (ns (defns D :extend A)) ;; can access parent's private
      (= dd  10)
      (= ff  20)
      a)     10
  b          20
  (bound 'c) t
  c          30
  D::c       30

  (do (ns (defns E :import D)) ;; parent not-all -> me all
      a)     10
  b          20
  (bound 'c) nil
  dd         10
  ff         20

  (do (ns (defns F :extend A :export c)) ;; parent not-all -> me not-all
      a)     10
  b          20
  c          30
  (do (ns (defns G :import F))
      a)     10
  b          20
  (bound 'c) nil
  ;; even if the ns export the var,
  ;; it doesn't export extended private var automatically.
  ;; if you want to do this.
  (do (ns 'F)
      (= c c)) 30 ;; define c in itself as extended private c.
  (do (ns 'G)
      c)       30

  (do (ns (defns H :extend B)) ;; parent all -> me all
      (= g 60)
      (bound 'c)) nil
  a          10
  f          50
  (do (ns (defns I :import H))
      (bound 'a)) nil
  (bound 'b) nil
  d          40
  f          50
  g          60

  (do (ns (defns J :extend B :export g)) ;; parent all -> me not-all
      (= g 60)
      (= h 70)) 70
  (do (ns (defns K :import J))
      g) 60
  (bound 'h) nil
  (bound 'a) nil
  (bound 'b) nil
  d          40
  f          50
  g          60
  (bound 'h) nil

  ;; deftf
  (do (ns (defns A))
      (deftf string (str n) (+ str n))
      ("abc" "def"))       "abcdef"

  (do (ns (defns B))
      (deftf string (str n) (ref str (* n 2)))
      ("abcd" 1))          #\c

  (do (ns 'A) ("abc" 1))   "abc1"
  (do (ns 'B) ("abc" 1))    #\c
  (do (ns 'user) ("abc" 1)) #\b

  ;; defss
  (do (ns (defns A :export test-ss))
      (defss test-ss #/^(\d+)\.\.\.(\d+)$/ (start end)
             `(range ,start ,end))
      (defss test-ss-2 #/^(\d+)%(\d+)$/ (x y)
             `(mod ,x ,y))
      (car (macex '10...20)))    'range
  (car (macex '10%3))            'mod
  (do (ns (defns B :import A))
      (car (macex '1...10)))     'range
  (macex '10%3)                  '10%3

  )