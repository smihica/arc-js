var Regex = classify('Regex', {
  property: {
    src: null,
    asm: null,
  },
  method: {
    init: function(src) {
      this.src = src;
      this.asm = new RegExp(src);
    }
  }
});
ArcJS.Regex = Regex;
