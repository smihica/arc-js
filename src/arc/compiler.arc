; (***ns*** 'arc.core.compiler)

;;;;;;;;;;;;;;;;;;;;; layer 0

(assign ***macros*** (table))
(assign ***special_syntax*** (table))
(assign ***type_functions*** (table))

;(mac mac (name vars . body)
;(if body
;      `(assign ,name (sref ***macros*** (annotate 'mac (fn ,vars ,@body)) ',name))
;      `(annotate 'mac (fn ,name ,@vars))))

(assign mac
        (sref ***macros***
              (annotate 'mac
                        (fn (name vars . body)
                          (%if body
                               (list 'assign name (list 'sref '***macros*** (list 'annotate ''mac (+ (list 'fn vars) body)) (list 'quote name)))
                               (list 'annotate ''mac (+ (list 'fn name) vars)))))
              'mac))

(assign ***macro*** (fn () (collect-bounds-in-ns (***curr-ns***) 'mac)))

;; TODO:
;; support
;; - _0 ~ _9 (arg)
;; - _* (args-all)
;; - _$ self
(mac %shortfn (body) (list 'fn (list '_) body))

(mac rfn (name vars . body)
  (list 'with (list name nil)
        (list 'assign name (+ (list 'fn vars) body))
        (list 'fn-name name (list 'quote name))
        name))

(mac afn (vars . body)
  (+ (list 'rfn 'self vars) body))

(mac if args
  ((afn (ps)
     (with (p (car ps))
       (%if (is (len p) 2)
            (list '%if (car p) (cadr p) (self (cdr ps)))
            (%if (is (len p) 1)
                 (car p)
                 nil))))
   (%pair args)))

;; (and 1 nil)
;; (and nil 1)
(mac and args
  (%if (cdr args)
       (list '%if (car args) (+ (list 'and) (cdr args)) nil)
       (with (x (car args)) (%if x x nil))))

(mac or args
  (and args
       (with (g (uniq))
         (list 'with (list g (car args))
               (list '%if g g (+ (list 'or) (cdr args)))))))

(mac let (var val . body)
  (+ (list 'with (list var val)) body))

(mac def (name vars . body)
  (list 'assign name (+ (list 'fn vars) body)))

(mac aif args
  ((afn (ps)
     (let p (car ps)
       (if (is (len p) 2)
           (list 'let 'it (car p)
                 (list '%if 'it (cadr p)
                       (self (cdr ps))))
           (is (len p) 1)
           (car p))))
   (%pair args)))

;;;;;;;;;;;;;;;;;;;;; layer 1

(mac caselet (var expr . args)
  (let ex (afn (args)
            (if (no (cdr args))
                (car args)
                (list 'if (list 'is var (list 'quote (car args)))
                      (cadr args)
                      (self (cddr args)))))
    (list 'let var expr (ex args))))

(mac case (expr . args)
  (+ (list 'caselet (uniq) expr) args))

(mac reccase (expr . pats)
  (let plen (- (len pats) 1)
    (with (f (firstn plen pats)
           l (nthcdr plen pats))
      (cons (quote case)
            (cons (cons (quote car)
                        (cons expr (quote nil)))
                  (+
                    (apply + nil
                           (map1 (fn (pat)
                                   (cons (car pat)
                                         (cons (cons (quote apply)
                                                     (cons (cons (quote fn) (cdr pat))
                                                           (cons (cons (quote cdr) (cons expr (quote nil)))
                                                                 (quote nil))))
                                               (quote nil))))
                                 f))
                    l))))))

(def find-qq-eval (x)
  (ccc
    (fn (c)
      ((afn (x)
         (case (type x)
           cons (reccase
                  x
                  (unquote (obj) (c t))
                  (unquote-splicing (obj) (c t))
                  (do (map1 self x) nil))))
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

(mac quasiquote (obj) (expand-qq obj))

;;;;;;;;;;;;;;;;;;;;; layer 2 (able to use qq)

(def map1 (f lis)
  ((afn (lis acc)
     (if lis
         (self (cdr lis) (cons (f (car lis)) acc))
         (nrev acc)))
   lis nil))

(mac withs (parms . body)
  (if (no parms)
      `(do ,@body)
      `(let ,(car parms) ,(cadr parms)
         (withs ,(cddr parms) ,@body))))

(mac w/uniq (names . body)
  (if (acons names)
    `(with ,(apply + nil
                   (map1 (fn (n) `(,n (uniq ',n))) names))
       ,@body)
    `(let ,names (uniq ',names) ,@body)))

(mac compose args
  (w/uniq g
    `(fn ,g
       ,((afn (fs)
           (if (cdr fs)
               (list (car fs) (self (cdr fs)))
               `(apply ,(if (car fs) (car fs) 'idfn) ,g)))
         args))))

(def complement (f) (fn args (no (apply f args))))

;; namespace
(mac defns (name . options)
  `(***defns*** ',name ',options))

;(mac ns (name)
;  `(***ns*** ',name))

;; special syntax.
(mac defss (name regex vars . body)
  `(do
     (assign ,name
             (sref ***special_syntax***
                   (annotate 'special-syntax (cons ,regex (let x (fn ,vars ,@body) (fn-name x ',name) x)))
                   ',name))
     ,name))

(defss compose-ss #/^(.*[^:]):([^:].*)$/ (a b)
       `(compose ,a ,b))

(defss complement-ss #/^\~(.+)$/ (a)
       `(complement ,a))

(defss sexp-ss #/^(.+)\.(.+)$/ (a b)
       `(,a ,b))

(defss sexp-with-quote-ss #/^(.+)\!(.+)$/ (a b)
       `(,a ',b))

(defss namespace #/^(.+?)::(.+)$/ (a b)
       `(ns ,a ,b))

;; type functions.
(mac deftf (type vars . body)
  `(assign ,(coerce (+ "***" (coerce type 'string) "_type_fn***") 'sym)
           (sref ***type_functions***
                 (annotate 'type-function (fn ,vars ,@body))
                 ',type)))

(deftf cons   (c n)   (ref c n))
(deftf table  (tbl k) (ref tbl k))
(deftf string (str n) (ref str n))

;; util fns
(def mem (test seq)
  (if (isa seq 'string)
      (aif (mem test (coerce seq 'cons))
           (coerce it 'string))
      (if (isa test 'fn)
          ((afn (seq)
             (if seq
                 (if (test (car seq)) seq
                     (self (cdr seq)))))
           seq)
          (%mem test seq))))

(def union (test lis1 lis2)
  (if (is test is) (%union test lis1 lis2)
      t nil ;;;;;;;;;;; TODO !!!!!!!!!!!!!!!
      ))

(def map (f . seqs)
  (if (mem [isa _ 'string] seqs)
      (let n (apply min (map len seqs))
        ((afn (i l)
           (if (is i n)
               (coerce (nrev l) 'string)
               (self (+ i 1) (cons (apply f (map [_ i] seqs)) l))))
         0 nil))

      (no (cdr seqs))
      (map1 f (car seqs))

      ((afn (seqs)
         (if (mem no seqs)
             nil
             (cons (apply f (map1 car seqs))
                   (self (map1 cdr seqs)))))
       seqs)))

(def mappend (f . args) (apply + nil (apply map f args)))

(def keep (f lis)
  (mappend [if (f _) (cons _ nil)] lis))

;;;;;;;;;;;;;;;;;;;;; layer 3

(def set-minus (s1 s2)
  (if s1
      (if (%mem (car s1) s2)
          (set-minus (cdr s1) s2)
          (cons (car s1) (set-minus (cdr s1) s2)))))

(def set-intersect (s1 s2)
  (if s1
      (if (%mem (car s1) s2)
          (cons (car s1) (set-intersect (cdr s1) s2))
          (set-intersect (cdr s1) s2))))

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

(def zip (lis1 lis2 . longest-p)
  (if (or (and (and (acons longest-p) (car longest-p)) (or lis1 lis2))
          (and lis1 lis2))
      (cons (car lis1) (cons (car lis2) (zip (cdr lis1) (cdr lis2) (car longest-p))))))

(def dotted (l) (if (acons l) (dotted (cdr l)) l t))
(def dottify (l) (if (no (cdr l)) (car l) (cons (car l) (dottify (cdr l)))))
(def undottify (l) (if (acons l) (cons (car l) (undottify (cdr l))) l (cons l nil)))

;;;;;;;;;;;;;;;;;;;;; layer 4

(def ssexpand (s)
  (aif (ssyntax s t) it s))

(def macex1 (x)
  (aif (and (is (type x) 'cons) (ref (***macro***) (car x)))
       (apply (rep (indirect it)) (cdr x))
       x))

(def %macex (x e)
  (case (type x)
    cons (reccase
           x
           (quote body `(quote ,@body))
           (fn (vars . body)
             (if (%complex-args? vars)
                 (%macex
                   (w/uniq (arg)
                     `(fn ,arg
                        (with ,(%complex-args (list vars) (list arg))
                          ,@body)))
                   e)
                 `(fn ,vars
                    ,(if (< (len body) 2)
                         (%macex (car body) (union is (dotted-to-proper vars) e))
                         (%macex `(do ,@body) (union is (dotted-to-proper vars) e))))))
           (with (var-val . body)
             (let var-val (%pair var-val)
               (let vars (map1 car var-val)
                 (if (%complex-args? vars)
                     (let vals (map1 cadr var-val)
                       (let uniqs (map1 [uniq] vals)
                         (%macex
                           `(with ,(zip uniqs vals)
                              (with ,(%complex-args vars uniqs)
                                ,@body))
                           e)))
                     `(with ,(mappend (fn (p) (list (car p) (%macex (cadr p) e))) var-val)
                        ,(if (< (len body) 2)
                             (%macex (car body) (union is vars e))
                             (%macex `(do ,@body) (union is vars e))))))))
           (aif (let top (car x)
                  (and (is (type top) 'sym)
                       (no (mem top e))
                       (ref (***macro***) top)))
                (%macex
                  (apply (rep (indirect it)) (cdr x)) e)
                (map1 [%macex _ e] x)))

    sym (let expanded (ssexpand x)
          (if (is expanded x)
              x
              (%macex expanded e)))

    x))

(def macex (x . igns) (%macex x igns))

(def %%complex-args (args ra)
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
                (%%complex-args
                  (car args)
                  `(car ,ra)))
          (let v (car x)
            (+ x (%%complex-args
                   (cdr args)
                   `(cdr ,ra)))))
        (err (+ "Can't understand vars list" args)))))

(def %complex-args (args-lis ra-lis)
  (mappend (fn (x) (%%complex-args (car x) (cadr x)))
           (map (fn (a b) (list a b)) args-lis ra-lis)))

(def %complex-args? (args)
  (if (and (acons args) (is (type (car args)) 'sym))
      (%complex-args? (cdr args))
      (and args (no (is (type args) 'sym)))))

(def %complex-args-get-var (args)
  (if args
      (case (type args)
        sym  (list args)
        cons
        (let xs (let a (car args)
                  (if (and (acons a) (is (car a) 'o))
                      (list (cadr a))
                      (%complex-args-get-var a)))
          (+ (%complex-args-get-var (cdr args)) xs))
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

           (ns (name) nil)

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

           (ns (name) nil)

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

(def compile (x e s next)
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
                                (compile body
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
                            (compile (car args)
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
                          (compile
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
                            (compile (car body) e s next))))
                (rev body)
                next))

           (%if (test then else)
                (with (thenc (compile then e s `(ignore ,next))
                       elsec (compile else e s `(ignore ,next)))
                  (compile test e s `(test ,thenc ,elsec ,next))))

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

           (ns (name) `(ns ,name ,next))

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

    (ns (n x)
        `((ns ,n)
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

    (ignore (x) nil)

    nil))

(def do-compile (x)
  ;; (prn (***curr-ns***))
  (preproc
    (compile
      (%macex x nil)
      '()
      '()
      '(halt))
    0))