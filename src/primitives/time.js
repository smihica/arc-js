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
    if (typeof ms !== 'number') {
      throw new Error('(set-timer fn ms ...) the argument ms must be a number.');
    }
    var self = this;
    var l = arguments.length;
    var repeat = (2 < l && arguments[2] !== nil);
    var timer  = repeat ? setInterval : setTimeout;

    var asm = [['constant', fn],
               ['apply'],
               ['halt']];
    var arg_len = (l - 3);
    asm.unshift(['argument']);
    asm.unshift(['constant', arg_len < 0 ? 0 : arg_len]);
    for (var i=l-1; 2 < i; i--) {
      asm.unshift(['argument']);
      asm.unshift(['constant', arguments[i]]);
    }
    asm.unshift(['frame', asm.length]);

    var _box = {};
    var id_obj = timer(function() {
      var err = false, result = null;
      if (!repeat) {
        timer_ids_table.clear(_box.id);
      }
      self.set_asm(asm);
      try {
        result = self.run();
      } catch (e) {
        result = e.toString();
        err = true;
      }
      if (err) {
        console.error(result);
        var call_stack_str = self.get_call_stack_string();
        console.error(call_stack_str);
      }
      if (self.warn !== "") {
        console.error(self.warn);
      }
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
