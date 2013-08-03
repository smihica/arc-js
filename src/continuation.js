var Continuation = classify('Continuation', {
  parent: Closure,
  method: {
    init: function(stack, shift_num, stack_pointer, namespace) {
      Closure.prototype.init.call(
        this,
        [['refer-local', 0],
         ['nuate', stack.save(stack_pointer)], // stack restore
         ['continue-return', shift_num]], // return to outer frame.
        0,
        0,
        1,
        -1,
        stack,
        0,
        namespace);
    }
  }
});
ArcJS.Continuation = Continuation;
