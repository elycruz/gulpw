gulp-bundle-wrangler (Beta)
====================

Allows the management of a project via bundle configuration files (architected towards speed).

## Basic Idea
So the idea is as follows:
  We have a `gulp-bundles` directory (could be named anything via the `{bundle-wrangler}-config*` file).
That directory should contain "bundle-configuration" files which are used within "task proxies" to run a
 task via the command line;  E.g., `$ gulpw build:global deploy:global deploy:other-bundle`.
 The configuration files will then hold the user's configurations in the yaml format decidedly though
 other formats could be easily supported.

## Available Tasks
- [build](#build)
- [clean](#clean)
- [compass](#compass)
- [concat](#concat)
- [copy](#copy)
- [csslint](#csslint)
- [deploy](#deploy)
- [jshint](#jshint)
- [minify](#minify)
- [template](#template)
- [prompt](#prompt)
- [requirejs](#requirejs)
- [watch](#watch)
- [mocha](#mocha)

### build
The 'build' task calls every sub task listed within a {bundle-name}.yaml config file except (by default):
		- clean (we could have this run via a flag in the future but is ignored for now to speed up performance)
		- deploy
		- jshint (called by the minify task so is ignored as standalone task)
		- csslint (called by the minify task so is ignored as a standalone task)
** Note ** The minify task runs 'jshint' and 'csslint' (along with other tasks) so that
is why they are being ignored as standalone tests.

#### Usage:
`gulpw build:{bundle-name}` or run it for all bundles
`gulpw build`

### clean
'clean' cleans out any artifact files outputted by a bundle;  E.g., if a bundle has a *`files` or
 *`requirejs` section then the artifacts outputted by these sections are cleaned up (deleted) when clean is called.

*The `files` section can have many different sections that output artifact files for example a `js`, `css`, or `html` section(s).
*See the ['minify'](#minify) section for more info on the possible sections supported by the `files` section.

### concat

### compass
### copy
### csslint
### deploy
### jshint
### minify
### template
### prompt
### requirejs
### watch
### mocha

### MVP (Minimal Viable Product) Todos

- [X] Build out and come up with base functionality/classes (MVP).
- [ ] Build out the baseline task proxies:
	- [ ] - all/default
	- [x] - build
	- [X] - clean (del)
	- [X] - compass (custom)
	- [X] - concat (gulp-concat)
	- [X] - copy
	- [X] - csslint (gulp-csslint)
	- [X] - deploy (ssh2)
	- [ ] - jasmine
	- [X] - jshint (gulp-jshint)
	- [X] - minify (gulp-uglify, gulp-minify-css, gulp-minify-html)
	- [X] - template (mustache, handlebars etc.) (stores all templates on specified global via a script	template)
	- [X] - prompt:deploy (creates local deploy configuration file from series of questions)
	- [X] - requirejs
	- [X] - watch
	- [X] - mocha
- [X] For `Bundle`:
	- [X] - ~~~The `deploy` task via the watch task should only deploy changed file types not everything for
	 a bundle (takes to long for bigger bundles definitions).~~~  The previous was changed to only deploy the
	 artifact files and specified `deploy.otherFiles` files.
- [ ] General:
  - [X] - Should merge local config on top of bundle.wrangler.config.yaml when ever tasks are run
  (should happen from inside Wrangler.js for all tasks (if any configs present)).
  - [X] - ~~Make `Wrangler` constructor `Optionable`.~~  No longer necessary.
  - [X] - Deploy task should reference local deploy file name from `prompt` task config.
  - [X] - ~~Add pointers to `gulp` and `wrangler` to `*TaskProxy` (eliminates having to pass them around all the time).~~  Tentative.
  - [X] - ~~Isolate hinting/linting tasks before running `build` task and wait for them to finish before running
  `build` task.~~ No longer necessary as by just adding them to the ignore list the extra launched tasks
  (which weren't noticed before due to the mass of output) are not launched.
  - [ ] - ~~~Remove build paths from concat task.  Instead use the ones defined in the minify task.~~~  We will set the concat task
  build paths to null and when the the task runs it will use the ones specified in the 'minify' task if it doesn't have
  any otherwise it will use the one's that it has.
  - [ ] - Add 'compass' task to the 'build' task.
  - [ ] - Add testing (mocha, jasmine) tasks to 'build' task.

### Version 0.2.0 Todos
- [ ] - Tasks
	- [ ] - browserify
	- [ ] - develop - Task for launching browser with specified path and launching watch task for specified bundle.
	- [ ] - jsdoc ~~document (jsdoc, groco, etc)~~
	- [ ] - vulcanize (for polymer build tool)
- For `Bundle`:
	- [ ] - The watch task should be reset whenever the {bundle}.yaml file that it is using to watch files
	 is changed and also when running the global watch the watch task should reset whenever a bundle is
	  changed.
- General:
  - [ ] - Prettify console output in all tasks, and make all output look simliar (follow a matisse).
  - [ ] - Fix all non streaming tasks to return streams or promises so that other tasks can list them as dependencies.

### ~~Notes~~ Caveats:

- ~~Be able to pass in multiple flags from the command line (some with values some without values).  Running
 multiple tasks and passing in multiple flags and flags with values are allowed  (flags and values need to
  be passed in last for this to work (cli doesn't differentiate between task names and param/flag values));
    E.g., `gulp task1 --flag1 flag-value --flag2 --flag3 task2 --flag4` will only run `task1` and will parse
    task2 as a value of --flag2 unless you explicitely pass a value to --flag3~~
- Build files cannot be shared amongst bundles when wanting to use the 'watch' task cause they cause a cyclic dependency when running global
 watch tasks;  I.e., `gulpw watch`

### Resources
#### UML Diagram
[[UML Diagram of Bundle Wrangler] (http://www.gliffy.com/go/publish/6312461)]

### License(s):
- MIT (http://opensource.org/licenses/MIT)
- GNU v2+ (http://www.gnu.org/licenses/gpl-2.0.html)
- GNU v3 (http://www.gnu.org/licenses/gpl.html)
