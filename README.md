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

### License(s):
- MIT (http://opensource.org/licenses/MIT)
- GNU v2+ (http://opensource.org/licenses/lgpl-2.1.php)
- GNU v3 (http://opensource.org/licenses/gpl-3.0.html)
