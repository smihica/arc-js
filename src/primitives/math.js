var primitives_math = (new Primitives('arc.math')).define({
  'odd': [{dot: -1}, function(x) {
    return (x % 2) ? t : nil;
  }],
  'even': [{dot: -1}, function(x) {
    return (x % 2) ? nil : t;
  }],
  'mod': [{dot: -1}, function(x, y) {
    return (x % y);
  }],
});
