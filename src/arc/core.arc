;; (def nthcdr (n lis)
;;   (if (< n 1) lis (nthcdr (- n 1) (cdr lis))))

;; (def consif (n lis)
;;   (if n (cons n lis) lis))

;; (def firstn (n lis)
;;   (if (and lis (< 0 n))
;;       (cons (car lis) (firstn (- n 1) (cdr lis)))))


;(def mappend (f lis)
;  (let mapped
;      ((afn (lis acc)
;         (if lis
;             (self (cdr lis) (cons (f (car lis)) acc))
;             (nrev acc)))
;       lis nil)
;    (if mapped (apply + mapped))))