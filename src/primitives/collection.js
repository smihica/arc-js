var primitives_collection = (new Primitives('arc.collection')).define({

  'lastcons': [{dot: -1}, function(lis) {
    var rt = lis;
    while (type(lis) === s_cons) {
      rt = lis;
      lis = cdr(lis);
    }
    return rt;
  }],

  'nconc': [{dot: 0}, function($$) {
    var l = arguments.length - 1;
    if (l < 0) return nil;
    var rt = null;
    for (var i=0; i<l; i++) {
      if (arguments[i] === nil) continue;
      rt = rt || arguments[i];
      var last = lastcons(arguments[i]);
      if (last.cdr !== nil) throw new Error("nconc: Can't concatenate dotted list.");
      while (i < l) {
        if (arguments[i+1] !== nil) break;
        i++;
      }
      if (i === l) break;
      last.cdr = arguments[i+1];
    }
    return rt || arguments[l];
  }],

  // "(consif 1 '(2 3))", "(1 2 3)",
  // "(consif nil '(2 3))", "(2 3)",
  'consif': [{dot: -1}, function(n, lis) {
    return (n === nil) ? lis : cons(n, lis);
  }],

});
