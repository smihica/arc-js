;; Don't use this code as production.
;; This is a toy.

(ns (defns "user.server"))

(= *url* (table))

;; entry point from js.
(def exec-url (uri)
  (pair
    (aif (*url* uri)
         (list "code" 200
               "body" (apply it nil)
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

(mac defpage (url reqs . body)
  `(sref *url*
     (fn ,reqs (simple-render (do ,@body))) ;; this is demo, reqs is simply ignored.
     ,(string url)))

(defpage /index ()
  `(html
     (body
       (h1 ,"hello this is index-page.")
       (p  ,(+ "now is " (arc.time::msec))))))

(let times 0
  (defpage /page1 ()
    `(html
       (body
         (h1 ,"this is page1")
         (p  ,(+ "You've accessed this page " (++ times) " times"))))))
