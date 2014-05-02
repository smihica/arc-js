COMPRESS=uglifyjs
CONSTRUCT=tools/jsconstruct
COMPILE_ARC=bin/arcjsc
DATETIME=$(shell date +'%Y%m%d%H%M%S')
BUILDDIR=.

all:		arc.js arc.min.js

clean:
		rm -f arc.js arc.min.js

auto:
		make
		./tools/update-watcher src/*.js src/arc/*.arc -- make

arc.js:		src/*.js src/primitives/*.js src/compiler.fasl src/arc.fasl
	        $(CONSTRUCT) -o arc.tmp.js src/arc.js
		cat src/comments.js arc.tmp.js > arc.js
		rm arc.tmp.js

arc.min.js:	arc.js
		$(COMPRESS) --unsafe -nc -o arc.min.js arc.js

arc:		src/arc/arc.arc
		$(COMPILE_ARC) -d -o src/arc.fasl src/arc/arc.arc

compiler:       src/arc/compiler.arc
		mkdir -p backup
		if [ -e src/compiler.fasl ]; then cp src/compiler.fasl backup/$(DATETIME).compiler.fasl; fi;
		$(COMPILE_ARC) -d -o src/compiler.fasl src/arc/compiler.arc

restore_compiler:
		mv $(shell ls backup/*.compiler.fasl | sort -r | sed '1!d') src/compiler.fasl
		make

install_web:	arc.min.js
		cp arc.js _site/js/arc.js
		cp arc.min.js _site/js/arc.min.js

.PHONY:		all clean
