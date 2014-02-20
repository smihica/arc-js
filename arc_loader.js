$(function () {
  var runner = ArcJS.context();
  var codes = $('script[type="text/arc"]').map(function(i, v) {
    var inner = v.innerText;
    var src = v.src;
    return {script: inner, src: src};
  });
  (function iter(codes, i) {
    if (i < codes.length) {
      var script = codes[i].script
      var src    = codes[i].src;
      if (src) {
        $.ajax({
          url: src,
          dataType: 'text'
        }).done(function(data){
          runner.evaluate(data);
          if (script) runner.evaluate(script);
          iter(codes, i+1);
        });
      } else {
        if (script) runner.evaluate(script);
        iter(codes, i+1);
      }
    }
  })(codes, 0);
});
