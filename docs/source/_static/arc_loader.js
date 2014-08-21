$(function () {
  var runner = ArcJS.context();
  var codes = $('script[type="text/arc"]').map(function(i, v) {
    var inner = v.innerText;
    var src = v.src;
    return {script: inner, src: src};
  });
  var fasls = $('script[type="text/arc-fasl"]').map(function(i, v) {
    var inner = v.innerText;
    var src = v.src;
    return {script: inner, src: src};
  });

  function iter(codes, i, type, after) {
    if (i < codes.length) {
      var script = codes[i].script
      var src    = codes[i].src;
      if (src) {
        $.ajax({
          url: src,
          dataType: 'text'
        }).done(function(data){
          var fasl;
          switch(type) {
          case 'fasl':
            eval('var fasl = (function() {\nvar preloads = [], preload_vals = [];\n' +
                 data +
                 'return {preloads: preloads, preload_vals: preload_vals};\n})();');
            ArcJS.fasl_loader(ArcJS.NameSpace.get('user'), fasl.preloads, fasl.preload_vals);
            break;
          case 'arc':
            runner.evaluate(data);
            break;
          }
          if (script) runner.evaluate(script);
          iter(codes, i+1, type, after);
        });
      } else {
        if (script) runner.evaluate(script);
        iter(codes, i+1, type, after);
      }
    } else {
      if (after) after();
    }
  }

  iter(fasls, 0, 'fasl', function() {
    iter(codes, 0, 'arc');
  });

});
