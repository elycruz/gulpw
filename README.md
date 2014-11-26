gulp-bundle-wrangler
====================

##*** Note ***
This project is in the pre-alpha stage and only a few tasks are available.
Please do not attempt to use it until this notice is removed.

Allows the management of a project via bundle configuration files (architected towards speed).

## Basic Idea
So the idea is as follows:
  We have a `gulp-bundles` directory (could be named anything via the `{bundle-wrangler}-config*` file).
That directory should contain "bundle-configuration" files which are used within "task proxies" to run a task.

### UML Diagram
[[UML Diagram of Bundle Wrangler] (http://www.gliffy.com/go/publish/6312461)]

### Todos

- [X] Build out and come up with base functionality/classes (MVP).
- [ ] Build out the following Task proxies
	- [ ] - browserify
	- [x] - build
	- [X] - clean
	- [X] - concat (gulp-concat)
	- [X] - csslint (gulp-csslint)
	- [ ] - deploy (ssh tool)
	- [ ] - document (jsdoc, groco, etc)
	- [ ] - htmllint (tentative)
	- [ ] - htmltidy (tentative)
	- [X] - jshint (gulp-jshint)
	- [X] - minify (gulp-uglify, gulp-minify-css, gulp-minify-html)
	- [ ] - template (mustache, handlebars etc.) (stores all templates on specified global via a script template)
	- [ ] - requirejs
	- [ ] - watch
- For `Bundle`:
	- [X] Should have `has*` methods or similiar (these methods will be auto
	populated at runtime based on the available task keys);  E.g., `bundle.hasCompass()`
- The `deploy` task via the watch task should only deploy changed file types not everything for a bundle (takes to long for bigger bundles definitions).
        - [ ] - The watch task should be reset whenever the {bundle}.yaml file that it is using to watch files is changed and also when running the global watch the watch task should reset whenever a bundle is changed.

### Notes:
- Be able to pass in multiple flags from the command line (some with values some without values).  Running multiple tasks and passing in multiple
flags and flags with values are allowed  (flags and values need to be passed in last for this to work (cli doesn't differentiate between task names and param/flag values));  E.g.,
`gulp task1 --flag1 flag-value --flag2 --flag3 task2 --flag4` will only run `task1` and will parse everything else as flag and flag params

### License(s):
- MIT (http://opensource.org/licenses/MIT)
- GNU v2+ (http://www.gnu.org/licenses/gpl-2.0.html)
- GNU v3 (http://www.gnu.org/licenses/gpl.html)
