var TimerIdsTable = classify("TimerIdsTable", {
  static: {
    instance: null
  },
  property: {
    i:   0,
    src: {},
    on_all_cleared: []
  },
  method: {
    push_new: function(id) {
      var i = this.i++;
      this.src[i] = id;
      return i;
    },
    get: function(i) {
      var rt = this.src[i];
      return rt;
    },
    clear: function(i, result) {
      delete this.src[i];
      this.check_all_cleared(result);
    },
    check_all_cleared: function(result) {
      for (var i in this.src) {
        if (this.src.hasOwnProperty(i)) return;
      }
      for (var i=0, l=this.on_all_cleared.length; i<l; i++)
        this.on_all_cleared[i](result);
    },
    set_on_all_cleared: function(fn) {
      this.on_all_cleared.push(fn);
      this.check_all_cleared();
    }
  }
});
TimerIdsTable.instance = new TimerIdsTable();

var primitives_time = (function() {

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
      if (!repeat) {
        self.timer_ids_table.clear(_box.id, err ? 1 : 0);
        delete _box;
      }
    }, ms);
    var id = this.timer_ids_table.push_new(id_obj);
    _box.id = id;
    return id;
  }],
  'clear-timer': [{dot: -1}, function(id) {
    var id_obj = this.timer_ids_table.get(id);
    clearTimeout(id_obj);
    this.timer_ids_table.clear(id, 0);
    return nil;
  }],
});

})();
