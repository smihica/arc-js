(def exact (n) (if (is (type n) 'int) t))

(mac ns (name . body)
  (let x (uniq)
    `(let ,x (do (in-ns ',name) ,@body)
       (exit-ns)
       ,x)))
