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

## Quick Nav
- [Bundle config](#bundle-config)
- [Running tasks](#running-tasks)
- [Available tasks](#available-tasks)
- [Todos](#minimal-viable-product-todos)

### Bundle config
A bundle config is made typically of a yaml file with one or more attributes listed in it.
A bundle config only requires an `alias` property to be a valid bundle config file.
A bundle config file can have many sections representing and used by tasks.

#####Valid Bundle Config file:
```
#some-other-bundle.yaml
alias: some-other-bundle
```

#####Another Valid Bundle Config file:
```
# some-bunde.yaml
alias: some-bundle
files:
  js:
    - some/file/path.js
    - some/other/file/path.js
	css:
    - some/other/file/path1.css
    - some/other/file/path2.css
requirejs:
	options:
		# requirejs options here ...
		...
```

See the listed tasks below for ideas on what other sections you can use in your bundle yaml files.

### Running tasks
`gulpw {task-name}:{bundle-name}` for one bundle
`gulpw {task-name}` for all bundles

E.g., `gulpw build:global build:some-other-bundle deploy:global deploy:some-other-bundle --dev`
The above example builds (see [build](#build)) some bundles (in development mode (unminified due to `--dev` flag)) and deploys them to
 the users selected server (see [deploy](#deploy) task section for more info).

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
The 'build' task calls every sub task listed in a {bundle-name}.yaml config file except (by default can be altered in local wrangler config file):
		- clean (we could have this run via a flag in the future but is ignored for now to speed up performance)
		- deploy
		- jshint (called by the minify task so is ignored as standalone task)
		- csslint (called by the minify task so is ignored as a standalone task)

**Note:** The minify task runs 'jshint' and 'csslint' (along with other tasks) so that
is why they are being ignored as standalone tests.

'build' also adds the 'minify' task to it's list of tasks 'to' run for a particular bundle or bundles
depending on if an `html`, `css` or `js` section is found with the `files` section.

#####Usage:
`gulpw build:{bundle-name}` or run it for all bundles
`gulpw build`

#####Global Config:
```
tasks:

  # Build Task (Looks through {bundle-alias}.yaml file and runs
  # all tasks that are not in the `ignoreTasks` array in this config.
  build:

    ignoredTasks:
      - clean
      - deploy
      - jshint
      - csslint

    # This is a global lint flag that is used if there is a lint task specified for a section
    lintBeforeBuild: null
```

- **ignoredTasks {Array}:**  List of standalone tasks to ignore when calling build (*note some tasks are included as conglomerate tasks).
- **lintBeforeBuild {Boolean}:** Top level lint flag for overriding linting functionality in all subtasks.  Default `null`.

#####Flags that can affect this task:
- --dev
- --skip-lint
- --skip-csslint
- --skip-jslint

### clean
The 'clean' task cleans out any artifact files outputted by a bundle;  E.g., if a bundle has a *`files` or
*`requirejs` then the artifacts outputted by these sections are cleaned up (deleted) when clean is called.
'clean' also cleans/deletes any files listed in a `clean` section;  E.g.,
```
 clean:
   - some/file/path.js
   - some/file/path.css
   - etc.
```

*The `files` section can have many different sections that output artifact files for example a `js`, `css`, or `html` section(s).
*See the ['minify'](#minify) section for more info on the possible sections supported by the `files` section.

#####Usage:
`gulpw clean:{bundle-name}` or for all bundles `gulpw clean`

#####Global Config:
```
  clean:
    allowedFileTypes:
      - js
      - css
      - html
```

- **allowedFileTypes {Array}:** A list of keys/file types to allow for cleaning.

#####Bundle level config:
```
 clean:
   - some/file/path/to/clean.js
   - some/file/path/to/clean.css
   - etc.
```

### concat
The 'concat' task concatenates all files listed in the `files` section of a {bundle-name}.yaml file and outputs the results
to the output destination listed in it's config section or 'minify''s config section (if they are not defined for the 'concat' config section).

By default concat works only on works on the `js`, `css`, and/or `html` sections (currently hardcoded (will be updated later)).

#####Usage:
`gulpw concat:{bundle-name}` or for all bundles
`gulpw build`

#####Global Config:
```
tasks:

  concat:
    header: |
      /*!
       * Company Name http://www.company-website.com
       * <%= bundle.alias %>.<%= fileExt %> <%= bundle.version %> (<%= (new Date()).getTime() %>)
       * <%= bundle[section-name].md5 %>
       */
    cssBuildDir: some/path/to/build/path
    jsBuildDir: some/path/to/build/path
    htmlBuildDir: some/path/to/build/path
    allowedFileTypes:
      - js
      - css
      - html
    useVersionNumInFileName: false
    template:
      templatePartial: null # script partial to render for each file entry in the `templates` hash.
      compressWhitespace: true
      templateTypeKeys:
        - mustache
        - handlebars
        - ejs
```

- **header {String}:** The header to output on the concatenated file.
- **cssBuildDir {String}:** Output location for concatenated `*.css` files.
- **jsBuildDir {String}:** Output location for concatenated `*.js` files.
- **htmlBuildDir {String}:** Output location for concatenated `*.html` files.
- **allowedFileTypes {Array}:** The keys through loop through in the `files` section.
- **useVersionNumInFileName {Boolean}:** Whether to use the {bundle-name}.yaml file's version number suffixed to the concatenated file's name.
- **template {Object}:** The sub section which handles setting templates to javascript strings within the concatenated `js` section/files (*note a `js` section must be present within the `files` section in order for the template functionality to kick-in)
 - **templatePartial {String}:** Lodash template to use for appending the template(s) strings to the concatenated '*.js' file.
 - **compressWhitespace {Boolean}:** Whether or not to compress white space in the collected template strings.
 - **templateTypeKeys {Array}:** Keys to look for in files to trigger the template string addition functionality.

### compass
The 'compass' task calls compass compile at compass project root location (config.rb home).

#####Usage:
`gulpw compass:{bundle-name}` or `gulpw compass`

#####Global config:
```
tasks:

  compass:

  	# Compass project root dir
    compassProjectRoot: null # config.rb home
```

### copy
'copy' copies any files listed in a `copy` section's `files` hash within in a {bundle-name}.yaml config file.
E.g.,
```
copy:
  files:
    ./fe-dev/bower_components/requirejs/require.js: ./public/js/vendors/require.js
```

'copy' copies the 'key' to the 'value' location for every entry in the `files` hash.

#####Usage:
`gulpw copy:{bundle-name}` or for all bundles `gulpw copy`.

#####Global config:
none.

### csslint
The 'csslint' task runs csslint on a bundle or all bundles using the listed '.csslintrc' file or runs with default options if no '.csslintrc' file is listed.

#####Usage:
`gulpw csslint:{bundle-name}` or for all bundles `gulpw csslint`

#####Global Config
```
tasks:
  csslint:
      csslintrc: null
```

- **csslintrc:**  Location of '.csslintrc' file.

### deploy
### jshint
### minify
### prompt
### requirejs
### watch
### mocha

## Todos

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
  - [ ] - Make sure that 'concat' and 'minify' tasks have the same options (minus the ones that are exlusive to minify).
  - [ ] - Supply example bundle config file with all sections listed in it.

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
