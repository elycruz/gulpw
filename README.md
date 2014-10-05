gulp-bundle-wrangler
====================

Allows the management of a project via bundle configuration files (architected towards speed).

## Basic Idea
So the idea is as follows:
  We have a `gulp-bundles` directory (could be named anything via the `gulp-bundles/*"bundle-wrangler"-config*` file)
that contains "bundle-configuration" files which are used within "task proxies" to run a task.

### Todos

- [ ] Build out and come up with base functionality/classes.
- [ ] Build out the following Task proxies
	- [ ] - build
	- [ ] - clean
	- [ ] - cssp (compass, less etc.)
	- [ ] - cssc
	- [ ] - csslint
	- [ ] - cssmin
	- [ ] - deploy
	- [ ] - document/docs (jsdoc, groco, etc)
	- [ ] - jslint (jshint, jslint, etc.)
	- [ ] - jsmin (uglify, closure compiler etc.)
	- [ ] - templates (mustache, handlebars etc.)
	- [ ] - prompt 
	- [ ] - umd (requirejs, browserify etc.)
	- [ ] - watch
- [ ] Allow the user to set his own task names/keys (this will efect even the
 keys listed in the bundle yaml/json files).  E.g., instead of `cssp` a user can
  use lets say `compass` instead or key of his choosing for the `cssp` (css preprocessor) task.
- For `Bundle`:
	- [ ] Should have `has*` methods or similiar (these methods will be auto 
	populated at runtime based on the available task keys);  E.g., `bundle.hasCompass()`
- The `deploy` task via the watch task should only deploy changed file types not everything for a bundle (takes to long for bigger bundles definitions).

### Notes:
- Be able to pass in multiple flags from the command line (some with values some with values).  Running multiple tasks and passing in multiple
flags and flags with values are allowed  (flags and values need to be passed in last for this to work (cli doesn't differentiate between task names and param/flag values));  E.g.,
`gulp task1 --flag1 flag-value --flag2 --flag3 task2 --flag4` will only run `task1` and will parse everything else as flag and flag params

### License(s):
- MIT (http://opensource.org/licenses/MIT)
- GNU v2+ (http://www.gnu.org/licenses/gpl-2.0.html)
- GNU v3 (http://www.gnu.org/licenses/gpl.html)
