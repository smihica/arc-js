(function() {

  var canvas = document.getElementById('c1');
  var ctx = canvas.getContext('2d');
  var board_size = 600;
  var unit = board_size / 8.0;

  (new ArcJS.Primitives('user')).define({
    'js/clear-board': [{dot: -1}, function clear_board() {
      ctx.fillStyle = "#007F4C";
      ctx.fillRect(0, 0, board_size, board_size);
      for (var i = 0; i < 2; i++) {
        for (var j = 1; j < 8; j++) {
          var p = j * unit, s = board_size;
          ctx.beginPath();
          ctx.moveTo(i?0:p, i?p:0);
          ctx.lineTo(i?s:p, i?p:s);
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 1;
          ctx.closePath();
          ctx.stroke();
        }
      }
    }],
    'js/draw-stone': [{dot: -1}, function draw_xy(x, y, color) {
      var hu = (unit / 2.0);
      var cx = (x * unit) + hu, cy = (y * unit) + hu, r = hu * 0.8;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2*Math.PI, false);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#000000";
      ctx.stroke();
    }]
  });

  function getMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  canvas.addEventListener('mousedown', function(evt) {
    var pos = getMousePos(evt);
    console.log("x: " + (pos.x|0) + " y: " + (pos.y|0));
  }, false);

})();
