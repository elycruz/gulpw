gulpw (gulp wrangler)
====================

## Todos

### MVP (Minimal Viable Product) Todos
- [X] Build out and come up with base functionality/classes (MVP).
- [X] Build out the baseline task proxies:
  - [X] - ~~all/default~~ Leaving this one for version 0.2.0
	- [x] - build
	- [X] - clean (del)
	- [X] - compass (custom)
	- [X] - concat (gulp-concat)
	- [X] - copy
	- [X] - csslint (gulp-csslint)
	- [X] - deploy (ssh2)
	- [X] - jasmine
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
- [X] General:
  - [X] - Should merge local config on top of gulpw-config.yaml when ever tasks are run
  (should happen from inside Wrangler.js for all tasks (if any configs present)).
  - [X] - ~~Make `Wrangler` constructor `Optionable`.~~  No longer necessary.
  - [X] - Deploy task should reference local deploy file name from `prompt` task config.
  - [X] - ~~Add pointers to `gulp` and `wrangler` to `*TaskProxy` (eliminates having to pass them around
  all the time).~~  Tentative.
  - [X] - ~~Isolate hinting/linting tasks before running `build` task and wait for them to finish before
  running `build` task.~~ No longer necessary as by just adding them to the ignore list the extra launched tasks
  (which weren't noticed before due to the mass of output) are not launched.
  - [X] - ~~~Remove build paths from concat task.  Instead use the ones defined in the minify task.~~~
  We will set the concat task
  build paths to null and when the the task runs it will use the ones specified in the 'minify' task if
   it doesn't have
  any otherwise it will use the one's that it has.
  - [X] - Add 'compass' task to the 'build' task.
  - [X] - Add testing (mocha, jasmine) tasks to 'build' task.
  - [X] - Make sure that 'concat' and 'minify' tasks have the same options (minus the ones that are exlusive
   to minify).
  - [X] - ~~Supply example bundle config file with all sections listed in it.~~  Moving this to version 0.2.0.
  - [X] - Add support for bundle config files in any one of 'js', 'json', or 'yaml' formats.
  - [X] - ~~Set up pipe transport function for 'mocha' and 'jasmine' proxies.~~  No longer needed.

### Version 0.2.0 Todos
- [X] - Static Tasks:
    - [X] - config
    - [X] - bundle-config
    - [X] - deploy-config
- [X] - Task Updates:
    - [X] - Deploy task should be able to take a parameter to only deploy certain file types;
            E.g., `--file-types=css,js` or `-ft=css,js` or `--ext=js,css` ?
- [X] - Tasks
	- [X] - ~~browserify~~ Moved to version 0.3.0
    - [X] - ~~develop - Task for launching browser with specified path and launching watch task for specified bundle.~~ Moved to version 0.3.0.
    - [X] - ~~jsdoc~~ ~~document (jsdoc, groco, etc)~~ Moved to version 0.3.0
    - [X] - ~~vulcanize (for polymer build tool)~~ Moved to version 0.3.0.
  	- [X] - ~~prompt:config Generates a 'gulpw-config.*' file.~~ ~~For generating default config.~~  Taken care of by `config` task (see above 'Static Tasks').
- [X] - ~~For `Bundle`~~ Moving to version 0.3.0:
	- [X] - ~~The watch task should be reset whenever the {bundle}.yaml file that it is using to watch files
	 is changed and also when running the global watch the watch task should reset whenever a bundle is
	  changed.~~ Moved to version 0.4.0
- General:
  - [ ] - Prettify console output in all tasks, and make all output follow a similar structure.
  - [X] - Clean up notes for deploy task.
  - [X] - Make ~~'prompt:deploy'~~ `deploy-config` more robust by making some of the config parameters optional (also doctor
            up deploy task to take this into account)
  - [X] - ~~Fix all non streaming tasks to return streams or promises so that other tasks can list them as dependencies.~~ Taken care of below.
  - [X] - Make sure all tasks return promises or a stream:
    - [X] - all
    - [X] - build
    - [X] - clean
    - [X] - compass
    - [X] - concat
    - [X] - copy
    - [X] - csslint
    - [X] - deploy
    - [X] - jasmine
    - [X] - jshint
    - [X] - minify
    - [X] - mocha
    - [X] - requirejs
    - [X] - watch
    - [X] - ~~prompt:*~~ This task became the ones below
    - [X] - bundle-config
    - [X] - deploy-config
    - [X] - config
  - [x] - Cleanup callbacks ~~hell~~ within deploy task to only go one level deep (inline) (will make code easier to read).
  - [X] - Change `prompt` to `config`. (`prompt` still exists.  Will be removed in a later version)
  - [X] - Remove seemengliy repetative instructions in main readme ("In 'gulpw-config.yaml':" etc.)
  - [X] - Add notes for `config` task.
  - [X] - Supply example bundle config file with all sections listed in it.
  - [X] - Add all available flags to main readme.md.
  - [X] - Update the example bundle config file with latest additions/changes (add more notes for it).
  - [X] - Add LICENSE file.
  - [X] - Bundle aliases/name's are now optional inside of a {bundle}.* config file.
  - [X] - Renamed all occurrences of 'Proxy' to 'Adapter' (since what Wrangler uses are actually adapters).
  - [ ] - Refresh docs
  - [X] - Ensure all tasks are optional
  - [X] - ~~Ensure that `registerBundle` and `registerBundles` returns a boolean so we can track which bundles registered
  successfully or not.~~  Instead we just check `gulp.tasks` to see if task is registered before trying to run it.
  - [X] - ~~Track which bundles register successfully and which ones do not on and pull out their tasks
        before sending tasks to gulp.~~ Same as above (makes for less processing and less code).
- [X] - ~~Make bundle names case insensitive.~~ Letting the user decide the casing of the bundles alias name and file name
(though both should be the same).

### Todos for Version 0.3.0
- [ ] - Page bundles should be allowed to 'include' other bundles via an `includes` hash key with an array of bundle names as it's value (**note included files will not be rebuilt by the `watch` task (to avoid cyclic redundencies in bundles watching different files).
- [ ] - Page bundles should compile all artifacts from the 'included' bundles into it's own artifact(s) (in the order the bundles are listed).
- [ ] - Page bundles should be able to have a `siblings` attribute which allows tasks called on page bundles themselves to also be called on it's 'sibling' bundles.
- [ ] - All tasks called page bundle siblings should happen before page bundle tasks are called.
- [ ] - Allow logging of runtime logs to a file via a parameter '--log' or '--l'
- [ ] - Tasks
    - [ ] - Watch, Deploy, Build and other tasks should also take advantage of a file type parameter;
            E.g., `--ext=js,css` etc. the parameter should limit the task(s) scope
	- [ ] - develop - Task for launching browser with specified path and launching watch task for specified bundle.
    - [ ] - vulcanize (for polymer build tool)
    - [ ] - browserify
    - [ ] - jsdoc ~~document (jsdoc, groco, etc)~~
- [ ] - Examine any fields named `allowedFileTypes` for candidates to rename to `ingoredFileTypes`.
- [ ] - Separate minify-html, minify-css, and minify-js into separate tasks.
- [ ] - Minify should get all options and pipes from it's sub tasks (minify-html, minify-css, minify-js, jsdoc)
- [ ] - Implement DotfilesTaskAdapter (adapter that ask you about '.' files that you may want (E.g., .gitignore, .eslintrc .etc).

### Todos for Version 0.4.0
- [ ] - Move all utility styled functions from `Wrangler` into a utils class/namespace etc.. (?)
- [ ] - The watch task should be reset whenever the {bundle}.* file that it is using to watch files
	 is changed and also when running the global watch the watch task should reset whenever a {bundle}.* is
	  changed.
- [ ] - Force `tasks` key configurations to have a `configurableModules` key allow us to automate the fetching of
gulp plugin options or node_module options from a given bundle-config/gulpw-config file.
This also allows to do further introspection if necessary (before running a task) (maybe in '--verbose' mode?)
E.g.:
```
var options = someTaskAdapter.config();
gulp.src([...])

    // `someGulpOptions` below are automatically resolved to an empty object or null
    // based on whether the options exists or not (in global gulpw-config or locally in bundle-config)
    // @todo add note about cloning config section from gulpw-config using sjljs.
    .pipe(someGulpPlugin(options.someGulpPluginOptions);

```
- [ ] - Freeze configs before passing them into their task adapters.
- [ ] - Use localized versions of task adapter configs instead of getting them directly from
the wrangler.
- [ ] - Allow fetching of configs from task manager (clone them when needing to configure them via
    the `clone from wrangler` methods).
- [ ] - Optimze the `taskAdapter.getPipe` method to be used outside of the gulpw namespaces
(when gulpw is used as a module in a script).
- [ ] - Clarify the meaining/difference(s) of the terms 'options' and 'config'.
Also clarify their relationships to each other for the public.
- [ ] - Make gulpw includable as a module in a script:  Currently gulpw will not continue running unless it recognizes
the task being run as configured with itself.  We want to allow it to run as a module if it is included in a gulp file.
I.e., gulpw returns gulp when included as a module allowing gulp to use the tasks that gulpw defined as deps to user defined
tasks in gulpfile/imported-in-to-gulpfile.