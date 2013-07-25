(load "/Users/smihica/code/arc-js/tools/helper-compiler/compiler.arc")

(defop arc-compiler req
       (let asm (do-compile (read (alref (req 'args) "code")))
         (prn "(")
         (each c asm
           (write c)
           (prn))
         (pr ")")))

(serve 8800)
