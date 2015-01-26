var Box = classify('Box', {
  property: {
    v: null
  },
  method: {
    init: function(v) {
      this.v = v;
    },
    unbox: function() {
      return this.v;
    },
    setbox: function(v) {
      this.v = v;
    }
  }
});
ArcJS.Box = Box;
