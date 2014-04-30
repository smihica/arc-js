var NameSpace = classify('NameSpace', {
  property: {
    name:     null,
    includes: null,
    primary:  {}
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
    init: function(name, includes) {
      this.name = name;
      this.includes = includes;
    },
    set: function(name, val) {
      this.primary[name] = val;
    },
    setBox: function(name, val) {
      this.primary[name] = new Box(val);
    },
    get: function(name) {
      var v = this.primary[name];
      if (v) return v;
      for (var i = 0, l = this.includes.length; i<l; i++) {
        v = this.includes[i].primary[name];
        if (v) return v;
      }
      throw new Error('Unbound variable ' + stringify_for_disp(Symbol.get(name)));
    },
    has: function(name) {
      if (name in this.primary) return true;
      for (var i = 0, l = this.includes.length; i<l; i++)
        if (name in this.includes[i].primary) return true;
      return false;
    }
  }
});
NameSpace.root = new NameSpace('***root_namespace***', []);
ArcJS.NameSpace = NameSpace;
