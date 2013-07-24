(def nthcdr (n lis)
  (if (< n 1) lis (nthcdr (- n 1) (cdr lis))))

(def consif (n lis)
  (if n (cons n lis) lis))

(def firstn (n lis)
  (if (and lis (< 0 n))
      (cons (car lis) (firstn (- n 1) (cdr lis)))))