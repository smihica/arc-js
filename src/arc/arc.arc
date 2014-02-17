(def pair (xs (o f list))
  (if (is f list) (%pair xs)
      ((afn (xs f)
         (if (no xs) nil
             (no cdr.xs) (list (list car.xs))
             (cons (f car.xs cadr.xs)
                   (self cddr.xs f))))
       xs f)))

(def exact (n) (if (is (type n) 'int) t))

(mac ns (name . body)
  (let x (uniq)
    `(let ,x (do (in-ns ',name) ,@body)
       (exit-ns)
       ,x)))

(mac make-br-fn (body) `(fn (_) ,body))

(def assoc (key al)
  (if (atom al)
      nil
      (and (acons (car al)) (is (caar al) key))
      (car al)
      (assoc key (cdr al))))

(def alref (al key) (cadr (assoc key al)))

(def join args
  (if (no args) nil
      (let a (car args)
        (if (no a)
            (apply join (cdr args))
            (cons (car a) (apply join (cdr a) (cdr args)))))))

(def isnt (x y) (no (is x y)))

(def alist (x) (or (no x) (is (type x) 'cons)))

(mac ret (var val . body)
  `(let ,var ,val ,@body ,var))

(mac in (x . choices)
  (w/uniq g
    `(let ,g ,x
       (or ,@(map1 (fn (c) `(is ,g ,c)) choices)))))

; bootstrapping version; overloaded later as a generic function
(def iso (x y)
  (or (is x y)
      (and (acons x)
           (acons y)
           (iso (car x) (car y))
           (iso (cdr x) (cdr y)))))

(mac when (test . body)
  `(if ,test (do ,@body)))

(mac unless (test . body)
  `(if (no ,test) (do ,@body)))

(mac while (test . body)
  (w/uniq (gf gp)
    `((rfn ,gf (,gp)
        (when ,gp ,@body (,gf ,test)))
      ,test)))

(def reclist (f xs)
  (and xs (or (f xs) (if (acons xs) (reclist f (cdr xs))))))

(def recstring (test s (o start 0))
  ((afn (i l)
     (and (< i l)
          (or (test i)
              (self (+ i 1) l))))
   start (len s)))

(def testify (x)
  (if (isa x 'fn) x [iso _ x]))

(def carif (x) (if (atom x) x (car x)))

(def some (test seq)
  (let f (testify test)
    (if (alist seq)
        (reclist f:carif seq)
        (recstring f:seq seq))))

(def all (test seq)
  (~some (complement (testify test)) seq))

;;mem -> prim

(def find (test seq)
  (let f (testify test)
    (if (alist seq)
        (reclist   [if (f:carif _) (carif _)] seq)
        (recstring [if (f:seq _) (seq _)] seq))))

;; isa -> prim
;; map, mappend, firstn -> core.arc

(def lastn (n xs)
  (rev (firstn n (rev xs))))

;; nthcdr -> core.arc

(def lastcons (xs)
  (if (acons cdr.xs) (lastcons cdr.xs) xs))

; Generalization of pair: (tuples x) = (pair x)

(def tuples (xs (o n 2) (o acc nil))
  (if (no xs)
      (rev acc)
      (tuples (nthcdr n xs) n
              (cons (firstn n xs) acc))))

(mac defs args
  `(do ,@(map [cons 'def _] (tuples args 3))))

(def caris (x val)
  (and (acons x) (is (car x) val)))

(def warn (msg . args)
  (disp (+ "Warning: " msg ". "))
  (map [do (write _) (disp " ")] args)
  (disp #\newline))

; setforms returns (vars get set) for a place based on car of an expr
;  vars is a list of gensyms alternating with expressions whose vals they
;   should be bound to, suitable for use as first arg to withs
;  get is an expression returning the current value in the place
;  set is an expression representing a function of one argument
;   that stores a new value in the place

; A bit gross that it works based on the *name* in the car, but maybe
; wrong to worry.  Macros live in expression land.

; seems meaningful to e.g. (push 1 (pop x)) if (car x) is a cons.
; can't in cl though.  could I define a setter for push or pop?

(assign setter (table))

(mac defset (name parms . body)
  (w/uniq gexpr
    `(sref setter
           (fn (,gexpr)
             (let ,parms (cdr ,gexpr)
               ,@body))
           ',name)))

(defset car (x)
  (w/uniq g
    (list (list g x)
          `(car ,g)
          `(fn (val) (scar ,g val)))))

(defset cdr (x)
  (w/uniq g
    (list (list g x)
          `(cdr ,g)
          `(fn (val) (scdr ,g val)))))

(defset caar (x)
  (w/uniq g
    (list (list g x)
          `(caar ,g)
          `(fn (val) (scar (car ,g) val)))))

(defset cadr (x)
  (w/uniq g
    (list (list g x)
          `(cadr ,g)
          `(fn (val) (scar (cdr ,g) val)))))

(defset cddr (x)
  (w/uniq g
    (list (list g x)
          `(cddr ,g)
          `(fn (val) (scdr (cdr ,g) val)))))

; Note: if expr0 macroexpands into any expression whose car doesn't
; have a setter, setforms assumes it's a data structure in functional
; position.  Such bugs will be seen only when the code is executed, when
; sref complains it can't set a reference to a function.

(def setforms (expr0)
  (let expr (macex expr0 'compose)
    (if (isa expr 'sym)
        (w/uniq (g h)
          (list (list g expr)
                g
                `(fn (,h) (assign ,expr ,h))))

        ; make it also work for uncompressed calls to compose
        (and (acons expr) (metafn (car expr)))
        (setforms (expand-metafn-call (car expr) (cdr expr)))

        (and (acons expr) (acons (car expr)) (is (caar expr) 'get))
        (setforms (list (cadr expr) (cadar expr)))

        (aif (ref setter (car expr))
             (it expr)
             ; assumed to be data structure in fn position
             (do (when (caris (car expr) 'fn)
                   (warn "Inverting what looks like a function call"
                         expr0 expr))
                 (w/uniq (g h)
                   (let argsyms (map [uniq] (cdr expr))
                     (list (+ (list g (car expr))
                              (mappend list argsyms (cdr expr)))
                           `(,g ,@argsyms)
                           `(fn (,h) (sref ,g ,h ,(car argsyms)))))))))))

(def metafn (x)
  (and (acons x) (in (car x) 'compose 'complement)))

(def expand-metafn-call (f args)
  (if (is (car f) 'compose)
      ((afn (fs)
         (if (caris (car fs) 'compose)            ; nested compose
             (self (join (cdr (car fs)) (cdr fs)))
             (cdr fs)
             (list (car fs) (self (cdr fs)))
             (cons (car fs) args)))
       (cdr f))
      (is (car f) 'no)
      (err "Can't invert " (cons f args))
      (cons f args)))

(def expand= (place val)
  (if (isa place 'sym)
      `(assign ,place ,val)
      (let (vars prev setter) (setforms place)
        (w/uniq g
          `(with ,(+ vars (list g val)) ;; atwith
             (,setter ,g))))))

(def expand=list (terms)
  `(do ,@(map (fn ((p v)) (expand= p v))  ; [apply expand= _]
                  (pair terms))))

(mac = args (expand=list args))

(mac loop (start test update . body)
  (w/uniq (gfn gparm)
    `(do ,start
         ((rfn ,gfn (,gparm)
            (if ,gparm
                (do ,@body ,update (,gfn ,test))))
          ,test))))

(mac for (v init max . body)
  (w/uniq (gi gm)
    `(with (,v nil ,gi ,init ,gm (+ ,max 1))
       (loop (assign ,v ,gi) (< ,v ,gm) (assign ,v (+ ,v 1))
         ,@body))))

(mac down (v init min . body)
  (w/uniq (gi gm)
    `(with (,v nil ,gi ,init ,gm (- ,min 1))
       (loop (assign ,v ,gi) (> ,v ,gm) (assign ,v (- ,v 1))
         ,@body))))

; could bind index instead of gensym

(mac repeat (n . body)
  `(for ,(uniq) 1 ,n ,@body))

(mac forlen (var s . body)
  `(for ,var 0 (- (len ,s) 1) ,@body))

;(def maptable (f tbl)
;  (let l (coerce tbl 'cons)
;    (let rt (map1 [f car._ cadr._] l)
;      (coerce rt 'table))))

(def maptable (f tbl)
  (let l (coerce tbl 'cons)
    (map1 [f car._ cadr._] l)
    nil))

(def walk (seq func)
  (if alist.seq
      ((afn (l)
         (when (acons l)
           (func (car l))
           (self (cdr l))))
       seq)

      (isa seq 'table)
      (maptable (fn (k v) (func (list k v))) seq)

      (forlen i seq
              (func seq.i))))