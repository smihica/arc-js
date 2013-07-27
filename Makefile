COMPRESS=uglifyjs
CONSTRUCT=tools/jsconstruct
COMPILE_ARC=tools/compile-arc
BUILDDIR=.

all:		arc.js arc.min.js

clean:
		rm -f arc.js arc.min.js

auto:
		make
		./tools/update-watcher src/*.js src/arc/*.arc -- make

arc.js:		src/*.js compiler.fasl core.fasl
	        $(CONSTRUCT) -o arc.js src/arc.js

arc.min.js:	arc.js
		$(COMPRESS) --unsafe -nc -o arc.min.js arc.js

compiler.fasl:	src/arc/compiler.arc
		$(COMPILE_ARC) -o src/compiler.fasl src/arc/compiler.arc

core.fasl:	src/arc/core.arc
		$(COMPILE_ARC) -o src/core.fasl src/arc/core.arc


.PHONY:		all clean
