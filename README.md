gulp-bundle-wrangler (Beta)
====================

Allows the management of a project via bundle configuration files.

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
The above example builds (see [build](#build) task for more info) some bundles (in development mode
(unminified due to `--dev` flag)) and deploys them to
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
- [prompt:deploy](#promptdeploy)
- [requirejs](#requirejs)
- [watch](#watch)
- [mocha](#mocha)

### build
The 'build' task calls every sub task listed in a {bundle-name}.yaml config file except (by default can be
 altered in local wrangler config file):
		- clean (we could have this run via a flag in the future but is ignored for now to speed up performance)
		- deploy
		- jshint (called by the minify task so is ignored as standalone task)
		- csslint (called by the minify task so is ignored as a standalone task)

**Note:** The minify task runs 'jshint' and 'csslint' (along with other tasks) so that
is why they are being ignored as standalone tests.

'build' also adds the 'minify' task to it's list of tasks 'to' run for a particular bundle or bundles
depending on if an `html`, `css` or `js` section is found with the `files` section.

#####Flags:
Linting/hinting can be skipped by passing anyone of the following flags:
- `--skip-lint`
- `--skip-linting`
- `--skip-hint`
- `--skip-hinting`

Or if you want to skip 'csslint' `--skip-csslint` and/or 'jshint' `--skip-jshint`.

Development mode:
`--dev` - Skips minification for all *.css, *.js, and *.html files.

#####Usage:
`gulpw build:{bundle-name}` or run it for all bundles
`gulpw build`

#####In 'bundle.wrangler.config.yaml':
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
```

- **ignoredTasks {Array}:**  List of standalone tasks to ignore when calling build (*note some tasks are
 included as conglomerate tasks).

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

*The `files` section can have many different sections that output artifact files for
 example a `js`, `css`, or `html` section(s).
*See the ['minify'](#minify) section for more info on the possible sections supported by the `files` section.

#####Usage:
`gulpw clean:{bundle-name}` or for all bundles `gulpw clean`

#####In 'bundle.wrangler.config.yaml':
```
tasks:
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
The 'concat' task concatenates all files listed in the `files` section of a {bundle-name}.yaml file and
outputs the results
to the output destination listed in it's config section or 'minify''s config section (if they are not
defined for the 'concat' config section).

By default concat works only on works on the `js`, `css`, and/or `html` sections (currently hardcoded
(will be updated later)).

***Note do not run this task in conjunction with 'build' or 'minify' for any particular bundle cause
it's effects will
be nullified by the other tasks.

#####Flags:
Linting/hinting can be skipped by passing anyone of the following flags:
- `--skip-lint`
- `--skip-linting`
- `--skip-hint`
- `--skip-hinting`

Or if you want to skip 'csslint' `--skip-csslint` and/or 'jshint' `--skip-jshint`.

#####Usage:
`gulpw concat:{bundle-name}` or for all bundles `gulpw build`

#####In 'bundle.wrangler.config.yaml':
```
tasks:

  concat:
    header: |
      /*!
       * Company Name http://www.company-website.com
       * <%= bundle.options.alias %>.<%= fileExt %> <%= bundle.options.version %> (<%= (new Date()).getTime() %>)
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

- **header:** The header to output on the concatenated file.
- **cssBuildDir:** Output location for concatenated `*.css` files.
- **jsBuildDir:** Output location for concatenated `*.js` files.
- **htmlBuildDir:** Output location for concatenated `*.html` files.
- **allowedFileTypes:** The keys through loop through in the `files` section.
- **useVersionNumInFileName:** Whether to use the {bundle-name}.yaml file's version number suffixed to the
 concatenated file's name.
- **template:** The sub section which handles setting templates to javascript strings within the
 concatenated `js` section/files (*note a `js` section must be present within the `files` section in order
  for the template functionality to kick-in)
 - **templatePartial:** Lodash template to use for appending the template(s) strings to the concatenated
  '*.js' file.
 - **compressWhitespace:** Whether or not to compress white space in the collected template strings.
 - **templateTypeKeys:** Keys to look for in files to trigger the template string addition functionality.

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
The 'csslint' task runs csslint on a bundle or all bundles using the listed '.csslintrc' file or runs with
 default options if no '.csslintrc' file is listed.

#####Usage:
`gulpw csslint:{bundle-name}` or for all bundles `gulpw csslint`

#####In 'bundle.wrangler.config.yaml':
```
tasks:
  csslint:
      csslintrc: null
```

- **csslintrc:**  Location of '.csslintrc' file.

### deploy
Deploy's files using deploy section in 'bundle.wrangler.config.yaml' and deploy configuration generated by
'prompt:deploy' task.  See notes in config section below.

#####Usage:
`gulpw deploy:{bundle-name}` or for all bundles `gulpw deploy`

#####In 'bundle.wrangler.config.yaml':
```
tasks:
 # Deploy Task
  deploy:

    # Other files to be deployed
    otherFiles: []

    # Global deploy artifacts flag (used if no `deployArtifact` field is found for a section in this config
    deployArtifacts: true

    # Should files be linted before deploy
    lintBeforeDeploy: false

    # Local deploy config used to override local bundle.wrangler.yaml deploy config options.  Stored in `localConfigPath` whose default value is '.gulpw'
    localDeployFileName: deploy.yaml

    # Use one-to-one paths for undefined/null deploy paths.
    # If this is false and an undefined/null deploy path is found for a type an error
    # is thrown and the deploy tasks exits
    useOneToOnePaths: false

    # Use unix style paths for deployment
    deployUsingUnixStylePaths: true

    # Options written by `prompt:deploy` to `localDeployFileName`
    developingDomain: null
    hostnamePrefix: null
    hostname: null
    port: 22
    username: null
    password: null
    publickeyPassphrase: null
    privatekeyLocation: null

    # File types that are allowed for deployment
    allowedFileTypes:
      - js
      - css
      - html
      - json
      - yaml
      - jpg
      - png
      - gif
      - md
      - mkd

    # Domains to develop
    domainsToDevelop:

      # Hostname to develop for
      gulpw-sample.somedomain.com:

        # Servers where user can develop for `domainToDevelopFor` (in this case `domainToDevelopFor` is `gulpw-sample.somedomain.com`)
        hostnames: # slots/hosts
          - -devslot1.gulpw-sample.somedomain.com
          - -devslot2.gulpw-sample.somedomain.com
          - -devslot3.gulpw-sample.somedomain.com

        # All website instance prefixes represent the same website just different
        # instances of the website.

        # If object then we expect the hostname prefix (key) and site instance's folder path
        hostnamePrefixes:
          - web1
          - web2
          - web3

        hostnamePrefixFolders: null # If set will use these folders to suffix to `deployRootFolder`
          #web1: website1
          #web2: website2
          #web3: website3

        # Root folder on the server to use for deployments (prefix path for file paths being deployed)s)
        deployRootFolder: null # example: sites/<%= devHostnamePrefix %><%= devHostname %> (recieves the `deploy` has from this config)

        # Directories for deploying file types to specific paths within the selected {web-host}/[{web-host-prefix]
        typesAndDeployPathsMap:
          font: public/media/fonts/
          html: public/
          video: public/media/videos/
          image: public/media/images/
          js: public/js/
          css: public/css/

```

### jshint
JsHint task.  If `jshintrc` is specified those options are used instead (maybe we'll merge these options
 in the future?).

#####Usage:
`gulpw jshint:{bundle-name}` or for all bundles `gulpw jshint`

#####In 'bundle.wrangler.config.yaml':
```
tasks:
  jshint:
    jshintrc: ./configs/.jshintrc
    ignoreFiles: null
    options:
      predef:
        - $
        - _
        - amplify
        - Backbone
        - browserify
        - define
        - jQuery
        - Modernizr
        - Mustache
        - Marionette
        - require
        - sjl
```

### minify
The 'minify' task is a big composite task due to the many subtasks it handles.
The minify task launches the following tasks per file in it's sources array (task only launch for
corresponding file types):
- gulp-csslint
- gulp-minify-css
- gulp-jshint
- gulp-uglify
- gulp-minify-html

The `template` hash in the options for this task takes care of importing templates using a lodash template
into your javascript file (appended to the bottom of the javascript file)(read notes in config description).

#####Flags:
Linting/hinting can be skipped by passing anyone of the following flags:
- `--skip-lint`
- `--skip-linting`
- `--skip-hint`
- `--skip-hinting`

Or if you want to skip 'csslint' `--skip-csslint` and/or 'jshint' `--skip-jshint`.

Development mode:
`--dev` - Skips minification for all *.css, *.js, and *.html files.

#####Usage:
`gulpw minify:{bundle-name}` or for all bundles `gulpw minify`

#####In 'bundle.wrangler.config.yaml':
```
tasks:

  minify:

    # Header for top of file (lodash template)
    header: |
      /*! Company Name http://www.company-website.com <%= bundle.options.alias %>.js <%= bundle.options.version %> */
    cssBuildDir: some/css/build/path
    htmlBuildDir: some/html/build/path
    jsBuildDir: some/js/build/path
    allowedFileTypes: # allowed files types to process for the main tasks (css, js, and html)
      - js
      - css
      - html
    htmlTaskOptions:
      spare: true
      comments: false
    jsTaskOptions: {}
    useMinPreSuffix: false
    useVersionNumInFileName: false
    template:
      templatePartial: null # lodash template
      compressWhitespace: true
      templateTypeKeys: # template keys to look for in `files` hash of a bundle
        - mustache
        - handlebars
        - ejs
```

### prompt:deploy
Launches an interactive questionnaire for generating a local 'deploy.yaml' file with deployment details
 for current development environment.
****Note**** This task must be run before the `deploy` task in order for it to function.
****Note**** File is put in the directory specified by `localConfigPath` of the
 'bundle.wrangler.config.yaml' file or the default is used ('./.gulpw').

#####Usage:
`gulpw prompt:deploy`

#####In 'bundle.wrangler.config.yaml':
No bundle.wrangler.config section at this time.

- **localDeployFileName**: This property of the deploy task (`tasks.deploy.localDeployFileName`)
list the file name to use when generating a local deploy options file.

### requirejs
RequireJs task.

#####Usage:
`gulpw requirejs:{bundle-name}` or for all bundles `gulpw requirejs`

#####In 'bundle.wrangler.config.yaml':
```
tasks:

  # RequireJs Defaults
  requirejs:
    options:
      # requirejs options here
      ...
```

### watch
Watch task.

#####Usage:
`gulpw watch:{bundle-name}` or for all bundles `gulpw watch`

#####In 'bundle.wrangler.config.yaml':
```
tasks:

  # Watch Task Defaults
  watch:

    # Standalone tasks to ignore on the bundle level (watch creates it's own collection of deploy tasks from the bundle(s) registered with it)
    ignoredTasks:
      - clean
      - deploy

    # Tasks to run on file changes.
    tasks:
      - build
      - deploy

    # Other files to watch (can be overridden from the bundle level as well)
    otherFiles: null
```

### mocha
Mocha tests task runs the mocha module on your test 'files' array or string using `options` if any.

#####Flags
- Skip Testing:
  - `--no-tests`
  - `--skip-tests`
  - `--skip-testing`
  - `--no-mocha-tests`
  - `--skip-mocha-tests`
  - `--skip-mocha-testing`

#####Usage:
`gulpw mocha:{bundle-name}` or for all bundles `gulpw mocha`

#####In 'bundle.wrangler.config.yaml':
```
tasks:
  mocha:
    # {String|Array} of files.  Default `null`
    files: # or ./some/tests/**/*.js
      - some/tests/folder/with/tests/**/*.js
      - some/tests/file.js
    options: null # - {Object} - Options if any.  Default `null`
```


### jasmine
Jasmine tests task runs the jasmine module on your test 'files' array or string using `options` if any.

#####Flags
- Skip Testing:
  - `--no-tests`
  - `--skip-tests`
  - `--skip-testing`
  - `--no-jasmine-tests`
  - `--skip-jasmine-tests`
  - `--skip-jasmine-testing`

#####Usage:
`gulpw jasmine:{bundle-name}` or for all bundles `gulpw jasmine`

#####In 'bundle.wrangler.config.yaml':
```
tasks:
  jasmine:
    # {String|Array} of files.  Default `null`
    files: # or ./some/tests/**/*.js
      - some/tests/folder/with/tests/**/*.js
      - some/tests/file.js
    options: null # - {Object} - Options if any.  Default `null`
```

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
- [ ] General:
  - [X] - Should merge local config on top of bundle.wrangler.config.yaml when ever tasks are run
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
  - [ ] - Supply example bundle config file with all sections listed in it.
  - [X] - Add support for bundle config files in any one of 'js', 'json', or 'yaml' formats.
  - [X] - ~~Set up pipe transport function for 'mocha' and 'jasmine' proxies.~~  No longer needed.

### Version 0.2.0 Todos
- [ ] - Tasks
	- [ ] - browserify
	- [ ] - develop - Task for launching browser with specified path and launching watch task for specified
	 bundle.
	- [ ] - jsdoc ~~document (jsdoc, groco, etc)~~
	- [ ] - vulcanize (for polymer build tool)
- For `Bundle`:
	- [ ] - The watch task should be reset whenever the {bundle}.yaml file that it is using to watch files
	 is changed and also when running the global watch the watch task should reset whenever a bundle is
	  changed.
- General:
  - [ ] - Prettify console output in all tasks, and make all output look simliar (follow a matisse).
  - [ ] - Fix all non streaming tasks to return streams or promises so that other tasks can list them as
   dependencies.
  - [ ] - Clean up notes for deploy task.
  - [ ] - Make 'prompt:deploy' more robust by making some of the config parameters optional (also doctor
  up deploy task to take this into account)
  - [ ] - Make sure all tasks return promises:
    - [X] - requirejs
    - [X] - mocha
    - [ ] - 

### ~~Notes~~ Caveats:

- ~~Be able to pass in multiple flags from the command line (some with values some without values).  Running
 multiple tasks and passing in multiple flags and flags with values are allowed  (flags and values need to
  be passed in last for this to work (cli doesn't differentiate between task names and param/flag values));
    E.g., `gulp task1 --flag1 flag-value --flag2 --flag3 task2 --flag4` will only run `task1` and will parse
    task2 as a value of --flag2 unless you explicitely pass a value to --flag3~~
- Build files cannot be shared amongst bundles when wanting to use the 'watch' task cause they cause a
 cyclic dependency when running global
 watch tasks;  I.e., `gulpw watch`

### Resources

- [Initial UML Diagram](http://www.gliffy.com/go/publish/6312461)(http://www.gliffy.com/go/publish/6312461) (original design has diverged a bit from original diagram).
- [gulpjs site](http://gulpjs.com/)(http://gulpjs.com/)
- [gulpjs docs](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md)(https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md)
- [gulpjs plugins](http://gulpjs.com/plugins/)(http://gulpjs.com/plugins/)
- [gulpw sample app](https://github.com/elycruz/gulpw-sample-app)(https://github.com/elycruz/gulpw-sample-app) (needed when running tests for `gulpw`)

### License(s):
- MIT (http://opensource.org/licenses/MIT)
- GNU v2+ (http://www.gnu.org/licenses/gpl-2.0.html)
- GNU v3 (http://www.gnu.org/licenses/gpl.html)
