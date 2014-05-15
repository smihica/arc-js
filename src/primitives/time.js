var primitives_time = (new Primitives('arc.time')).define({
  'msec': [{dot: -1}, function() {
    return +(new Date());
  }],
});
