(def exact (n) (if (is (type n) 'int) t))

(mac ns (name . body)
  (let x (uniq)
    `(let ,x (do (in-ns ',name) ,@body)
       (exit-ns)
       ,x)))

(mac compose (a b)
  (let x (uniq)
    `(fn (,x) (,a (,b ,x)))))
