COMPRESS=uglifyjs
CONSTRUCT=tools/jsconstruct
#COMPILE_ARC=tools/arc-compiler-arc
COMPILE_ARC=tools/arc-compiler-node.js
DATETIME=$(shell date +'%Y%m%d%H%M%S')
BUILDDIR=.

all:		arc.js arc.min.js

clean:
		rm -f arc.js arc.min.js

auto:
		make
		./tools/update-watcher src/*.js src/arc/*.arc -- make

arc.js:		src/*.js src/compiler.fasl src/core.fasl
	        $(CONSTRUCT) -o arc.js src/arc.js

arc.min.js:	arc.js
		$(COMPRESS) --unsafe -nc -o arc.min.js arc.js

arc:		src/arc/arc.arc
		$(COMPILE_ARC) -o src/arc.fasl src/arc/arc.arc
		make

compiler:       src/arc/compiler.arc src/arc/core.arc
		mkdir -p backup
		cp src/compiler.fasl backup/$(DATETIME).compiler.fasl
		cp src/core.fasl backup/$(DATETIME).core.fasl
		$(COMPILE_ARC) -o src/compiler.fasl src/arc/compiler.arc
		$(COMPILE_ARC) -o src/core.fasl src/arc/core.arc
		make arc

restore_compiler:
		mv $(shell ls backup/*.compiler.fasl | sort -r | sed '1!d') src/compiler.fasl
		mv $(shell ls backup/*.core.fasl | sort -r | sed '1!d') src/core.fasl
		make

.PHONY:		all clean
