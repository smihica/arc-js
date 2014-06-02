(ns (defns tests.arc.ns :import arc.unit))

(desc "namespace"

  (test "bound"
    (do (defns A))
    (is :ns A
        (assign x 1) 1
        (bound 'x)   t)
    (is :ns user
        (bound 'x)   nil))

  (test "shadowing"
    (do (defns A))
    (is :ns A
        (assign x 1)            1
        (bound 'x)              t)
    (do (defns B))
    (is :ns B
        (assign x 2)            2)
    (do (defns C))
    (is :ns C
        (assign x 3)            3)
    (do (defns D :import A B C))
    (is :ns D
        x                       3)
    (is :ns C
        x                       3)
    (is :ns B
        x                       2)
    (is :ns A
        x                       1)
    (is :ns user
        (bound 'x)              nil))

  (test "global"
    (do (defns A))
    (is :ns A
        (assign X 10)           10
        (assign ***X*** 20)     20
        X                       10
        ***X***                 20)
    (do (ns 'user))
    (is :ns user
        (bound 'X)              nil
        (bound '***X***)        t
        ***X***                 20
        (assign ***X*** 30)     30
        ***X***                 30)
    (do (ns 'A))
    (is :ns A
        ***X***                 30))

  (test "***curr-ns***"
    (do (defns A)
        (do (ns 'A) (def x () (***curr-ns***))))
    (is :ns A
        (is (x) (ns 'A))        t)
    (do (defns B :import A))
    (is :ns B
        (is (x) (ns 'B))        t))

  (test "***macro***"
    (do (do (ns 'user)
            (mac m (a b) `(- ,a ,b)))
        (do (ns (defns A))
            (mac m (a b) `(+ ,a ,b))))
    (is :ns A
        (m 10 20)               30)
    (is :ns user
        (m 10 20)               -10))

  (test "export and :: syntax"
    (do (do (ns (defns A :export a b))
            (= a 10 b 20 c 30))
        (defns B :import A :export c))
    (is :ns B
        a                       10
        b                       20
        (bound 'c)              nil
        A::c                    30
        (= c 40)                40
        c                       40
        B::c                    40)
    (do (defns C :import A B))
    (is :ns C
        a                       10
        b                       20
        c                       40
        A::c                    30))

  (desc "extend"

    (test "basic"
      (do
        (do (ns (defns A :export a b))
            (= a 10 b 20 c 30)
            (ns (defns B :import A))
            (= d 40 f 50)))
      (is :ns B
          a                       10
          b                       20
          (bound 'c)              nil
          A::c                    30))

    (test "can access parent's import"
      (do (defns C :extend B))
      (is :ns C
          a                       10
          b                       20
          (bound 'c)              nil))

    (test "can access parent's private"
      (do (do (ns (defns D :extend A))
              (= dd 10 ff 20)))
      (is :ns D
          a                       10
          b                       20
          (bound 'c)              t
          c                       30
          D::c                    30))

    (test "parent not-all -> me all"
      (do (defns E :import D))
      (is :ns E
          a                       10
          b                       20
          (bound 'c)              nil
          dd                      10
          ff                      20))

    (test "parent not-all -> me not-all"
      (do (defns F :extend A :export c))
      (is :ns F
          a                       10
          b                       20
          c                       30)
      (do (defns G :import F))
      (is :ns G
          a                       10
          b                       20
          (bound 'c)              nil)

      ;; even if the ns export the var,
      ;; it doesn't export extended private var automatically.
      ;; if you want to do this.

      ;; define c in itself as extended private c.
      (do (do (ns 'F) (= c c)))

      (is :ns G
          c                       30))

    (test "parent all -> me all"
      (do (do (ns (defns H :extend B))
              (= g 60)))
      (is :ns H
          (bound 'c)              nil
          a                       10
          b                       20
          f                       50)
      (do (defns I :import H))
      (is :ns I
          (bound 'a)              nil
          (bound 'b)              nil
          d                       40
          f                       50
          g                       60))

    (test "parent all -> me not-all"
      (do (do (ns (defns J :extend B :export g))
              (= g 60 h 70))
          (defns K :import J))
      (is :ns K
          g                       60
          (bound 'h)              nil
          (bound 'a)              nil
          (bound 'b)              nil
          d                       40
          f                       50
          g                       60
          (bound 'h)              nil)))

  (test "deftf"
    (do (do (ns (defns A))
            (deftf string (str n) (+ str n))))
    (is :ns A
        ("abc" "def")             "abcdef")
    (do (do (ns (defns B))
            (deftf string (str n) (ref str (* n 2)))))
    (is :ns B
        ("abcd" 1)                #\c)
    (is :ns A
        ("abc" 1)                 "abc1")
    (is :ns B
        ("abc" 1)                 #\c)
    (is :ns user
        ("abc" 1)                 #\b))

  (test "defss"
    (do (do (ns (defns A :export test-ss))
            (defss test-ss #/^(\d+)\.\.\.(\d+)$/ (start end)
                   `(range ,start ,end))
            (defss test-ss-2 #/^(\d+)%(\d+)$/ (x y)
                   `(arc.math::mod ,x ,y))))
    (iso :ns A
         10...20                  '(10 11 12 13 14 15 16 17 18 19 20)
         10%3                     1)

    (do (do (ns (defns B :import A))))

    (iso :ns B
         1...10                   '(1 2 3 4 5 6 7 8 9 10)
         (macex '10%3)            '10%3))

  (test "redef"
    (do (do (ns (defns A :export a))
            (def a () 10)
            (def b () (a))))
    (is :ns A
        (b)                       10
        (do (def a () 20)
            (b))                  20)
    (do (do (ns (defns B :import A))
            (def c () (a))))
    (is :ns B
        (c)                       20)
    (do (do (ns 'A)
            (def a () 30)))
    (is :ns B
        (c)                       30))

  )



