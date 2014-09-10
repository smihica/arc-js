(ns (defns "user.server"))

(= *url* (table))

;; entry point from js.
(def exec-url (uri method data headers)
  (pair
    (aif (*url* (list method uri))
         (list "code" 200
               "body" (apply it data headers)
               "Content-Type" "text/html")
         (list "code" 404
               "body" (+ uri " is not Found.")
               "Content-Type" "text/plain"))))

(def simple-render (lis)
  ;; '(html (body (h1 "x")))
  ;; =>  <html><body><h1>x</h1></body></html>
  (if (atom lis) lis
      (let c car.lis
        (if (isa c 'sym)
            (+ "<" c ">" (string:map [simple-render _] cdr.lis) "</" c ">")
            (isa c 'cons)
            (string:map [simple-render _] lis)))))

(def mappendtable (f tbl)
  (let l (coerce tbl 'cons)
    (mappend [f car._ cadr._] l)))

(defgeneric table-to-html (obj) (string obj))
(defmethod table-to-html (obj) cons
  `(li ,@(map1 (fn (i) `(li ,(table-to-html i))) obj)))
(defmethod table-to-html (obj) table
  `(dl ,@(mappendtable (fn (k v) `((dt ,k) (dd ,(table-to-html v)))) obj)))

(mac defpage (method path reqs . body)
  `(sref *url*
     (fn ,reqs (simple-render (do ,@body))) ;; this is demo, reqs is simply ignored.
     (list ',method ,(string path))))

(defpage GET /index (data headers)
  `(html
     (body
       (h1 ,"hello this is index-page.")
       (p  ,(+ "now is " (arc.time::msec))))))

(let times 0
  (defpage GET /page1 (data headers)
    `(html
       (body
         (h1 ,"this is page1")
         (p  ,(+ "You've accessed this page " (++ times) " times"))))))
