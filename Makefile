COMPRESS=node_modules/uglify-js/bin/uglifyjs
CONSTRUCT=tools/jsconstruct
COMPILE_ARC=bin/arcjsc
DATETIME=$(shell date +'%Y%m%d%H%M%S')
BUILDDIR=.
CURRENT_BRANCH=$(shell git branch | grep \* | sed -e "s/^\* //")
UNIT_TESTS=$(shell ls test/unit/arc/*.arc)

all:		arc.js arc.min.js arc.min.js.gz

noeval:		arc_noeval.js arc.min.js arc.min.js.gz

clean:
		rm -f arc.js arc.min.js arc.min.js.gz

test:		arc.min.js $(UNIT_TESTS)
		npm test

auto:
		make
		./tools/update-watcher src/*.js src/arc/*.arc -- make

arc.js:		src/*.js src/primitives/*.js src/*.fasl
		cd lib/; rm -f classify.js; ln -s classify.normal.js classify.js; cd ..
	        $(CONSTRUCT) -o arc.tmp.js src/arc.js
		cat src/comments.js arc.tmp.js > arc.js
		rm arc.tmp.js

arc_noeval.js:  src/*.js src/primitives/*.js src/*.fasl
		cd lib/; rm -f classify.js; ln -s classify.simple.js classify.js; cd ..
		$(CONSTRUCT) -o arc.tmp.js src/arc.js
		cat src/comments.js arc.tmp.js > arc.js
		rm arc.tmp.js

arc.min.js:	arc.js
		$(COMPRESS) --unsafe -nc -o arc.min.js arc.js

arc.min.js.gz:	arc.min.js
		gzip -k -f arc.min.js

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

arc-unit:       src/arc/unit.arc
		mkdir -p backup
		if [ -e src/unit.fasl ]; then cp src/unit.fasl backup/$(DATETIME).unit.fasl; fi;
		$(COMPILE_ARC) -d -o src/unit.fasl src/arc/unit.arc

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
		git push origin gh-pages
		git checkout $(CURRENT_BRANCH)
		rm -f arc.js.bk arc.min.js.bk

setup:
		npm install uglify-js
		npm install mocha
		npm install chai

doc:
		cp arc.js docs/source/_static/arc.js
		cp arc.min.js docs/source/_static/arc.min.js
		cp arc_loader.js docs/source/_static/arc_loader.js
		cd docs && make html

doc_clean:
		cd docs && make clean

.PHONY:		all clean
