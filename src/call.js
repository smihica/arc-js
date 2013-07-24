var Call = classify("Call", {
  property: {
    fname: null,
    fn: null,
    args: null
  },
  method: {
    init: function(fn_or_name, args) {
      if (typeof fn_or_name === 'string') {
        this.name = fn_or_name;
      } else {
        this.fn = fn_or_name;
      }
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
