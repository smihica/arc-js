(function(_window) {
  include("stack.js");
  include("symbol.js");
  include("cons.js");
  include("char.js");
  include("table.js");
  include("closure.js");
  include("call.js");
  include("continuation.js");
  include("tagged.js");
  include("box.js");
  include("primitives.js");
  include("reader.js");
  include("preload.js");
  include("vm.js");
  _window.ArcJS = {
    Stack: Stack, Symbol: Symbol,
    Cons: Cons, Char: Char, Table: Table,
    Closure: Closure, Call: Call,
    Continuation: Continuation, Tagged: Tagged,
    Box: Box, Reader: Reader, VM: VM,
    nil: nil, t: t, stringify: stringify, type: type,
    cons: cons, car: car, cdr: cdr, cadr: cadr,
  };
})(this);
