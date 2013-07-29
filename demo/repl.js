$(function() {
  var holder = $('#holder');
  var txt = $('#repl-txt');
  var s = new Date();
  var vm = new ArcJS.VM();
  var e = new Date();
  var init_time = e - s;
  txt.html(';; ArcJS ' + ArcJS.version + ' ' + ' Initialized in ' + init_time + ' ms<br>arc&gt;<br>');

  var cm = CodeMirror(holder[0], {
    value: '',
    mode: "clojure",
    theme: "ambiance",
    matchBrackets: true,
    keyMap: 'emacs'
  });

  function compile(expr) {
    var asm = [
      ['frame', 8],
      ['constant', expr],
      ['argument'],
      ['constant', 1],
      ['argument'],
      ['refer-global', 'do-compile'],
      ['indirect'],
      ['apply'],
      ['halt']
    ];
    vm.cleanup();
    vm.set_asm(asm);
    return vm.run();
  }

  function evaluate(expr) {
    var compiled = compile(expr);
    vm.cleanup();
    vm.load(compiled);
    return vm.run();
  }

  var escapeHTML = (function() {
    var htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };
    var htmlEscaper = /[&<>"'\/]/g;
    return function(string) {
      return ('' + string).replace(htmlEscaper, function(match) {
        return htmlEscapes[match];
      });
    }
  })();

  function onenter(code) {
    var expr = null, res = null, result = '', err = false;
    var read_time = 0, compile_time = 0, eval_time = 0;
    if (code.match(/^\s*$/g)) return;
    try {
      var s = new Date();
      expr = vm.reader.read(code);
      var e = new Date();
      read_time = e - s;
    } catch (e) {
      if (vm.reader.i < vm.reader.slen) {
        result = e.toString();
        err = true;
      }
      else { /* ignore */ return; }
    }
    cm.setValue('');
    if (!err) {
      try {
        var s = new Date();
        var compiled = compile(expr);
        var e = new Date();
        compile_time = e - s;
        vm.cleanup();
        vm.load(compiled);
        var s = new Date();
        res =  vm.run();
        var e = new Date();
        eval_time = e - s;
        result = ArcJS.stringify(res);
      } catch (e) {
        result = e.toString();
        err = true;
      }
    }
    var code_list = code.split('\n').filter(function(x){return x !== ''}).map(escapeHTML);
    var result_list = result.split('\n').filter(function(x){return x !== '';}).map(escapeHTML);
    var line_len = result_list.length + code_list.length;
    var org = txt.html();
    var _new = '<pre class="code">' + code_list.join('<br>') + '</pre>' +
      '<span class="time">' +
      ';; past-times read:' + read_time +
      'ms compile:' + compile_time +
      'ms eval:' + eval_time +
      'ms total:' + (read_time + compile_time + eval_time) + 'ms' + '</span><br>' +
      (function(r){
        return (err) ? '<span class="error">' + r + '</span>' : r;
      })(result_list.join('<br>'));

    txt.html(org + _new + '<br>arc&gt;<br>');
    var pos = holder.position();
    holder.css('top', pos.top + ((line_len + 1 + 1) * 22));
  }

  var last_len = 0;
  cm.on('change', function() {
    var v = cm.getValue();
    var len = v.length;
    if (last_len < len && v[len-1] === '\n') onenter(v);
    last_len = len;
  });

  cm.focus();
});
