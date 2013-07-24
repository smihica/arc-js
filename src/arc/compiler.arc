(def find-qq-eval (x)
  (ccc
    (fn (c)
      ((afn (x)
         (case (type x)
           cons (reccase
                  x
                  (unquote (obj) (c t))
                  (unquote-splicing (obj) (c t))
                  (each x1 x (self x1)))))
       x))))

(def qq-pair (x)
  (if (and (find-qq-eval x)
           (is (type x) 'cons))
      (reccase
        x
        (unquote (obj) obj)
        (unquote-splicing (obj) (err "cannot use ,@ after ."))
        (case (type (car x))
          cons (reccase
                 (car x)
                 (quasiquote (obj)
                             (list 'cons
                                   (qq-pair (expand-qq obj))
                                   (qq-pair (cdr x))))
                 (unquote (obj) (list 'cons obj (qq-pair (cdr x))))
                 (unquote-splicing (obj)
                                   (if (no (cdr x))
                                       obj
                                       (list '+
                                             obj
                                             (qq-pair (cdr x)))))
                 (list 'cons
                       (qq-pair (car x))
                       (qq-pair (cdr x))))
          (list 'cons
                (qq-pair (car x))
                (qq-pair (cdr x)))))
      (list 'quote x)))

(def expand-qq (x)
  (if (and (find-qq-eval x)
           (is (type x) 'cons))
      (reccase
        x
        (quasiquote (obj) (expand-qq (expand-qq obj)))
        (unquote (obj) obj)
        (unquote-splicing (obj) (err ",@ cannot be used immediately after `"))
        (qq-pair x))
      (list 'quote x)))

(def expand-macro (x)
  (case (type x)
    cons (reccase
           x

           (quote body `(quote ,@body))

           (caselet
             (var expr . args)
             (expand-macro
               (let ex (afn (args)
                         (if (no (cdr args))
                             (car args)
                             `(if (is ,var ',(car args))
                                  ,(cadr args)
                                  ,(self (cddr args)))))
                 `(let ,var ,expr ,(ex args)))))

           (case (expr . args)
             (expand-macro
               `(caselet ,(uniq) ,expr ,@args)))

           (reccase (expr . pats)
                    (let plen (- (len pats) 1)
                      (with (f (firstn plen pats)
                               l (nthcdr plen pats))
                        (expand-macro
                          `(case (car ,expr)
                             ,@(+ (mappend
                                    (fn (pat) `(,(car pat) (apply (fn ,@(cdr pat)) (cdr ,expr))))
                                    f)
                                  l))))))

           (each (var expr . body)
               (with (fname (uniq) l (uniq))
                 (expand-macro
                   `((rfn ,fname (,l)
                       (if ,l
                           (do (let ,var (car ,l) ,@body)
                               (,fname (cdr ,l)))))
                     ,expr))))

           ;; TODO:
           ;; support
           ;; - _0 ~ _9 (arg)
           ;; - _* (args-all)
           ;; - _$ self
           (%shortfn (body) (expand-macro `(fn (_) ,body)))

           (fn (vars . body)
             `(fn ,vars ,(if (< (len body) 2)
                             (expand-macro (car body))
                             (expand-macro `(do ,@body)))))

           (rfn (name vars . body)
               (expand-macro
                 `(let ,name nil
                    (assign ,name (fn ,vars ,@body)))))

           (afn (vars . body)
             (expand-macro
               `(rfn self ,vars ,@body)))

           (quasiquote (obj) (expand-macro (expand-qq obj)))

           (if args
               (expand-macro
                 ((afn (ps)
                    (let p (car ps)
                      (if (is (len p) 2)
                          `(%if ,(car p) ,(cadr p) ,(self (cdr ps)))
                          (is (len p) 1) (car p))))
                  (pair args))))

           (and args
                (expand-macro
                  (if (cdr args)
                      `(if ,(car args) (and ,@(cdr args)))
                      (or (car args) t))))

           (or args
               (expand-macro
                 (and args
                      (let g (uniq)
                        `(let ,g ,(car args)
                           (if ,g ,g (or ,@(cdr args))))))))

           (with (var-val . body)
             `(with ,(expand-macro var-val)
                ,(if (< (len body) 2)
                     (expand-macro (car body))
                     (expand-macro `(do ,@body)))))

           (let (var val . body)
               (expand-macro
                 `(with (,var ,val) ,@body)))

           (def (name vars . body)
               (expand-macro
                 `(assign ,name (fn ,vars ,@body))))

           (aif args
                (expand-macro
                  ((afn (ps)
                     (let p (car ps)
                       (if (is (len p) 2)
                           `(let it ,(car p)
                              (%if it ,(cadr p)
                                   ,(self (cdr ps))))
                           (is (len p) 1) (car p))))
                   (pair args))))

           (map expand-macro x))
    x))


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;


(def compile-lookup-let (x let-e n return-let)
  (if let-e
      (let l (car let-e)
        (aif (pos x l)
             (return-let n it)
             (compile-lookup-let x (cdr let-e) (+ 1 n) return-let)))))

(def compile-lookup (x e next return-let return-local return-free return-global)
  (aif (compile-lookup-let x (car e) 0 return-let)
       it
       (aif (pos x (cadr e))
            (return-local it)
            (aif (pos x (cddr e))
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
             (with (vars (map car  (pair var-vals))
                         vals (map cadr (pair var-vals)))
               (union is
                      (dedup (flat (map (%shortfn (find-free _ b)) vals)))
                      (find-free body (union is vars b)))))

           (do body
               (dedup (flat (map (%shortfn (find-free _ b)) body))))

           (%if test-then-else
                (dedup (flat (map (%shortfn (find-free _ b)) test-then-else))))

           (assign (var exp)
                   (union is
                          (if (no (mem var b)) (list var))
                          (find-free exp b)))

           (ccc (exp) (find-free exp b))

           (dedup (flat (map (%shortfn (find-free _ b)) x)))

           )))

(def find-sets (x v)
  (case (type x)
    cons (reccase
           x
           (quote (obj) nil)

           (fn (vars body)
             (find-sets body (set-minus v (dotted-to-proper vars))))

           (with (var-vals body)
             (with (vars (map car  (pair var-vals))
                         vals (map cadr (pair var-vals)))
               (union is
                      (dedup (flat (map (%shortfn (find-sets _ v)) vals)))
                      (find-sets body (set-minus v vars)))))

           (do body
               (dedup (flat (map (%shortfn (find-sets _ v)) body))))

           (%if test-then-else
                (dedup (flat (map (%shortfn (find-sets _ v)) test-then-else))))

           (assign (var x)
                   (union is
                          (if (mem var v) (list var))
                          (find-sets x v)))

           (ccc (exp) (find-sets exp v))

           (dedup (flat (map (%shortfn (find-sets _ v)) x))))))

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
  (if (is (car next) 'return)
      (cadr next)
      (and (is (car next) 'exit-let)
           (is (caar (cddr next)) 'return))
      (+ (cadr next) (cadr (car (cddr next))))))

(def nest-exit-p (next) (is (car next) 'exit-let))

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

(def compile (x e s next)
  (case (type x)
    sym  (compile-refer
           x e
           (if (mem x s)
               `(indirect ,next)
               next))
    cons (reccase
           x
           (quote (obj) `(constant ,obj ,next))

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
                                (compile body
                                         (cons '() (cons (rev vars) free))
                                         (union is
                                                sets
                                                (set-intersect s free))
                                         `(return ,(+ (len vars) 1))))
                             ,next))))))

           (with (var-vals body)
             (with (vars (map car  (pair var-vals))
                    vals (map cadr (pair var-vals)))
               ((afn (args c)
                  (if (no args)
                      c
                      (self (cdr args)
                            (compile (car args)
                                     e
                                     s
                                     `(argument ,c)))))
                (rev vals)
                (with (e    (cons (cons (rev vars) (car e)) (cdr e))
                       nep  (nest-exit-p next)
                       sets (find-sets body vars)
                       free (remove-globs (find-free body vars) e))
                  `(enter-let
                     ,(make-boxes
                        sets (rev vars)
                        (compile
                          body
                          e
                          (union is
                                 sets
                                 (set-intersect s free))
                          `(exit-let ,(+ (len vars) 1 (if nep (cadr next) 0))
                                     ,(if nep (cadr (cdr next)) next)))))))))

           (do body
               ((afn (body next)
                  (if (no body) next
                      (self (cdr body)
                            (compile (car body) e s next))))
                (rev body)
                next))

           (%if (test then else)
                (with (thenc (compile then e s next)
                             elsec (compile else e s next))
                  (compile test e s `(test ,thenc ,elsec))))

           (assign (var x)
                   (compile-lookup
                     var e next
                     (fn (n m)
                       (compile x e s `(assign-let ,n ,m ,next)))
                     (fn (n)
                       (compile x e s `(assign-local ,n ,next)))
                     (fn (n)
                       (compile x e s `(assign-free ,n ,next)))
                     (fn (n)
                       (compile x e s `(assign-global ,n ,next)))))

           (ccc (x)
                (let c
                    (fn (shift-num)
                      `(conti
                         ,shift-num
                         (argument
                           (constant
                             1
                             (argument
                               ,(compile
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

           ((afn (args c)
              (if (no args)
                  (if (tailp next)
                      c
                      `(frame ,next ,c))
                  (self (cdr args)
                        (compile (car args) e s `(argument ,c)))))
            (rev (+ (cdr x) (list (len (cdr x)))))
            (compile (car x) e s
                     (aif (tailp next)
                          `(shift
                             ,(+ (len (cdr x)) 1)
                             ,it
                             (apply))
                          '(apply)))))

    `(constant ,x ,next)))

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

    (test (th else)
          (let then (preproc th (+ i 1))
            `((test ,(+ (len then) 1))
              ,@then
              ,@(preproc else (+ i (len then) 1)))))

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

    (exit-let (n x)
              `((exit-let ,n)
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

    (box         (n x)
                 `((box ,n)
                   ,@(preproc x (+ i 1))))

    (indirect (x)
              `((indirect)
                ,@(preproc x (+ i 1))))

    (apply () `((apply)))

    (return (x) `((return ,x)))

    (halt ()  `((halt)))

    nil))

(def do-compile (x)
  (preproc
    (compile
      (expand-macro x)
      '()
      '()
      '(halt))
    0))