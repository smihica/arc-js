COMPRESS=uglifyjs
CONSTRUCT=tools/jsconstruct
COMPILE_ARC=tools/compile-arc
BUILDDIR=.

all:		main.js main.min.js vm.js vm.min.js

clean:
		rm -f main.js main.min.js vm.js vm.min.js

auto:		main.js main.min.js vm.js vm.min.js
		make
		./tools/update-watcher src/*.js src/arc/*.arc -i src/preload.js -- make

vm.js:		src/*.js
	        $(CONSTRUCT) -o vm.js src/vm.js

vm.min.js:	vm.js
		$(COMPRESS) --unsafe -nc -o vm.min.js vm.js

main.js:        preload.js src/*.js
	        $(CONSTRUCT) -o main.js src/main.js

main.min.js:    main.js
		$(COMPRESS) --unsafe -nc -o main.min.js main.js

preload.js:	src/arc/*.arc
		$(COMPILE_ARC) -o src/preload.js src/arc/*.arc

.PHONY:		all clean
