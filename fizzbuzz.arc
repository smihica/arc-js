(def fizzbuzz (limit)
  (for x 1 limit
    (prn
      (aif (mappend [if (is 0 (arc.math::mod x car._)) cdr._] '((3 Fizz) (5 Buzz)))
           (string it)
           x))))