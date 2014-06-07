var Char = classify("Char", {
  static: {
    ESCAPED_CHAR_TBL: {},
    tbl: {},
    get: function(n) {
      var c = null;
      if (!(c = this.tbl[n])) {
        c = new Char(n);
        this.tbl[n] = c;
      }
      return c;
    },
    stringify: function(c) {
      var x;
      if (x = Char.ESCAPED_CHAR_TBL[c.c]) return "#\\" + x;
      return "#\\" + c.c;
    }
  },
  property: { c: null },
  method: {
    init: function(c) {
      this.c = c;
    }
  }
});
ArcJS.Char = Char;
todos_after_all_initialized.push(function() {
  // Char.ESC is inverted Reader.ESC
  var resc = Reader.ESCAPED_CHAR_TBL, cesc = Char.ESCAPED_CHAR_TBL;
  for ( var n in resc ) {
    cesc[resc[n]] = n;
  }
});
