(ns (defns "arc.unit"
           :export desc
           :import arc.time))

(mac log xs
  `(prn (newstring (* depth 4) #\ )
        ,@(intersperse " " xs)))

(def unit-do xs xs)

(def isont (a b) (no (iso a b)))

(def test (test-name tester a b depth ns filter)
  (if (is tester unit-do)
      (do (eval a ns) (eval b ns) nil)
      (withs (a-res (filter (eval a ns))
              b-res (eval b ns)
              res   (tester a-res b-res))
        (when (no res)
          (log "*** Fail" test-name tester :target a :expected b-res :target-res a-res))
        (no res))))

(def runner (tests lex-ns)
  (set-timer
    (fn ()
      (with (time-all 0 tests-all 0 succ-all 0)
        (prn "")
        ((afn (tests depth ns filter in-test in-cond)
           (aif (car tests)
                (if (or (acons it) (~keywordp it))
                    (if (and in-test in-cond)
                        (if (test in-test in-cond (car tests) (cadr tests) depth ns filter)
                            t
                            (self (cddr tests) depth ns filter in-test in-cond))
                        in-test
                        (if (in (car it) is iso isnt isont unit-do)
                            (if (self (cdr it) depth ns filter in-test (car it))
                                t
                                (self (cdr tests) depth ns filter in-test nil))
                            (err 'unknown-cond))
                        (case (car it)
                          desc (do (log "IN ->" (cadr it))
                                   (prn "")
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
                                 (let next (if (in (caadr tests) 'desc 'restore) (cons '(prn "") (cdr tests)) (cdr tests))
                                   (set-timer self 0 nil next depth ns filter nil nil)))
                          restore (self (cdr tests) (cadr it) (caddr it) (cadddr it) nil nil)
                          prn (do
                                (apply prn (cdr it))
                                (self (cdr tests) depth ns filter nil nil))
                          (err 'unknown-type)))
                    (case it
                      :ns (self (cddr tests) depth (cadr tests) filter in-test in-cond)
                      :f  (self (cddr tests) depth ns (cadr tests) in-test in-cond)
                      (err (+ 'unknown-option " " it))))
                (when (no (or in-test in-cond))
                  (prn "** " tests-all " tests done. succ/fail => " succ-all "/" (- tests-all succ-all)
                       " in " time-all " ms"))))
         tests 0 lex-ns idfn nil nil)))
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
                          (if (in (car it) 'is 'iso 'isnt 'isont 'do)
                              (self (cdr d)
                                    nil
                                    (cons
                                      (+ (if (is (car it) 'do)
                                             (list unit-do)
                                             (list (eval (car it) (***lex-ns***))))
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