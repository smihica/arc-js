$(function() {

  var s = new Date();
  var runner = ArcJS.context();
  var e = new Date();

  var holder = $('#holder');
  var txt = $('#repl-txt');
  var init_time = e - s;
  txt.html(';; ArcJS ' + ArcJS.version + ' ' + ' Initialized in ' + init_time + ' ms<br>arc&gt;<br>');

  var cm = CodeMirror(holder[0], {
    value: '',
    mode: "clojure",
    theme: "ambiance",
    matchBrackets: true,
    keyMap: 'emacs'
  });

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
      expr = runner.read(code);
      var e = new Date();
      read_time = e - s;
    } catch (e) {
      if (runner.vm.reader.i < runner.vm.reader.slen) {
        result = e.toString();
        err = true;
      }
      else { /* ignore */ return; }
    }
    cm.setValue('');
    if (!err) {
      try {
        var s = new Date();
        var compiled = runner.compile(expr);
        var e = new Date();
        compile_time = e - s;
        var s = new Date();
        res = runner.eval_asm(compiled);
        var e = new Date();
        eval_time = e - s;
        result = ArcJS.stringify(res);
        // console.log(ArcJS.NameSpace.stack);
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
        if (err) {
          var call_stack_arr = runner.vm.get_call_stack_string().split('\n')
          var call_stack_str = '<pre class="code">' + call_stack_arr.filter(function(x){return x !== '';}).map(escapeHTML).join('<br>') + "</pre>";
          line_len += call_stack_arr.length;
          return '<span class="error">' + r + call_stack_str + '</span>';
        }
        return r;
      })(result_list.join('<br>'));

    var ns = runner.vm.namespace;
    var nss = '';
    while (ns !== ArcJS.NameSpace.root) {
      nss = '::' + ns.name + nss;
      ns = ns.upper;
    }
    txt.html(org + _new + '<br>arc' + nss + '&gt;<br>');
    var pos = holder.position();
    holder.css({
      'top': pos.top + ((line_len + 1 + 1) * 22),
      'left': 50 + (nss.length * 10)
    });
  }

  var last_len = 0;
  cm.on('change', function onchange() {
    var v = cm.getValue();
    var len = v.length;
    if (last_len < len && v[len-1] === '\n') {
      cm.off('change', onchange);
      onenter(v);
      cm.on('change', onchange);
    }
    last_len = len;
  });

  cm.focus();
});
