(ns (defns "arc.unit"
           :export desc
           :import arc.time))

(mac log xs
  `(prn (newstring (* depth 4) #\ )
        ,@(intersperse " " xs)))

(def test (test-name tester a b depth ns filter)
  (withs (a-res (filter (eval a ns))
          b-res (eval b ns)
          res   (tester a-res b-res))
    (when (no res)
      (log "*** Fail" test-name tester :target a :expected b-res :target-res a-res))
    (no res)))

(def isont (a b) (no (iso a b)))

(def runner (tests lex-ns)
  (set-timer
    (fn ()
      (with (time-all 0 tests-all 0 succ-all 0)
        (prn (len tests) " tests will go ...")
        ((afn (tests depth ns filter in-test in-cond)
           (aif (car tests)
                (if (acons it)
                    (if (and in-test in-cond)
                        (if (test in-test in-cond (car tests) (cadr tests) depth ns filter)
                            t
                            (self (cddr tests) depth ns filter in-test in-cond))
                        in-test
                        (if (in (car it) is iso isnt isont)
                            (if (self (cdr it) depth ns filter in-test (car it))
                                t
                                (self (cdr tests) depth ns filter in-test nil))
                            (err 'unknown-cond))
                        (case (car it)
                          desc (do (log "IN" (cadr it))
                                   (self (+ (cddr it)
                                            `((restore ,depth ,ns ,filter))
                                            (cdr tests))
                                         (+ depth 1) ns filter nil nil))
                          test (do
                                 (let start (msec)
                                   (unless (self (cddr it) depth ns filter (cadr it) nil)
                                     (let time (- (msec) start)
                                       (++ time-all time)
                                       (++ succ-all)
                                       (log "[OK]" (cadr it) "in" time "ms"))))
                                 (++ tests-all)
                                 (set-timer self 0 nil (cdr tests) depth ns filter nil nil))
                          restore (self (cdr tests) (cadr it) (caddr it) (cadddr it) nil nil)
                          (err 'unknown-type)))
                    (case it
                      :ns (self (cddr tests) depth (cadr tests) filter in-test in-cond)
                      :f  (self (cddr tests) depth ns (cadr tests) in-test in-cond)
                      (err 'unknown-option)))
                (when (no (or in-test in-cond))
                  (prn "\n ** total " time-all " ms passed. "
                       "succ/fail/all => " succ-all "/" (- tests-all succ-all) "/" tests-all))))
         tests 0 lex-ns idfn nil nil)
        ))
    0))

(def expand-desc (d)
  (list
    'quasiquote
    (list (+ (list 'desc (car d))
             ((afn (d cond acc)
                (if (no d)
                    (nrev acc)
                    (if (is (car d) :f)
                        (self (cddr d) cond (cons (list 'unquote (cadr d)) (cons :f acc)))
                        cond
                        (self (cddr d) cond (cons (cadr d) (cons (car d) acc)))
                        (acons (car d))
                        (let it (car d)
                          (if (in (car it) 'is 'iso 'isnt 'isont)
                              (self (cdr d)
                                    nil
                                    (cons
                                      (+ (list (eval (car it)))
                                         (self (cdr it) t nil))
                                      acc))
                              (self (cdr d)
                                    nil
                                    (cons
                                      (+ (list (car it) (cadr it))
                                         (self (cddr it) nil nil))
                                      acc))))
                        (self (cddr d) nil (cons (cadr d) (cons (car d) acc))))))
              (cdr d) nil nil)))))

(mac desc defs
  `(arc.unit::runner
     ,(expand-desc defs)
     (***lex-ns***)))

;; (desc "ABC test1"
;;       :ns arc.compiler
;;       :f string
;;       (desc "ABC test 10"
;;             :ns arc.compiler
;;             (test "should return -1 when the value is not present"
;;                   (is
;;                     :f string
;;                     (+ 1 2) "3")))
;;       (test "should xxx"))
;; =>
;; (runner
;;   `((desc "ABC test1"
;;           :ns arc.compiler
;;           :f ,string
;;           (desc "ABC test 10"
;;                 :ns arc.compiler
;;                 (test "should return -1 when the value is not present"
;;                       (,is
;;                         :f ,string
;;                         (+ 1 2) "3")))
;;           (test "should xxx")))
;;   (***lex-ns***))