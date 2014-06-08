(ns 'arc)

; export
;  pair exact assoc alref join isnt alist ret in iso when unless while
;  reclist recstring testify carif some all find lastn tuples defs
;  caris warn

(def pair (xs (o f list))
  (if (is f list) (%pair xs)
      ((afn (xs f)
         (if (no xs) nil
             (no cdr.xs) (list (list car.xs))
             (cons (f car.xs cadr.xs)
                   (self cddr.xs f))))
       xs f)))

(def exact (n) (if (is (type n) 'int) t))

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

(def ***setters*** ()
  (collect-bounds-in-ns (***curr-ns***) 'setter))

(mac defset (name params . body)
  (let n (sym (+ name '-setter))
    `(assign ,n (annotate 'setter (rfn ,n ,params ,@body)))))

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

(def setforms (expr0 (o setters (***setters***)))
  (let expr (macex expr0 'compose)
    (if (isa expr 'sym)
        (w/uniq (g h)
          `((,g ,expr)
            ,g
            (fn (,h) (assign ,expr ,h))))

        ; make it also work for uncompressed calls to compose
        (and (acons expr) (in (car expr) 'compose 'complement))
        (setforms (-expand-metafn-call (car expr) (cdr expr)) setters)

        ;; ArcJS is not supported get.
        ;(and (acons expr) (acons (car expr)) (is (caar expr) 'get))
        ;(setforms (list (cadr expr) (cadar expr)))

        (aif (ref setters (sym (+ (car expr) '-setter)))
             (apply (rep (indirect it)) (cdr expr))
             ; assumed to be data structure in fn position
             (do (when (caris (car expr) 'fn)
                   (warn "Inverting what looks like a function call" expr0 expr))
                 (w/uniq (g h)
                   (let argsyms (map [uniq] (cdr expr))
                     (list (+ (list g (car expr))
                              (zip argsyms (cdr expr)))
                           `(,g ,@argsyms)
                           `(fn (,h) (sref ,g ,h ,(car argsyms)))))))))))

(def -expand-metafn-call (f args)
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

(def expand= (place val (o setters (***setters***)))
  (let place (if (isa place 'sym) (ssexpand place) place)
    (if (isa place 'sym)
        `(assign ,place ,val)
        (let (vars prev setter) (setforms place setters)
          (w/uniq g
            `(with ,(+ vars (list g val)) ;; atwith
               (,setter ,g)))))))

(def expand=list (terms (o setters (***setters***)))
  `(do ,@(map (fn ((p v)) (expand= p v setters))  ; [apply expand= _]
              (pair terms))))

(mac = args
  (expand=list args (***setters***)))

(mac loop (start test update . body)
  (w/uniq (looper loop-flag)
    `(do ,start
         ((rfn ,looper (,loop-flag)
            (if ,loop-flag
                (do ,@body ,update (,looper ,test))))
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

(mac each (var expr . body)
  `(walk ,expr (fn (,var) ,@body)))

; ; old definition of 'each. possibly faster, but not extendable.
; (mac each (var expr . body)
;   (w/uniq (gseq gf gv)
;     `(let ,gseq ,expr
;        (if (alist ,gseq)
;             ((rfn ,gf (,gv)
;                (when (acons ,gv)
;                  (let ,var (car ,gv) ,@body)
;                  (,gf (cdr ,gv))))
;              ,gseq)
;            (isa ,gseq 'table)
;             (maptable (fn ,var ,@body)
;                       ,gseq)
;             (for ,gv 0 (- (len ,gseq) 1)
;               (let ,var (,gseq ,gv) ,@body))))))

; (nthcdr x y) = (cut y x).

(def cut (seq start (o end))
  (let l (len seq)
    (with (end (if (no end) l
                   (< end 0) (+ l end)
                   end)
           start (if (< start 0) (+ l start) start)
           strp  (isa seq 'string))
      (let seq (coerce seq 'cons)
        (let res (firstn (- end start) (nthcdr start seq))
          (if strp (coerce res 'string) res))))))

(def last (xs) (lastn 1 xs))

(def rem (test seq)
  (let f (testify test)
    (if (alist seq)
      ((afn (s acc)
         (if (no s)        (nrev acc)
             (f (car s))   (self (cdr s) acc)
             (self (cdr s) (cons (car s) acc))))
       seq nil)
      (coerce (rem f (coerce seq 'cons)) 'string))))

; Seems like keep doesn't need to testify-- would be better to
; be able to use tables as fns.  But rem does need to, because
; often want to rem a table from a list.  So maybe the right answer
; is to make keep the more primitive, not rem.

(def keep (test seq)
  (rem (complement (testify test)) seq))

;(def trues (f seq)
;  (rem nil (map f seq)))

(def trues (f xs)
  (and xs
       (let fx (f (car xs))
         (if fx
             (cons fx (trues f (cdr xs)))
             (trues f (cdr xs))))))

(mac do1 args
  (w/uniq g
    `(let ,g ,(car args)
       ,@(cdr args)
       ,g)))

;; caselet
;; case

(mac push (x place)
  (w/uniq gx
    (let (binds val setter) (setforms place)
      `(let ,gx ,x
         (withs ,binds ;; atwiths
           (,setter (cons ,gx ,val)))))))

(mac swap (place1 place2)
  (w/uniq (g1 g2)
    (with ((binds1 val1 setter1) (setforms place1)
           (binds2 val2 setter2) (setforms place2))
      `(withs ,(+ binds1 (list g1 val1) binds2 (list g2 val2)) ;; atwiths
         (,setter1 ,g2)
         (,setter2 ,g1)))))

(mac rotate places
  (with (vars (map [uniq] places)
              forms (map setforms places))
    `(withs ,(mappend (fn (g (binds val setter)) ;; atwiths
                        (+ binds (list g val)))
                      vars
                      forms)
       ,@(map (fn (g (binds val setter))
                (list setter g))
              (+ (cdr vars) (list (car vars)))
              forms))))

(mac pop (place)
  (w/uniq g
    (let (binds val setter) (setforms place)
      `(withs ,(+ binds (list g val))
         (do1 (car ,g)
              (,setter (cdr ,g)))))))

(def adjoin (x xs (o test iso))
  (if (some [test x _] xs)
      xs
      (cons x xs)))

(mac pushnew (x place (o test 'iso))
  (let (binds val setter) (setforms place)
    `(withs ,binds ;; atwiths
       (,setter (adjoin ,x ,val ,test)))))

(mac pull (test place)
  (let (binds val setter) (setforms place)
    `(withs ,binds ;; atwiths
       (,setter (rem ,test ,val)))))

(mac togglemem (x place (o test 'iso))
  (w/uniq gx
    (let (binds val setter) (setforms place)
      `(withs ,(+ (list gx x) binds) ;; atwiths
         (,setter (if (mem ,gx ,val)
                      (rem ,gx ,val)
                      (adjoin ,gx ,val ,test)))))))

(mac ++ (place (o i 1))
  (if (isa place 'sym)
      `(= ,place (+ ,place ,i))
      (let (binds val setter) (setforms place)
        `(withs ,binds ;; atwiths
           (,setter (+ ,val ,i))))))

(mac -- (place (o i 1))
  (if (isa place 'sym)
      `(= ,place (- ,place ,i))
      (let (binds val setter) (setforms place)
        `(withs ,binds ;; atwiths
           (,setter (- ,val ,i))))))

; E.g. (++ x) equiv to (zap + x 1)

(mac zap (op place . args)
  (with (gop   (uniq)
         gargs (map [uniq] args)
         mix   (afn seqs
                 (if (some no seqs)
                     nil
                     (+ (map car seqs)
                        (apply self (map cdr seqs))))))
    (let (binds val setter) (setforms place)
      `(withs ,(+ binds (list gop op) (mix gargs args)) ;; atwiths
         (,setter (,gop ,val ,@gargs))))))

;(= x 10)    10
;(zap + x 1) 11
;x 11
;(= x '(1 2)) (1 2)
;(zap + (cadr x) 1) 3
;x (1 3)

(mac wipe args
  `(do ,@(map (fn (a) `(= ,a nil)) args)))

(mac set args
  `(do ,@(map (fn (a) `(= ,a t)) args)))

; Destructuring means ambiguity: are pat vars bound in else? (no)

(mac iflet (var expr . branches)
  (if branches
    (w/uniq gv
      `(let ,gv ,expr
         (if ,gv
           (let ,var ,gv
             ,(car branches))
           ,(if (cdr branches)
                `(iflet ,var ,@(cdr branches))))))
    expr))

;(let x '(a)
;  (iflet (a . b) (cadr x)
;    (list a b)
;    x
;    (list a b)))
; (a nil)

(mac whenlet (var expr . body)
  `(iflet ,var ,expr (do ,@body)))

(mac awhen (expr . body)
  `(let it ,expr (if it (do ,@body))))

(mac whilet (var test . body)
  (w/uniq (gf gp)
    `((rfn ,gf (,gp)
        (whenlet ,var ,gp
          ,@body
          (,gf ,test)))
      ,test)))

(mac aand args
  (if (no args)
       t
      (no (cdr args))
       (car args)
      `(let it ,(car args) (and it (aand ,@(cdr args))))))

(mac accum (accfn . body)
  (w/uniq gacc
    `(withs (,gacc nil ,accfn [push _ ,gacc])
       ,@body
       (nrev ,gacc))))

; Repeatedly evaluates its body till it returns nil, then returns vals.

(mac drain (expr (o eof nil))
  (w/uniq (gacc gdone gres)
    `(with (,gacc nil ,gdone nil)
       (while (no ,gdone)
              (let ,gres ,expr
                (if (is ,gres ,eof)
                    (= ,gdone t)
                    (push ,gres ,gacc))))
       (rev ,gacc))))

; For the common C idiom while x = snarfdata != stopval.
; Rename this if use it often.

(mac whiler (var expr endval . body)
  (w/uniq gf
    `(withs (,var nil ,gf (testify ,endval))
       (while (no (,gf (= ,var ,expr)))
         ,@body))))

(mac check (x test (o alt))
  (w/uniq gx
    `(let ,gx ,x
       (if (,test ,gx) ,gx ,alt))))

(mac acheck (x test (o alt))
  `(let it ,x
     (if (,test it)
         it
         ,alt)))

(def pos (test seq (o start 0))
  (let f (testify test)
    (if (alist seq)
        ((afn (seq n)
           (if (no seq)
               nil
               (f (car seq))
               n
               (self (cdr seq) (+ n 1))))
         (nthcdr start seq) start)
        (recstring [if (f (seq _)) _] seq start))))

(def sym (x) (coerce x 'sym))

(def int (x (o b 10)) (coerce x 'int b))

(defss x-plus-ss      #/^(\d+)\+$/ (x) `(fn (a) (+ ,x a)))
(defss x-minus-ss     #/^(\d+)\-$/ (x) `(fn (a) (- ,x a)))
(defss x-mul-ss       #/^(\d+)\*$/ (x) `(fn (a) (* ,x a)))
(defss x-div-ss       #/^(\d+)\/$/ (x) `(fn (a) (/ ,x a)))
(defss x-div-inv-ss   #/^\/(\d+)$/ (x) `(fn (a) (/ a ,x)))

(mac rand-choice exprs
  (let l (len exprs)
    `(case (rand ,l)
       ,@(mappend list (range 0 (- l 1)) exprs))))

(mac n-of (n expr)
  (w/uniq ga
    `(let ,ga nil
       (repeat ,n (push ,expr ,ga))
       (nrev ,ga))))

(def rand-string (n (o src "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"))
  (withs (l (len src)
          a (accum acc (repeat n (acc (src (rand l))))))
    (coerce a 'string)))

(mac on (var s . body)
  (if (is var 'index)
    (err "Can't use index as first arg to on.")
    (w/uniq gs
      `(let ,gs ,s
         (forlen index ,gs
                 (let ,var (,gs index)
                   ,@body))))))

(def best (f seq)
  (if (no seq)
      nil
      (let wins (car seq)
        (each elt (cdr seq)
          (if (f elt wins) (= wins elt)))
        wins)))

(def most (f seq)
  (if seq
    (withs (wins (car seq) topscore (f wins))
      (each elt (cdr seq)
        (let score (f elt)
          (if (> score topscore) (= wins elt topscore score))))
      wins)))

; Insert so that list remains sorted.  Don't really want to expose
; these but seem to have to because can't include a fn obj in a
; macroexpansion.

(def insert-sorted (test elt seq)
  (if (no seq)
       (list elt)
      (test elt (car seq))
       (cons elt seq)
      (cons (car seq) (insert-sorted test elt (cdr seq)))))

(mac insort (test elt seq)
  `(zap [insert-sorted ,test ,elt _] ,seq))

(def reinsert-sorted (test elt seq)
  (if (no seq)
       (list elt)
      (is elt (car seq))
       (reinsert-sorted test elt (cdr seq))
      (test elt (car seq))
       (cons elt (rem elt seq))
      (cons (car seq) (reinsert-sorted test elt (cdr seq)))))

(mac insortnew (test elt seq)
  `(zap [reinsert-sorted ,test ,elt _] ,seq))

; Could make this look at the sig of f and return a fn that took the
; right no of args and didn't have to call apply (or list if 1 arg).

(def memo (f)
  (let cache (table)
    (fn args
      (aif (cache args) (car it)
           (ret res (apply f args)
             (= (cache args) (list res)))))))

(mac defmemo (name parms . body)
  `(assign ,name (memo (rfn ,name ,parms ,@body))))

; a version of readline that accepts both lf and crlf endings
; adapted from Andrew Wilcox's code (http://awwx.ws/readline) by Michael
; Arntzenius <daekharel@gmail.com>

(def sum (f xs)
  (let n 0
    (each x xs (++ n (f x)))
    n))

(def treewise (f base tree)
  (if (atom tree)
      (base tree)
      (f (treewise f base (car tree))
         (treewise f base (cdr tree)))))

; Could prob be generalized beyond printing.

(def prall (elts (o init "") (o sep ", "))
  (when elts
    (pr init (car elts))
    (map [pr sep _] (cdr elts))
    elts))

(def prs args
  (prall args "" " "))

(def tree-subst (old new tree)
  (if (is tree old)
      new
      (atom tree)
      tree
      (cons (tree-subst old new (car tree))
            (tree-subst old new (cdr tree)))))

(def ontree (f tree)
  (f tree)
  (unless (atom tree)
    (ontree f (car tree))
    (ontree f (cdr tree))))

(def dotted (x)
  (if (atom x)
    nil
    (and (cdr x) (or (atom (cdr x))
                     (dotted (cdr x))))))

(def fill-table (table data)
  (each (k v) (pair data) (= (table k) v))
  table)

(def keys (h)
  (accum a (each (k v) h (a k))))

(def vals (h)
  (accum a (each (k v) h (a v))))

(def tablist (h)
  (accum a (maptable (fn args (a args)) h)))

(def listtab (al)
  (let h (table)
    (map (fn ((k v)) (= (h k) v))
         al)
    h))

(mac obj args
  `(listtab (list ,@(map (fn ((k v))
                           `(list ',k ,v))
                         (pair args)))))

(def copy (x . args)
  (ret ans (case type.x
             sym    x
             int    x
             num    x
             string x
             cons   (cons (copy car.x) (copy cdr.x))
             table  (ret new (table)
                      (each (k v) x
                        (= new.k copy.v)))
             (err "Can't copy ( TODO copy constructor ) " x))
    (map (fn ((k v)) (= ans.k v))
         pair.args)))

(def shr (n m)
  (shl n (- m)))

(def abs (n)
  (if (< n 0) (- n) n))

; The problem with returning a list instead of multiple values is that
; you can't act as if the fn didn't return multiple vals in cases where
; you only want the first.  Not a big problem.

(def round (n)
  (withs (base (trunc n) rem (abs (- n base)))
    (if (> rem 1/2) ((if (> n 0) + -) base 1)
        (< rem 1/2) base
        (odd base)  ((if (> n 0) + -) base 1)
                    base)))

(def roundup (n)
  (withs (base (trunc n) rem (abs (- n base)))
    (if (>= rem 1/2)
      ((if (> n 0) + -) base 1)
      base)))

(def nearest (n quantum)
  (* (roundup (/ n quantum)) quantum))

(def avg (ns) (/ (apply + ns) (len ns)))

(def med (ns (o test >))
  ((sort test ns) (round (/ (len ns) 2))))

; Use mergesort on assumption that mostly sorting mostly sorted lists
; benchmark: (let td (n-of 10000 (rand 100)) (time (sort < td)) 1)

(def sort (test seq)
  (if (alist seq)
    (mergesort test (copy seq))
    (coerce (mergesort test (coerce seq 'cons)) (type seq))))

; Destructive stable merge-sort, adapted from slib and improved
; by Eli Barzilay for MzLib; re-written in Arc.

(def mergesort (less? lst)
  (with (n (len lst))
    (if (<= n 1) lst
        ; ; check if the list is already sorted
        ; ; (which can be a common case, eg, directory lists).
        ; (let loop ([last (car lst)] [next (cdr lst)])
        ;   (or (null? next)
        ;       (and (not (less? (car next) last))
        ;            (loop (car next) (cdr next)))))
        ; lst
        ((afn (n)
           (if (> n 2)
                ; needs to evaluate L->R
                (withs (j (/ (if (even n) n (- n 1)) 2) ; faster than round
                        a (self j)
                        b (self (- n j)))
                  (merge less? a b))
               ; the following case just inlines the length 2 case,
               ; it can be removed (and use the above case for n>1)
               ; and the code still works, except a little slower
               (is n 2)
                (with (x (car lst) y (cadr lst) p lst)
                  (= lst (cddr lst))
                  (when (less? y x) (scar p y) (scar (cdr p) x))
                  (scdr (cdr p) nil)
                  p)
               (is n 1)
                (with (p lst)
                  (= lst (cdr lst))
                  (scdr p nil)
                  p)
               nil))
         n))))

; Also by Eli.

(def merge (less? x y)
  (if (no x) y
      (no y) x
      (let lup nil
        (assign lup
                (fn (r x y r-x?) ; r-x? for optimization -- is r connected to x?
                  (if (less? (car y) (car x))
                    (do (if r-x? (scdr r y))
                        (if (cdr y) (lup y x (cdr y) nil) (scdr y x)))
                    ; (car x) <= (car y)
                    (do (if (no r-x?) (scdr r x))
                        (if (cdr x) (lup x (cdr x) y t) (scdr x y))))))
        (if (less? (car y) (car x))
          (do (if (cdr y) (lup y x (cdr y) nil) (scdr y x))
              y)
          ; (car x) <= (car y)
          (do (if (cdr x) (lup x (cdr x) y t) (scdr x y))
              x)))))

(def bestn (n f seq)
  (firstn n (sort f seq)))

(def split (seq pos)
  (list (cut seq 0 pos) (cut seq pos)))

(mac time (expr)
  (w/uniq (t1 t2)
    `(let ,t1 (msec)
       (do1 ,expr
            (let ,t2 (msec)
              (prn "time: " (- ,t2 ,t1) " msec."))))))

(mac jtime (expr)
  `(do1 'ok (time ,expr)))

(mac time10 (expr)
  `(time (repeat 10 ,expr)))

(def number (n) (in (type n) 'int 'num))

(def since (t1) (- (seconds) t1))

(def minutes-since (t1) (/ (since t1) 60))
(def hours-since (t1)   (/ (since t1) 3600))
(def days-since (t1)    (/ (since t1) 86400))

; could use a version for fns of 1 arg at least

(def cache (timef valf)
  (with (cached nil gentime nil)
    (fn ()
      (unless (and cached (< (since gentime) (timef)))
        (= cached  (valf)
           gentime (seconds)))
      cached)))

(mac defcache (name lasts . body)
  `(safeset ,name (cache (fn () ,lasts)
                         (fn () ,@body))))

(mac errsafe (expr)
  `(on-err (fn (c) nil)
           (fn () ,expr)))

(def saferead (arg) (errsafe:read arg))

(def safe-load-table (filename)
  (or (errsafe:load-table filename)
      (table)))

;(def ensure-dir (path)
;  (unless (dir-exists path)
;    (system (string "mkdir -p " path))))

(def date ((o s (seconds)))
  (rev (nthcdr 3 (timedate s))))

(def datestring ((o s (seconds)))
  (let (y m d) (date s)
    (string y "-" (if (< m 10) "0") m "-" (if (< d 10) "0") d)))

(def count (test x)
  (with (n 0 testf (testify test))
    (each elt x
      (if (testf elt) (++ n)))
    n))

(def ellipsize (str (o limit 80))
  (if (<= (len str) limit)
    str
    (+ (cut str 0 limit) "...")))

(def rand-elt (seq)
  (seq (rand (len seq))))

(mac until (test . body)
  `(while (no ,test) ,@body))

(def before (x y seq (o i 0))
  (with (xp (pos x seq i) yp (pos y seq i))
    (and xp (or (no yp) (< xp yp)))))

(def orf fns
  (fn args
    ((afn (fs)
       (and fs (or (apply (car fs) args) (self (cdr fs)))))
     fns)))

(def andf fns
  (fn args
    ((afn (fs)
       (if (no fs)       t
           (no (cdr fs)) (apply (car fs) args)
                         (and (apply (car fs) args) (self (cdr fs)))))
     fns)))

(def atend (i s)
  (> i (- (len s) 2)))

(def multiple (x y)
  (is 0 (mod x y)))

(mac nor args `(no (or ,@args)))
(mac nand args `(no (and ,@args)))

; Consider making the default sort fn take compare's two args (when do
; you ever have to sort mere lists of numbers?) and rename current sort
; as prim-sort or something.

; Could simply modify e.g. > so that (> len) returned the same thing
; as (compare > len).

(def compare (comparer scorer)
  (fn (x y) (comparer (scorer x) (scorer y))))

; Cleaner thus, but may only ever need in 2 arg case.

;(def compare (comparer scorer)
;  (fn args (apply comparer map scorer args)))

; (def only (f g . args) (aif (apply g args) (f it)))

(def only (f)
  (fn args (if (car args) (apply f args))))

(mac conswhen (f x y)
  (w/uniq (gf gx)
   `(with (,gf ,f ,gx ,x)
      (if (,gf ,gx) (cons ,gx ,y) ,y))))

; Could combine with firstn if put f arg last, default to (fn (x) t).

(def retrieve (n f xs)
  (if (no n)                 (keep f xs)
      (or (<= n 0) (no xs))  nil
      (f (car xs))           (cons (car xs) (retrieve (- n 1) f (cdr xs)))
                             (retrieve n f (cdr xs))))
(def single (x) (and (acons x) (no (cdr x))))

(def intersperse (x ys)
  (and ys (cons (car ys)
                (mappend [list x _] (cdr ys)))))

(def counts (seq)
  (ret ans (table)
    (each x seq
      (++ (ans x 0)))))

(def tree-counts (tree)
  (counts flat.tree))

(def commonest (seq)
  (best (compare > counts.seq) seq))

(def sort-by-commonest (seq (o f idfn))
  (let h (counts:map f seq)
    (sort (compare > h:f) seq)))

(def reduce (f xs)
  (if (cddr xs)
    (reduce f (cons (f (car xs) (cadr xs)) (cddr xs)))
    (apply f xs)))

(def rreduce (f xs)
  (if (cddr xs)
    (f (car xs) (rreduce f (cdr xs)))
    (apply f xs)))

(def positive (x)
  (and (number x) (> x 0)))

(mac w/table (var . body)
  `(let ,var (table) ,@body ,var))

(def median (ns)
  ((sort > ns) (trunc (/ (len ns) 2))))

(mac noisy-each (n var val . body)
  (w/uniq (gn gc)
    `(with (,gn ,n ,gc 0)
       (each ,var ,val
         (when (multiple (++ ,gc) ,gn)
           (pr ".")
           (flushout)
           )
         ,@body)
       (prn)
       (flushout))))

(mac point (name . body)
  (w/uniq (g p)
    `(ccc (fn (,g)
            (let ,name (fn ((o ,p)) (,g ,p))
              ,@body)))))

(mac catch body
  `(point throw ,@body))

(def downcase (x)
  (let downc (fn (c)
               (let n (coerce c 'int)
                 (if (or (< 64 n 91) (< 191 n 215) (< 215 n 223))
                   (coerce (+ n 32) 'char)
                   c)))
    (case (type x)
      string (map downc x)
      char   (downc x)
      sym    (if x (sym (map downc (coerce x 'string))))
             (err "Can't downcase" x))))

(def upcase (x)
  (let upc (fn (c)
             (let n (coerce c 'int)
               (if (or (< 96 n 123) (< 223 n 247) (< 247 n 255))
                 (coerce (- n 32) 'char)
                 c)))
    (case (type x)
      string (map upc x)
      char   (upc x)
      ; it's arguable whether (upcase nil) should be nil or NIL, but pg has
      ; chosen NIL, so in the name of compatibility:
      sym    (if x (sym (map upc (coerce x 'string))) 'NIL)
             (err "Can't upcase" x))))

(def inc (x (o n 1))
  (coerce (+ (coerce x 'int) n) (type x)))

(def range (start end)
  (if (> start end)
    nil
    (cons start (range (inc start) end))))

(def mismatch (s1 s2)
  (catch
    (on c s1
      (when (isnt c (s2 index))
        (throw index)))))

(def memtable (ks)
  (let h (table)
    (each k ks (set (h k)))
    h))

(= bar* " | ")

(mac w/bars body
  (w/uniq (out needbars)
    `(let ,needbars nil
       (do ,@(map (fn (e)
                    `(let ,out (tostring ,e)
                       (unless (is ,out "")
                         (if ,needbars
                           (pr bar* ,out)
                           (do (set ,needbars)
                               (pr ,out))))))
                  body)))))

(def len< (x n) (< (len x) n))

(def len> (x n) (> (len x) n))

(mac trav (x . fs)
  (w/uniq g
    `((afn (,g)
        (when ,g
          ,@(map [list _ g] fs)))
      ,x)))

(mac or= (place expr)
  (let (binds val setter) (setforms place)
    `(withs ,binds ; atwiths
       (or ,val (,setter ,expr)))))

(= vtables* (table))
(mac defgeneric(name args . body)
  `(do
     (or= (vtables* ',name) (table))
     (def ,name allargs
       (aif (aand (vtables* ',name) (it (type car.allargs)))
            (apply it allargs)
            (aif (pickles* (type car.allargs))
                 (apply ,name (map it allargs))
                 (let ,args allargs
                   ,@body))))))

(mac defmethod(name args type . body)
  `(= ((vtables* ',name) ',type)
      (fn ,args
        ,@body)))

(= pickles* (table))
(mac pickle(type f)
  `(= (pickles* ',type)
      ,f))

(mac evtil (expr test)
  (w/uniq gv
    `(let ,gv ,expr
       (while (no (,test ,gv))
         (= ,gv ,expr))
       ,gv)))

(def rand-key (h)
  (if (empty h)
    nil
    (let n (rand (len h))
      (catch
        (each (k v) h
          (when (is (-- n) -1)
            (throw k)))))))

(def ratio (test xs)
  (if (empty xs)
      0
      (/ (count test xs) (len xs))))

(def butlast (x)
  (cut x 0 (- (len x) 1)))

(mac between (var expr within . body)
  (w/uniq first
    `(let ,first t
       (each ,var ,expr
         (if ,first
           (wipe ,first)
           ,within)
         ,@body))))

(def cars (xs) (map car xs))
(def cdrs (xs) (map cdr xs))

(mac mapeach (var lst . body)
  `(map (fn (,var) ,@body) ,lst))

(def gcd (a b)
  (if (is a b) a
      (> a b) (gcd (- a b) b)
      (> b a) (gcd a (- b a))))

(defss cxr-ss #/^c([ad]{5,})r$/ (xs)
       (let ac [case _ #\a 'car #\d 'cdr]
         `(let f (fn (x)
                   ,((afn (xs) (if xs `(,(ac car.xs) ,(self cdr.xs)) 'x))
                     (coerce (string xs) 'cons)))
            (fn-name f ',(coerce (+ 'c xs 'r) 'sym))
            f)))