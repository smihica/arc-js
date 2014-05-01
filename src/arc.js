var ArcJS = (function() {
  var ArcJS = this;
  ArcJS.version = '0.1.1';
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
  include("reader.js")
  include("namespace.js");
  include("primitives.js");
  include("preload.js");
  include("vm.js");
  include("context.js");
  return ArcJS;
}).call(typeof exports !== 'undefined' ? exports : {});
