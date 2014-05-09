$(function() {
  var vm = new ArcJS.VM();
  var stringify = ArcJS.stringify;

  function compile_srv() {
    $.ajax({
      url: '/arc-compiler',
      type: 'POST',
      data: {
        code: $("#arc").val()
      }
    }).done(function(res) {
      vm.cleanup();
      vm.load_string(res);
      show_asm(res);
    }).error(function(r) {
      alert(r.responseText);
    });
  }

  function read_compile() {
    var code = $("#arc").val();
    var asm = [
      ['frame', 8],
      ['constant', vm.reader.read(code)],
      ['argument'],
      ['constant', 1],
      ['argument'],
      ['refer-global', 'compile'],
      ['indirect'],
      ['apply'],
      ['halt']
    ];
    vm.cleanup();
    vm.set_asm(asm);
    var compiled = vm.run();
    vm.cleanup();
    vm.load(compiled);
    show_asm(res);
    reset();
  }

  function run() {
    var rt;
    try {
      rt = stringify(vm.run());
    } catch (e) {
      $('#res').html(e+'\n'+vm.get_call_stack_string());
      throw e;
    }
    $('#res').text(rt);
  }

  function show_asm(asm) {
    var tbl = $("<table/>");
    for (var i=0, l=vm.x.length; i<l; i++) {
      var tr = $("<tr/>");
      if (vm.p == i) tr.addClass('p');
      var td = $("<td>" + i + "</td>");
      var td2 = $("<td/>");
      td2.text(vm.x[i]);
      tbl.append(tr.append(td, td2));
    }
    $("#asm").html(tbl);
    var h = tbl.height();
    var top = ((h / l) * vm.p)
    $("#asm").scrollTop(top);
  }

  function show_stack() {
    var tbl = $("<table/>");
    var h = 50;
    var stack = vm.stack.stack;
    var slen = stack.length;
    var top = Math.max(h, slen+1);
    for (var i=top; (top-h-1)<i; i--) {
      var tr = $("<tr/>",
                 (i == vm.s) ? {class: "s"} :
                 (i == vm.f) ? {class: "f"} :
                 (i == vm.l) ? {class: "l"} : {});
      var td = $("<td>" + i + "</td>");
      var td2 = $("<td/>");
      td2.text(((i < slen) ? (stringify(stack[i])+'').slice(0, 50) : ' ---- '));
      tbl.append(tr.append(td, td2));
    }
    $("#stack").html(tbl);
    var scroll_top = ((tbl.height() / (h + 1)) * (h - vm.s));
    $("#stack").scrollTop(scroll_top);
  }

  function show_status() {
    $("#status").text(
      ("[" + vm.count + "] " +
       " a: " + (stringify(vm.a)+'').slice(0, 30) +
       " f: " + vm.f +
       " l: " + vm.l +
       " c: " + vm.c +
       " s: " + vm.s));
  }

  function step() {
    var rt;
    try {
      rt = vm.step();
    } catch (e) {
      $('#res').html(e+'\n'+vm.get_call_stack_string());
      throw e;
    }
    show_stack();
    show_asm();
    show_status();
    if (rt !== void(0))
      $('#res').text(stringify(rt));
    return rt;
  }

  var auto_step_id;
  function stop_auto_step() {
    clearInterval(auto_step_id);
    auto_step_id = void(0);
    $("#auto-step-btn").text('Run >>');
  }
  function auto_step() {
    if (auto_step_id !== void(0)) {
      stop_auto_step();
      return;
    }
    $("#auto-step-btn").text(' Stop ');
    auto_step_id = setInterval(function() {
      var rt;
      try {
        rt = step();
      } catch (e) {
        stop_auto_step();
      }
      if (rt !== void(0)) {
        stop_auto_step();
      }
    }, 70);
  }

  function reset() {
    vm.cleanup();
    show_stack();
    show_asm();
    show_status();
  }

  $("#read-compile-btn").click(read_compile);
  $("#compile-srv-btn").click(compile_srv);
  $("#run-btn").click(run);
  $("#step-btn").click(step);
  $("#auto-step-btn").click(auto_step);
  $("#reset-btn").click(reset);

  $("#arc").val(
    ("(gcd 77 22)\n" +
     "\n" +
     ";; (def gcd (a b)\n" +
     ";;   (if (is a b) a\n" +
     ";;       (> a b) (gcd (- a b) b)\n" +
     ";;       (> b a) (gcd a (- b a))))\n"));

  read_compile();
});

