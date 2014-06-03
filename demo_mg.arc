(ns (or (find-ns 'demo_mg) (defns demo_mg :import arc.time)))

(= all-dirs '(a b l r))

(def dig1 ((y . x))
  (draw-dig (* x ls) (* y ls) ls ls)
  (sref (maze y) nil x)
  (cons y x))

(def dir-pos ((y . x) d n)
  (case d
    a (cons (- y n) x) b (cons (+ y n) x)
    l (cons y (- x n)) r (cons y (+ x n))))

(def can-dig? (pos d)
  (let (y . x) (dir-pos pos d 2)
    (and (<= 0 y) (< y h) (<= 0 x) (< x w) ((maze y) x))))

(def rget (g) (let x (rand-elt g) (cons x (rem x g))))

(def ndir (d) (rem (case d a 'b b 'a l 'r r 'l) all-dirs))

(def dig (pos d)
  (dig1 (dir-pos pos d 1))
  (dig1 (dir-pos pos d 2)))

(def iter (pos d diggable)
  (if diggable
      (if d
          (let (p . rest) (rget d)
            (if (can-dig? pos p)
                (let np (dig pos p)
                  (set-timer iter 0 nil
                    np (ndir p) (cons np diggable)))
                (iter pos rest diggable)))
          (let (p . rest) (rget diggable)
            (iter p all-dirs rest)))))

(def main (size)
  (= h size) (= w size)
  (= maze (n-of h (n-of w t)))
  (dig1 '(1 . 1))
  (iter '(1 . 1) all-dirs '((1 . 1))))
