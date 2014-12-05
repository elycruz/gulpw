gulp-bundle-wrangler
====================

##*** ALPHA State ***

Allows the management of a project via bundle configuration files (architected towards speed).

## Basic Idea
So the idea is as follows:
  We have a `gulp-bundles` directory (could be named anything via the `{bundle-wrangler}-config*` file).
That directory should contain "bundle-configuration" files which are used within "task proxies" to run a
 task.

### UML Diagram
[[UML Diagram of Bundle Wrangler] (http://www.gliffy.com/go/publish/6312461)]

### Todos

- [X] Build out and come up with base functionality/classes (MVP).
- [ ] Build out the baseline task proxies:
	- [ ] - browserify
	- [x] - build
	- [X] - clean (del)
	- [X] - concat (gulp-concat)
	- [X] - csslint (gulp-csslint)
	- [X] - deploy (ssh2)
	- [ ] - document (jsdoc, groco, etc)
	- [X] - jshint (gulp-jshint)
	- [X] - minify (gulp-uglify, gulp-minify-css, gulp-minify-html)
	- [X] - template (mustache, handlebars etc.) (stores all templates on specified global via a script
	template)
	- [X] - prompt:deploy (creates local deploy configuration file from series of questions)
	- [ ] - requirejs
	- [X] - watch
- For `Bundle`:
	- [ ] - The `deploy` task via the watch task should only deploy changed file types not everything for
	 a bundle (takes to long for bigger bundles definitions).
	- [ ] - The watch task should be reset whenever the {bundle}.yaml file that it is using to watch files
	 is changed and also when running the global watch the watch task should reset whenever a bundle is
	  changed.
- General:
	- [ ] - Should merge local config on top of bundle.wrangler.config.yaml when ever tasks are run (should happen from inside Wrangler.js for all tasks (if any configs present)).
	- [ ] - Remove build paths from concat task.  Instead use the ones defined in the minify task.
	- [ ] - Deploy task should reference local deploy file name from `prompt` task config.
	- [ ] - Prettify console output in all tasks, and make all output look simliar (follow a matisse).

### Notes:

- Be able to pass in multiple flags from the command line (some with values some without values).  Running
 multiple tasks and passing in multiple flags and flags with values are allowed  (flags and values need to
  be passed in last for this to work (cli doesn't differentiate between task names and param/flag values));
    E.g., `gulp task1 --flag1 flag-value --flag2 --flag3 task2 --flag4` will only run `task1` and will parse
    task2 as a value of --flag2 unless you explicitely pass a value to --flag3
- Build files cannot be shared amongst bundles cause they cause a cyclic dependency when running global
 watch tasks;  I.e., `gulpw watch`

### License(s):
- MIT (http://opensource.org/licenses/MIT)
- GNU v2+ (http://www.gnu.org/licenses/gpl-2.0.html)
- GNU v3 (http://www.gnu.org/licenses/gpl.html)
