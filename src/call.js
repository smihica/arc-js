var Call = classify("Call", {
  property: {
    name: null,
    fn: null,
    args: null
  },
  method: {
    init: function(fn, name, args) {
      if (fn) this.fn = fn;
      else if (name) this.name = name;
      this.args = args;
    },
    codegen: function() {
      var code;
      if (this.name) {
        code = [
          ['refer-global', this.name],
          ['indirect'],
          ['apply']
        ];
      } else {
        code = [
          ['constant', this.fn],
          ['apply']
        ];
      }
      var l = this.args.length;
      code.unshift(['argument']);
      code.unshift(['constant', l]);
      for (var i=l-1; -1 < i; i--) {
        code.unshift(['argument']);
        code.unshift(['constant', this.args[i]]);
      }
      return code;
    }
  }
});
ArcJS.Call = Call;
