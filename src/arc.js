var ArcJS = (function() {
  var ArcJS = this;
  include("../lib/classify.min.js");
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
  return ArcJS;
}).call(typeof exports !== 'undefined' ? exports : {});
