(load "/Users/smihica/code/arc-js/tools/helper-compiler/compiler.arc")

(= ops
   '(frame close test conti shift constant argument
     refer-let refer-local refer-free refer-global
     refer-nil refer-t enter-let exit-let assign-let assign-local assign-global
     box indirect apply return continue-return halt))

(mac _wrap body
  `(do (write (pos top ops))
       ,@(if body
             (cons
               '(pr ",")
               (intersperse '(pr ",") body)))
       (pr ",")))

(def arc-compiler ()
  (whilet exp (read)
    (let asm (do-compile exp)
      (pr "[")
      (each c asm
        (let top (car c)
          (reccase
            c
            (frame (ret)       (_wrap (pr ret)))
            (close (n v d b)   (_wrap (pr n) (pr v) (pr d) (pr b)))
            (test (n)          (_wrap (pr n)))
            (conti (n)         (_wrap (pr n)))
            (shift (n m)       (_wrap (pr n) (pr m)))
            (constant (obj)    (_wrap (write (tostring (write obj)))))
            (argument ()       (_wrap))
            (refer-let (n m)   (_wrap (pr n) (pr m)))
            (refer-local (n)   (_wrap (pr n)))
            (refer-free  (n)   (_wrap (pr n)))
            (refer-global (n)  (_wrap (write (string n))))
            (refer-nil ()      (_wrap))
            (refer-t ()        (_wrap))
            (enter-let ()      (_wrap))
            (exit-let (n)      (_wrap (pr n)))
            (assign-let (n m)  (_wrap (pr n) (pr m)))
            (assign-local (n)  (_wrap (pr n)))
            (assign-free  (n)  (_wrap (pr n)))
            (assign-global (n) (_wrap (write (string n))))
            (box (n)           (_wrap (pr n)))
            (indirect ()       (_wrap))
            (apply ()          (_wrap))
            (return (n)        (_wrap (pr n)))
            (halt ()           (_wrap))
            nil)))
      (pr "],")
      (prn))))

(arc-compiler)
