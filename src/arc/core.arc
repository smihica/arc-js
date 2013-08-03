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
  (mappend [if (f _) (cons _ nil)] lis))

(def map1 (f lis)
  ((afn (lis acc)
     (if lis
         (self (cdr lis) (cons (f (car lis)) acc))
         (nrev acc)))
   lis nil))

(def map (f . seqs)
  (if (mem [isa _ 'string] seqs)
      (withs (n   (apply min (map len seqs))
              new (newstring n))
        ((afn (i)
           (if (is i n)
               new
               (do (sref new (apply f (map [_ i] seqs)) i)
                   (self (+ i 1)))))
         0))

      (no (cdr seqs))
      (map1 f (car seqs))

      ((afn (seqs)
         (if (mem no seqs)
             nil
             (cons (apply f (map1 car seqs))
                   (self (map1 cdr seqs)))))
       seqs)))

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