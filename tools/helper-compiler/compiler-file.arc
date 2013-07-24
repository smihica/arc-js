(load "/Users/smihica/code/darc/js/compiler/compiler.arc")

(def arc-compiler ()
  (whilet exp (read)
    (let asm (do-compile exp)
      (write asm)
      (prn))))

(arc-compiler)
