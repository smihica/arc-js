(def nthcdr (n lis)
  (if (< n 1) lis (nthcdr (- n 1) (cdr lis))))

(def consif (n lis)
  (if n (cons n lis) lis))

(def firstn (n lis)
  (if (and lis (< 0 n))
      (cons (car lis) (firstn (- n 1) (cdr lis)))))

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

(def inc (i) (+ i 1))
(def dec (i) (- i 1))