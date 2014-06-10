(import arc.time)

(let last nil
  (def cleanup-line () (= last nil))
  (def draw-line (x y)
    (when last (js-draw-line COLOR car.last cdr.last x y))
    (= last (cons x y))))

(= timer-id nil)

(def lorenz (x y z i)
  (draw-line x z)
  (if (> i 0)
      (= timer-id
         (set-timer lorenz 5 nil
           (+ x (* D (* A (- y x))))
           (+ y (* D (- (* x (- B z)) y)))
           (+ z (* D (- (* x y) (* C z))))
           (- i 1)))))

(def main (r g b a _a _b _c _d n)
  (when timer-id (clear-timer timer-id))
  (cleanup-line)
  (= A _a B _b C _c D _d COLOR (+ "rgba(" r "," g "," b "," a ")"))
  (lorenz 1.0 1.0 1.0 n))