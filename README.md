gulp-bundle-wrangler
====================

Allows the management of a project via bundle configuration files (architected towards speed).

### Todos
- [ ] - Build out and come up with base functionality/classes.
- [ ] - Build out the following Task proxies
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
- [ ] - Allow the user to set his own task names/keys (this will efect even the keys listed in the bundle yaml/json files).  E.g., instead of `cssp` a user can use lets say `compass` instead or key of his choosing for the `cssp` (css preprocessor) task.
