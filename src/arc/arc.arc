(def exact (n) (if (is (type n) 'int) t))

(mac ns (name . body)
  (let x (uniq)
    `(let ,x (do (in-ns ',name) ,@body)
       (exit-ns)
       ,x)))

(mac compose (a b)
  (let x (uniq)
    `(fn (,x) (,a (,b ,x)))))

;(mac make-br-fn (body) `(fn (_) ,body))

(def assoc (key al)
  (if (atom al)
      nil
      (and (acons (car al)) (is (caar al) key))
      (car al)
      (assoc key (cdr al))))

;; !! differ from anarki
(def alref (key al) (cadr (assoc key al)))

(def join args
  (if (no args) nil
      (let a (car args)
        (if (no a)
            (apply join (cdr args))
            (cons (car a) (apply join (cdr a) (cdr args)))))))

(def isnt (x y) (no (is x y)))

(def alist (x) (or (no x) (is (type x) 'cons)))

;; set-fn-name
;; set-fn-name
;; get-fn-name
;; get-fn-name

;; ?? is this name adequate?
(mac ret (var val . body)
  `(let ,var ,val ,@body ,var))

;; ??
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
  ((afn (i)
     (and (< i (len s))
          (or (test i)
              (self (+ i 1)))))
   start))

(def testify (x)
  (if (isa x 'fn) x [iso _ x]))

(def carif (x) (if (atom x) x (car x)))

(def some (test seq)
  (let f (testify test)
    (if (isa seq 'string)
        (recstring f:seq seq)
        (reclist f:carif seq))))

(def all (test seq)
  (~some (complement (testify test)) seq))

;;mem -> prim

