var primitives_time = (function() {

var timer_ids_table = {
  i: 0,
  src: {},
  push_new: function(id) {
    var self = timer_ids_table;
    var i = self.i++;
    self.src[i] = id;
    return i;
  },
  get: function(i, clear) {
    var self = timer_ids_table;
    var rt = self.src[i];
    if (clear) { self.clear(i); }
    return rt;
  },
  clear: function(i) {
    var self = timer_ids_table;
    delete self.src[i];
  }
};

return (new Primitives('arc.time')).define({
  'msec': [{dot: -1}, function() {
    return +(new Date());
  }],
  'set-timer': [{dot: 2}, function(fn, ms, $$) {
    var self = this;
    var repeat = (2 < arguments.length && arguments[2] !== nil);
    var timer  = repeat ? setInterval : setTimeout;
    var _box = {};
    var id_obj = timer(function() {
      if (!repeat) {
        timer_ids_table.clear(_box.id);
      }
      self.set_asm([
        ['frame', 5],
        ['constant', 0],
        ['argument'],
        ['constant', fn],
        ['apply'],
        ['halt']]).run();
    }, ms);
    var id = timer_ids_table.push_new(id_obj);
    _box.id = id;
    return id;
  }],
  'clear-timer': [{dot: -1}, function(id) {
    var id_obj = timer_ids_table.get(id, true);
    clearTimeout(id_obj);
    return nil;
  }],
});

})();
