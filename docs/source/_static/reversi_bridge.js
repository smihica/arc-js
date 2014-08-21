(function() {
  var canvas = document.getElementById('c1');
  var size = 600;
  var txt = '', holder = $('#holder');

  function clear_board() {
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = "rgb(0, 153, 0)";
    ctx.fillRect(0, 0, size, size);
    var unit = size / 8;
    for (var i = 1, l = 8; i<l; i++) {
      var x = i*unit;
      for (var j=0; j<2; j++) {
        ctx.beginPath();
        ctx.moveTo(j?0:x, j?x:0);
        ctx.lineTo(j?size:x, j?x:size);
        ctx.closePath();
        ctx.stroke();
      }
    }
  }

  function draw_stone(x, y, color) {
    var ctx = canvas.getContext('2d');
    var unit = size / 8;
    var xp = (unit*x) + (unit/2);
    var yp = (unit*y) + (unit/2);
    var r = unit * 0.85;
    ctx.beginPath();
    ctx.arc(xp, yp, r/2, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000';
    ctx.stroke();
  }

  function js_log() {
    txt += Array.prototype.slice.call(arguments).join(' ') + "\n";
    holder.text(txt);
    holder.scrollTop(holder[0].scrollHeight);
  }

  ArcJS.Primitives('user').define({
    'js/clear-board': [{dot:-1}, clear_board],
    'js/draw-stone':  [{dot:-1}, draw_stone],
    'js/log':         [{dot:0},  js_log]
  });

  clear_board();

})();
