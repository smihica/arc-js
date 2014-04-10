---
layout: demo
title: Arc-JS demo_01
heads:
---
<script>
var arc_runner = ArcJS.context();
var res = arc_runner.evaluate("(+ 1 2 3 4)");
console.log(res); // 10
// FizzBuzz
var code = [
 "(prn 'Start_FizzBuzz)",
 "(for n 1 100",
 "  (prn (case (gcd n 15)",
 "         1 n",
 "         3 'Fizz",
 "         5 'Buzz",
 "         'FizzBuzz)))"].join("\n");
arc_runner.evaluate(code);
</script>
