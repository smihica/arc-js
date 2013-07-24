(def %mem-fn (test seq)
  ((afn (seq)
     (if seq
         (if (test (car seq)) seq
             (self (cdr seq)))))
   seq))

(def %pos-fn (test seq)
  ((afn (seq i)
     (if seq
         (if (test (car seq)) i
             (self (cdr seq) (+ i 1)))))
   seq 0))

(def %union-fn (test lis1 lis2) nil)

(def flat (lis)
  (if (is (type lis) 'cons) (mappend flat lis)
      lis                   (cons lis nil)))

(def keep (f lis)
  (mappend (%shortfn (if (f _) (cons _ nil))) lis))

(def map (f lis)
  ((afn (lis acc)
     (if lis
         (self (cdr lis) (cons (f (car lis)) acc))
         (nrev acc)))
   lis nil))

(def mappend (f lis)
  (let mapped
      ((afn (lis acc)
         (if lis
             (self (cdr lis) (cons (f (car lis)) acc))
             (nrev acc)))
       lis nil)
    (if mapped (apply + mapped))))

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

(def inc (i) (+ i 1))
(def dec (i) (- i 1))