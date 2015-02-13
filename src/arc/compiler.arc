(ns 'arc.compiler)

(export
  ssexpand macex1 macex compile)

(def dotted-to-proper (l)
  (if (no l) nil
      (atom l) (cons l nil)
      (cons (car l) (dotted-to-proper (cdr l)))))

(def dotted-pos (lis)
  ((afn (l n)
     (if (no l) -1
         (atom l) n
         (self (cdr l) (+ n 1))))
   lis 0))

; (def dotted (l) (if (acons l) (dotted (cdr l)) l t))
; (def dottify (l) (if (no (cdr l)) (car l) (cons (car l) (dottify (cdr l)))))
; (def undottify (l) (if (acons l) (cons (car l) (undottify (cdr l))) l (cons l nil)))

(def ssexpand (s)
  (aif (ssyntax s t) it s))

(def macex1 (x)
  (aif (and (is (type x) 'cons) (ref (***macros***) (car x)))
       (apply (rep (indirect it)) (cdr x))
       x))

(def %macex (x e)
  (case (type x)
    cons (reccase
           x
           (quote body `(quote ,@body))
           (fn (vars . body)
             (if (complex-args? vars)
                 (%macex
                   (w/uniq (arg)
                     `(fn ,arg
                        (with ,(complex-args (list vars) (list arg))
                          ,@body)))
                   e)
                 `(fn ,vars
                    ,(if (< (len body) 2)
                         (%macex (car body) (union is (dotted-to-proper vars) e))
                         (%macex `(do ,@body) (union is (dotted-to-proper vars) e))))))
           (with (var-val . body)
             (let var-val (%pair var-val)
               (let vars (map1 car var-val)
                 (if (complex-args? vars)
                     (let vals (map1 cadr var-val)
                       (let uniqs (map1 [uniq] vals)
                         (%macex
                           `(with ,(zip uniqs vals)
                              (with ,(complex-args vars uniqs)
                                ,@body))
                           e)))
                     `(with ,(mappend (fn (p) (list (car p) (%macex (cadr p) e))) var-val)
                        ,(if (< (len body) 2)
                             (%macex (car body) (union is vars e))
                             (%macex `(do ,@body) (union is vars e))))))))
           (aif (let top (car x)
                  (and (is (type top) 'sym)
                       (no (mem top e))
                       (ref (***macros***) top)))
                (%macex
                  (apply (rep (indirect it)) (cdr x)) e)
                (map1 [%macex _ e] x)))

    sym (let expanded (ssexpand x)
          (if (is expanded x)
              x
              (%macex expanded e)))

    x))

(def macex (x . igns) (%macex x igns))

(def %complex-args (args ra)
  (if args
      (case (type args)
        sym  `(,args ,ra)
        cons
        (let x
            (if (and (acons (car args))
                     (is (caar args) 'o))
                `(,(cadar args)
                  (if (acons ,ra) (car ,ra)
                      ,(if (acons (cddar args)) (caddar args))))
                (%complex-args
                  (car args)
                  `(car ,ra)))
          (let v (car x)
            (+ x (%complex-args
                   (cdr args)
                   `(cdr ,ra)))))
        (err (+ "Can't understand vars list" args)))))

(def complex-args (args-lis ra-lis)
  (mappend (fn (x) (%complex-args (car x) (cadr x)))
           (map (fn (a b) (list a b)) args-lis ra-lis)))

(def complex-args? (args)
  (if (and (acons args) (is (type (car args)) 'sym))
      (complex-args? (cdr args))
      (and args (no (is (type args) 'sym)))))

(def complex-args-get-var (args)
  (if args
      (case (type args)
        sym  (list args)
        cons
        (let xs (let a (car args)
                  (if (and (acons a) (is (car a) 'o))
                      (list (cadr a))
                      (complex-args-get-var a)))
          (+ (complex-args-get-var (cdr args)) xs))
        (err (+ "Can't understand vars list" args)))))

(def compile-lookup-let (x let-e n return-let)
  (if let-e
      (let l (car let-e)
        (aif (%pos x l)
             (return-let n it)
             (compile-lookup-let x (cdr let-e) (+ 1 n) return-let)))))

(def compile-lookup (x e next return-let return-local return-free return-global)
  (aif (compile-lookup-let x (car e) 0 return-let)
       it
       (aif (%pos x (cadr e))
            (return-local it)
            (aif (%pos x (cddr e))
                 (return-free it)
                 (return-global x)))))

(def compile-refer (x e next)
  (compile-lookup
    x e next
    (fn (n m) `(refer-let ,n ,m ,next))
    (fn (n) `(refer-local ,n ,next))
    (fn (n) `(refer-free  ,n ,next))
    (fn (n)
      (case n
        nil `(refer-nil ,next)
        t   `(refer-t   ,next)
        `(refer-global ,n (indirect ,next))))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(def find-free (x b)
  (case (type x)
    sym  (if (no (mem x b)) (list x))
    cons (reccase
           x
           (quote body nil)

           (fn (vars body)
             (find-free body (union is (dotted-to-proper vars) b)))

           (with (var-vals body)
             (with (vars (map1 car  (%pair var-vals))
                         vals (map1 cadr (%pair var-vals)))
               (union is
                      (dedup (flat (map1 [find-free _ b] vals)))
                      (find-free body (union is vars b)))))

           (do body
               (dedup (flat (map1 [find-free _ b] body))))

           (%if test-then-else
                (dedup (flat (map1 [find-free _ b] test-then-else))))

           (assign (var exp)
                   (union is
                          (if (no (mem var b)) (list var))
                          (find-free exp b)))

           (ccc (exp) (find-free exp b))

           (ns (exp) (find-free exp b))

           (dedup (flat (map1 [find-free _ b] x)))

           )))

(def find-sets (x v)
  (case (type x)
    cons (reccase
           x
           (quote (obj) nil)

           (fn (vars body)
             (find-sets body (set-minus v (dotted-to-proper vars))))

           (with (var-vals body)
             (with (vars (map1 car  (%pair var-vals))
                         vals (map1 cadr (%pair var-vals)))
               (union is
                      (dedup (flat (map1 [find-sets _ v] vals)))
                      (find-sets body (set-minus v vars)))))

           (do body
               (dedup (flat (map1 [find-sets _ v] body))))

           (%if test-then-else
                (dedup (flat (map1 [find-sets _ v] test-then-else))))

           (assign (var x)
                   (union is
                          (if (mem var v) (list var))
                          (find-sets x v)))

           (ccc (exp) (find-sets exp v))

           (ns (exp) (find-sets exp v))

           (dedup (flat (map1 [find-sets _ v] x))))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(def make-boxes (sets vars next)
  ((afn (vars n)
     (if vars
         (if (mem (car vars) sets)
             `(box ,n
                   ,(self (cdr vars) (+ n 1)))
             (self (cdr vars) (+ n 1)))
         next))
   vars 0))

(def tailp (next)
  ;(prn "tailp: " next)
  (if (is (car next) 'ignore)
      (tailp (cadr next))
      (is (car next) 'return)
      (cadr next)
      (and (is (car next) 'exit-let)
           (is (caar (cdddr next)) 'return))
      (+ (cadr next) (cadar (cdddr next)))))

(def reduce-nest-exit (next n)
  ;(prn "reduce-nest-exit: " next " " n)
  (let a (car next)
    (if (is a 'exit-let)
        `(exit-let ,(+ (cadr next) n) ,(caddr next) ,(cadddr next))
        `(exit-let ,n ,n ,next))))

(def collect-free (vars e next)
  (if (no vars)
      next
      (collect-free
        (cdr vars) e
        (compile-refer
          (car vars) e
          (list 'argument next)))))

(def remove-globs (glob-free e)
  (if glob-free
      (with (let-e (car e) local (cadr e) free (cddr e))
        (keep (fn (x)
                (or (mem x (flat let-e))
                    (mem x local)
                    (mem x free))) glob-free))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(def %compile (x e s next)
  (case (type x)
    sym  (compile-refer
           x e
           (if (mem x s)
               `(indirect ,next)
               next))
    cons (reccase
           x
           (quote (obj)
                  (if (is obj nil) `(refer-nil ,next)
                      (is obj t)   `(refer-t ,next)
                      `(constant ,obj ,next)))

           (fn (vars body)
             (with (dotpos (dotted-pos vars)
                    vars (dotted-to-proper vars))
               (with (glob-free (find-free body vars)
                      sets      (find-sets body vars))
                 (let free      (remove-globs glob-free e)
                   (collect-free
                     free e
                     `(close ,(len free) ,(len vars) ,dotpos
                             ,(make-boxes
                                sets (rev vars)
                                (%compile body
                                         (cons '() (cons (rev vars) free))
                                         (union is
                                                sets
                                                (set-intersect s free))
                                         `(return ,(+ (len vars) 1))))
                             ,next))))))

           (with (var-vals body)
             (with (vars (map1 car  (%pair var-vals))
                    vals (map1 cadr (%pair var-vals)))
               ((afn (args c)
                  (if (no args)
                      c
                      (self (cdr args)
                            (%compile (car args)
                                     e
                                     s
                                     `(argument ,c)))))
                (rev vals)
                (with (e    (cons (cons (rev vars) (car e)) (cdr e))
                       sets (find-sets body vars)
                       free (remove-globs (find-free body vars) e)
                       n    (+ (len vars) 1))
                  (with (rne (reduce-nest-exit next n))
                    `(enter-let
                       ,(make-boxes
                          sets (rev vars)
                          (%compile
                            body
                            e
                            (union is
                                   sets
                                   (set-intersect s free))
                            rne))))))))

           (do body
               ((afn (body next)
                  (if (no body) next
                      (self (cdr body)
                            (%compile (car body) e s next))))
                (rev body)
                next))

           (%if (test then else)
                (with (thenc (%compile then e s `(ignore ,next))
                       elsec (%compile else e s `(ignore ,next)))
                  (%compile test e s `(test ,thenc ,elsec ,next))))

           (assign (var x)
                   (compile-lookup
                     var e next
                     (fn (n m)
                       (%compile x e s `(assign-let ,n ,m ,next)))
                     (fn (n)
                       (%compile x e s `(assign-local ,n ,next)))
                     (fn (n)
                       (%compile x e s `(assign-free ,n ,next)))
                     (fn (n)
                       (%compile x e s `(assign-global ,n ,next)))))

           (ccc (x)
                (let c
                    (fn (shift-num)
                      `(conti
                         ,shift-num
                         (argument
                           (constant
                             1
                             (argument
                               ,(%compile
                                  x e s
                                  (if (< 0 shift-num)
                                      `(shift
                                         2
                                         ,shift-num
                                         (apply))
                                      '(apply))))))))
                  (aif (tailp next)
                       (c it)
                       `(frame ,next ,(c 0)))))

           (ns (exp) (%compile exp e s `(ns ,next)))

           ((afn (args c)
              (if (no args)
                  (if (tailp next)
                      c
                      `(frame ,next ,c))
                  (self (cdr args)
                        (%compile (car args) e s `(argument ,c)))))
            (rev (+ (cdr x) (list (len (cdr x)))))
            (%compile (car x) e s
                     (aif (tailp next)
                          `(shift
                             ,(+ (len (cdr x)) 1)
                             ,it
                             (apply))
                          '(apply)))))

    (if (is x nil) `(refer-nil ,next)
        (is x t)   `(refer-t ,next)
        `(constant ,x ,next))))

(def preproc (x i)
  (reccase
    x
    (frame (ret x)
           (let body (preproc x (+ i 1))
             `((frame ,(+ (len body) 1))
               ,@body
               ,@(preproc ret (+ i (len body) 1)))))

    (close (n v d b x)
           (let body (preproc b (+ i 1))
             `((close ,n ,(+ (len body) 1) ,v ,d)
               ,@body
               ,@(preproc x (+ i (len body) 1)))))

    (test (th el x)
          (let then (preproc th (+ i 1))
            (let thenl (len then)
              (let else (preproc el (+ i thenl 2))
                (let elsel (len else)
                  `((test ,(+ thenl 2))
                    ,@then
                    (jump ,(+ elsel 1))
                    ,@else
                    ,@(preproc x (+ i thenl elsel 2))))))))

    (conti (shift-num x)
           `((conti ,shift-num) ,@(preproc x (+ i 1))))

    (shift (n m x) `((shift ,n ,m)
                     ,@(preproc x (+ i 1))))

    (constant (obj x)
              `((constant ,obj)
                ,@(preproc x (+ i 1))))

    (argument (x)
              `((argument)
                ,@(preproc x (+ i 1))))

    (refer-let (n m x)
               `((refer-let ,n ,m)
                 ,@(preproc x (+ i 1))))

    (refer-local (n x)
                 `((refer-local ,n)
                   ,@(preproc x (+ i 1))))

    (refer-free  (n x)
                 `((refer-free ,n)
                   ,@(preproc x (+ i 1))))

    (refer-global  (n x)
                   `((refer-global ,n)
                     ,@(preproc x (+ i 1))))

    (refer-nil  (x)
                `((refer-nil)
                  ,@(preproc x (+ i 1))))

    (refer-t  (x)
              `((refer-t)
                ,@(preproc x (+ i 1))))

    (enter-let (x)
               `((enter-let)
                 ,@(preproc x (+ i 1))))

    (exit-let (n m x)
              `((exit-let ,n ,m)
                ,@(preproc x (+ i 1))))

    (assign-let (n m x)
                `((assign-let ,n ,m)
                  ,@(preproc x (+ i 1))))

    (assign-local (n x)
                  `((assign-local ,n)
                    ,@(preproc x (+ i 1))))

    (assign-free  (n x)
                  `((assign-free  ,n)
                    ,@(preproc x (+ i 1))))

    (assign-global (n x)
                   `((assign-global ,n)
                     ,@(preproc x (+ i 1))))

    (ns (x) `((ns) ,@(preproc x (+ i 1))))

    (box         (n x)
                 `((box ,n)
                   ,@(preproc x (+ i 1))))

    (indirect (x)
              `((indirect)
                ,@(preproc x (+ i 1))))

    (apply () `((apply)))

    (return (x) `((return ,x)))

    (halt ()  `((halt)))

    (ignore (x) nil)

    (err "Unknown operation: " x)))

(def compile (x)
  (preproc
    (%compile
      (%macex x nil)
      '()
      '()
      '(halt))
    0))