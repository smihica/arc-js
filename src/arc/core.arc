(ns 'arc.core)

(export
  ;; layer 0
  mac rfn afn if and or let def aif
  ;; layer 1
  caselet case quasiquote
  ;; layer 2
  map1 withs w/uniq compose complement
  ;; ns
  defns export import
  ;; ss
  defss namespace-ss compose-ss complement-ss sexp-ss sexp-with-quote-ss keyword-ss
  ;; tf
  deftf cons-tf table-tf string-tf
  ;; ---
  mem union map mappend keep
  ;; layer 3
  set-minus set-intersect zip
)

;;;;;;;;;;;;;;;;;;;;; layer 0
(assign mac
        (annotate 'mac
                  (fn (name vars . body)
                    (%if body
                         (list 'assign name
                               (list 'with (list name (+ (list 'fn vars) body))
                                     (list 'fn-name name (list 'quote name))
                                     (list 'annotate ''mac name)))
                         (list 'annotate ''mac (+ (list 'fn name) vars))))))

(assign ***macros*** (fn () (collect-bounds-in-ns (***curr-ns***) 'mac)))

;; TODO:
;; support
;; - _0 ~ _9 (arg)
;; - _* (args-all)
;; - _$ self
(mac ***cut-fn*** (body) (list 'fn (list '_) body))

(mac rfn (name vars . body)
  (list 'with (list name nil)
        (list 'assign  name (+ (list 'fn vars) body))
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
  (list 'assign name (+ (list 'rfn name vars) body)))

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
                  (do (self (car x))
                      (self (cdr x))))))
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
  `(***defns***
     ',name
     ,@((afn (opts m s i e)
          (let x (car opts)
            (case x
              nil     (list s `',(nrev i) `',(nrev e))
              :extend (self (cdr opts) 's s i e)
              :import (self (cdr opts) 'i s i e)
              :export (self (cdr opts) 'e s i e)
              (case m
                s (self (cdr opts) m (list 'quote x) i e)
                i (self (cdr opts) m s (cons x i) e)
                e (self (cdr opts) m s i (cons x e))
                (err (+ "The name \"" x "\" is not specified how to use."))))))
        options nil nil nil nil)))

(mac export es
  `(***export*** (***curr-ns***) ',es))

(mac import is
  `(***import*** (***curr-ns***) ',is))

;; special syntax.
(assign ***special-syntax-order*** 0)

(mac defss (name regex vars . body)
  `(do
     (assign ,name
             (annotate 'special-syntax
                       (list ,regex
                             ***special-syntax-order***
                             (rfn ,name ,vars ,@body))))
     (assign ***special-syntax-order***
             (+ ***special-syntax-order*** 1))
     ,name))

(defss namespace-ss #/^(.+?)::(.+)$/ (a b)
       (w/uniq (orig rt)
         `(let ,orig (***curr-ns***)
            (ns ',a)
            (let ,rt ,b (ns ,orig) ,rt))))

(defss compose-ss #/^(.*[^:]):([^:].*)$/ (a b)
       `(compose ,a ,b))

(defss complement-ss #/^\~(.+)$/ (a)
       `(complement ,a))

(defss sexp-ss #/^(.*[^.])\.([^.].*)$/ (a b)
       `(,a ,b))

(defss sexp-with-quote-ss #/^(.+)\!(.+)$/ (a b)
       `(,a ',b))

(defss keyword-ss #/^:(.+)$/ (sym) `(keyword ',sym))

;; type functions.
(mac deftf (type vars . body)
  (let name (coerce (+ (coerce type 'string) "-tf") 'sym)
    `(assign ,name
             (annotate 'type-fn (rfn ,name ,vars ,@body)))))

(deftf cons   (c n)   (ref c n))
(deftf table  (tbl k . default) (or (ref tbl k) (car default)))
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

(def zip (lis1 lis2 . longest-p)
  (if (or (and (and (acons longest-p) (car longest-p)) (or lis1 lis2))
          (and lis1 lis2))
      (cons (car lis1) (cons (car lis2) (zip (cdr lis1) (cdr lis2) (car longest-p))))))