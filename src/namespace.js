var NameSpace = classify('NameSpace', {
  property: {
    name:   null,
    upper:  null,
    lowers: null,
    vars:   null
  },
  static: {
    root: null,
    stack: [null],
    push: function(x) {
      this.stack.push(x);
      return x;
    },
    pop: function() {
      return this.stack.pop();
    }
  },
  method: {
    init: function(name, upper) {
      this.name = name;
      this.upper = upper;
      this.vars = {};
      this.lowers = {};
    },
    extend: function(name) {
      if (!this.lowers[name])
        this.lowers[name] = new NameSpace(name, this);
      return this.lowers[name];
    },
    down: function(name) {
      return this.lowers[name];
    },
    up: function() {
      return this.upper;
    },
    clear_lower: function(name) {
      if (name) {
        delete this.lowers[name];
      } else {
        this.lowers = {};
      }
    }
  }
});
NameSpace.root = new NameSpace('%ROOT', null);
ArcJS.NameSpace = NameSpace;
