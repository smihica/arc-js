var Char = classify("Char", {
  static: {
    tbl: {},
    get: function(n) {
      var c = null;
      if (!(c = this.tbl[n])) {
        c = new Char(n);
        this.tbl[n] = c;
      }
      return c;
    }
  },
  property: { c: null },
  method: {
    init: function(c) {
      this.c = c;
    }
  }
});
