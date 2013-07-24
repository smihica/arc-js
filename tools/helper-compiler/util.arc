(mac reccase (expr . pats)
  (withs (p (split pats (- (len pats) 1))
          f (car p) l (cadr p))
    `(case (car ,expr)
       ,@(+ (mappend
              (fn (pat) `(,(car pat) (apply (fn ,@(cdr pat)) (cdr ,expr))))
              f)
            l))))

(def set-minus (s1 s2)
  (if s1
      (if (mem (car s1) s2)
          (set-minus (cdr s1) s2)
          (cons (car s1) (set-minus (cdr s1) s2)))))

(def set-intersect (s1 s2)
  (if s1
      (if (mem (car s1) s2)
          (cons (car s1) (set-intersect (cdr s1) s2))
          (set-intersect (cdr s1) s2))))

(= primitives (list (cons 'nil nil)
                    (cons '+ +) (cons '- -) (cons '* *) (cons '/ /)
                    (cons '< <) (cons '> >) (cons '<= <=) (cons '>= >=)
                    (cons 'no no) (cons 'is is)))

(def dotted-to-proper (l)
  (if (no l) nil
      (atom l) (cons l nil)
      (cons (car l) (dotted-to-proper (cdr l)))))

(def dotted-pos (lis)
  ((afn (l n)
     (if (no l) -1
         (atom l) n
         (self (cdr l) (inc n))))
   lis 0))
