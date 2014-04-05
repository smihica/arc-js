var Symbol = classify("Symbol", {
  static: {
    tbl: {},
    get: function(name, evaluable_name) {
      var r = null;
      if (!(r = this.tbl[name])) {
        r = new Symbol(name, !!evaluable_name);
        this.tbl[name] = r;
      }
      return r;
    }
  },
  property: {
    name: null,
    evaluable_name: false
  },
  method: {
    init: function(n, evaluable_name) {
      this.name = n;
      this.evaluable_name = evaluable_name;
    }
  }
});
ArcJS.Symbol = Symbol;
