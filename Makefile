COMPRESS=uglifyjs
CONSTRUCT=tools/jsconstruct
COMPILE_ARC=bin/arcjsc
DATETIME=$(shell date +'%Y%m%d%H%M%S')
BUILDDIR=.
CURRENT_BRANCH=$(shell git branch | grep \* | sed -e "s/^\* //")

all:		arc.js arc.min.js

clean:
		rm -f arc.js arc.min.js

unit:
		mocha --reporter spec test/unit/unit.js

unit_tap:
		mocha --reporter tap test/unit/unit.js

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

core:           src/arc/core.arc
		mkdir -p backup
		if [ -e src/core.fasl ]; then cp src/core.fasl backup/$(DATETIME).core.fasl; fi;
		$(COMPILE_ARC) -d -o src/core.fasl src/arc/core.arc

restore_compiler:
		mv $(shell ls backup/*.compiler.fasl | sort -r | sed '1!d') src/compiler.fasl
		make

install_web:	arc.min.js
		cp arc.js arc.js.bk
		cp arc.min.js arc.min.js.bk
		git checkout gh-pages
		mv arc.js.bk js/arc.js
		mv arc.min.js.bk js/arc.min.js
		git add js/
		git commit -m 'Installed new arc.js.'
		git checkout $(CURRENT_BRANCH)
		rm -f arc.js.bk arc.min.js.bk


.PHONY:		all clean
