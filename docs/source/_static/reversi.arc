(import "arc.time")

(= ev-depth 3)  ;; depth of searching
(= ev-space 10) ;; space of searching

(mac keying (x y)
  `(+ ,x "-" ,y))

(mac unkeying (key)
  (w/uniq key-s
    `(let ,key-s ,key
       (cons (int:string (,key-s 0))
             (int:string (,key-s 2))))))

(mac invert (color)
  `(if (is ,color 'w) 'b 'w))

(mac getxy (k board) `(,board ,k))

(def setxy (k board color (o copy? t))
  (let rt (if copy? (copy board) board)
    (= (rt k) color)))

(def setxy-multiple (k-list board color (o copy? t))
  (let rt (if copy? (copy board) board)
    ((afn (ks)
       (if ks
           (do
             (setxy (car ks) rt color nil)
             (self (cdr ks)))
           rt))
     k-list)))

(def list-to-table (lis)
  (with (rt {} x 0 y 0)
    (map (fn (l)
           (map (fn (c)
                  (= (rt (keying x y)) c)
                  (++ x))
                l)
           (= x 0)
           (++ y))
         lis)
    rt))

(= ev-tbl
   (list-to-table
     '((400 -2  4  0  0  4 -2  400)
       ( -2 -50 0  0  0  0 -50 -2)
       (  4  0  4  0  0  4  0  4)
       (  0  0  0  0  0  0  0  0)
       (  0  0  0  0  0  0  0  0)
       (  4  0  4  0  0  4  0  4)
       ( -2 -50 0  0  0  0 -50 -2)
       (400 -2  4  0  0  4 -2  400))))

(= positions-all
   (map (fn (x)
          (map (fn (y) (keying x y))
               (range 0 7)))
        (range 0 7)))

(def get-around-position-1 (k n)
  (with (fs      (list [- _ n] idfn [+ _ n])
         (x . y) (unkeying k))
    (rem
      k
      (mappend
        (fn (f1)
          (map
            (fn (f2)
              (with (x (f1 x) y (f2 y))
                (if (and (< -1 x 8) (< -1 y 8))
                    (keying x y))))
            fs))
        fs))))

(let memo {}
  (def get-around-positions (k)
    (aif (memo k)
         it
         (ret rt
             (rem nil
                  (apply map
                         (compose [rem nil _] list)
                         (map (fn (n) (get-around-position-1 k n)) (range 1 7))))
           (= (memo k) rt)))))

(mac collect-around-positions (k board . options)
  (w/uniq (board-s)
    `(with (,board-s ,board)
       (mappend
         (fn (ks)
           ((afn (ks acc)
              (if ks
                  (let pos-color (getxy (car ks) ,board-s)
                    (if ,@(mappend
                            (fn (opt)
                              `((is pos-color ,(car opt))
                                ,(case (cadr opt)
                                   next              `(self (cdr ks) (cons (car ks) acc))
                                   return            `(if acc (list (car ks)))
                                   return-collecting `(nrev acc))))
                            (pair options))))))
            ks nil))
         (get-around-positions ,k)))))

(def get-possible-around-positions (k board color)
  (collect-around-positions
    k board
    (invert color) next
    color          return-collecting))

(def get-puttable-around-positions (k board color)
  (collect-around-positions
    k board
    (invert color) next
    'e             return))

(mac can-put? (k board color)
  (w/uniq (k-s board-s)
    `(with (,k-s ,k ,board-s ,board)
       (and (is (getxy ,k-s ,board-s) 'e)
            (get-possible-around-positions ,k-s ,board-s ,color)))))

(def get-all-positions-of-color (board color)
  (mappend
    (fn (l)
      (mappend
        (fn (k)
          (if (is (getxy k board) color)
              (cons k nil)))
        l))
    positions-all))

(def get-puttable-positions-all (board color)
  (let all-starts (get-all-positions-of-color board color)
    (dedup (mappend [get-puttable-around-positions _ board color] all-starts))))

(def put (k board color (o copy? t))
  (setxy-multiple
    (cons k (get-possible-around-positions k board color))
    board
    color
    copy?))

(def get-points (board color)
  (let all-starts (get-all-positions-of-color board color)
    (apply + (map ev-tbl all-starts))))

(def get-rand (l n)
  (if (> n 0)
      (if (>= n (len l))
          l
          (let x (rand-elt l)
            (cons x
                  (get-rand (rem x l) (- n 1)))))))

(def has-empty? (board)
  (find 'e (map cadr (coerce board 'cons))))

(def get-best (board color depth)
  ((afn (board color depth target-color alpha beta)
     (if (or (is depth 0)
             (no (has-empty? board))) ;; last-depth or game-set
         (list (get-points board target-color))
         (withs (my-turn      (is target-color color)
                 best-con     (if my-turn > <)
                 best-fn      (fn (a b) (best-con (car a) (car b)))
                 invert-color (invert color))
           (iflet
             puttable (get-puttable-positions-all board color)

             (ccc
               (fn (return)
                 (best
                   best-fn
                   (map
                     (fn (vp)
                       (let new-board (put vp board color)
                         (ret point-move (self new-board invert-color (- depth 1) target-color alpha beta)
                           (let point (car point-move)
                             (if my-turn
                                 (when (> point alpha)
                                   (= alpha point)
                                   (if (>= alpha beta)
                                       (return (cons beta vp))))  ;; alpha-cut
                                 (when (< point beta)
                                   (= beta point)
                                   (if (>= alpha beta)
                                       (return (cons alpha vp))))))  ;; beta-cut
                           (scdr point-move vp))))
                     (get-rand puttable ev-space))))) ;; cut-off if candidates are over space.

             (self board invert-color (- depth 1) target-color alpha beta))))) ;; pass

   board color depth color -inf.0 +inf.0))

(def count-color (board color)
  (len (get-all-positions-of-color board color)))

(def print-board (board)
  (for y 0 7
    (let str ""
      (for x 0 7
        (= str (+ str (case (board (keying x y))
          e "--"
          w "WW"
          b "BB"))))
      (js/log str)))
  (js/log ""))

(def make-new-board ()
  (list-to-table (n-of 8 (n-of 8 'e))))

(def init-board ()
  (let board (make-new-board)
    (setxy-multiple '("3-4" "4-3") board 'b nil)
    (setxy-multiple '("3-3" "4-4") board 'w nil)))

(def game ()
  (with (board (init-board)
         turn  'b
         n     0)

    (js/log "\n\n\n\n\n\n *** NEW GAME START *** \n\n")

    (while
      (has-empty? board)
      (print-board board)
      (js/log "")
      (js/log "TURN " n ": " (if (is turn 'b) "BLACK" "WHITE"))
      (js/log "POINT: " (get-points board turn))
      (let pos (cdr (get-best board turn ev-depth))
        (if pos
            (do
              (pr "PUT: " pos "\n")
              (put pos board turn nil))
            board))
      (= turn (invert turn))
      (++ n)
      (js/log ""))

    (with (wnum (count-color board 'w)
           bnum (count-color board 'b))
      (js/log "WHITE: " wnum)
      (js/log "BLACK: " bnum "\n\n")
      (js/log (if (> wnum bnum)
               " !!! WHITE won !!!\n\n"
               (> bnum wnum)
               " !!! BLACK won !!!\n\n"
               " !!! DRAW !!!\n\n")))))

(def draw-board (board)
  (js/clear-board)
  (for y 0 7
    (for x 0 7
         (case (board (keying x y))
           w (js/draw-stone x y "white")
           b (js/draw-stone x y "black")
           e "Noting to do"))))

(def turn1 (board turn n)
  (if (has-empty? board)
      (do1
        t
        (js/log "TURN " n ": " (if (is turn 'b) "BLACK" "WHITE"))
        (js/log "POINT: " (get-points board turn))
        (js/log "Searching... ")
        (let pos (cdr (get-best board turn ev-depth))
          (if pos
              (do
                (js/log "PUT: " pos)
                (put pos board turn nil)
                (draw-board board)
                (print-board board))
              board)))))

(def start-game ()
  (with (board (init-board)
         turn  'b
         n     0)

    (js/log "\n\n\n\n\n\n *** NEW GAME START *** \n")

    (def game-set ()
      (with (wnum (count-color board 'w)
             bnum (count-color board 'b))
        (js/log "WHITE: " wnum)
        (js/log "BLACK: " bnum "\n\n")
        (js/log (if (> wnum bnum)
                 " !!! WHITE won !!!\n\n"
                 (> bnum wnum)
                 " !!! BLACK won !!!\n\n"
                 " !!! DRAW !!!\n\n"))))

    (def iter ()
       (if (turn1 board turn n)
           (do
             (= turn (invert turn))
             (++ n)
             (js/log "")
             (set-timer iter 10))
           (game-set)))

    (print-board board)

    (iter)))