var console_log = console.log;
console.log = function(x) {
  document.write((x || '') + '<br>');
  console_log.apply(this, arguments);
};
