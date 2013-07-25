COMPRESS=uglifyjs
CONSTRUCT=tools/jsconstruct
COMPILE_ARC=tools/compile-arc
BUILDDIR=.

all:		vm.js vm.min.js main.js main.min.js

clean:
		rm -f main.js main.min.js vm.js vm.min.js

auto:
		make
		./tools/update-watcher src/*.js src/arc/*.arc -- make

vm.js:		src/*.js compiler.fasl core.fasl
	        $(CONSTRUCT) -o vm.js src/vm.js

vm.min.js:	vm.js
		$(COMPRESS) --unsafe -nc -o vm.min.js vm.js

main.js:        src/*.js compiler.fasl core.fasl
	        $(CONSTRUCT) -o main.js src/main.js

main.min.js:    main.js
		$(COMPRESS) --unsafe -nc -o main.min.js main.js

compiler.fasl:	src/arc/compiler.arc
		$(COMPILE_ARC) -o src/compiler.fasl src/arc/compiler.arc

core.fasl:	src/arc/core.arc
		$(COMPILE_ARC) -o src/core.fasl src/arc/core.arc


.PHONY:		all clean
