gulp-bundle-wrangler (Beta)
====================

Allows the management of a project via bundle configuration files from the
command line (uses gulp in the background).

## Quick Start

## Basic Idea
So the idea is as follows:
  We have a `bundles` directory (could be named anything via the `bundle.wrangler.config.*` file).
That directory should contain "bundle-configuration" files which are used within "task proxies" to run a
 task via the command line;  E.g., `$ gulpw build:global deploy:global deploy:other-bundle`.
 The configuration files will then hold the user's configurations in the *.yaml, *.json, or *.js format.

## Quick Nav
- [Install](#install)
- [Setup](#setup)
- [Bundle config](#bundle-config)
- [Running tasks](#running-tasks)
- [Available tasks](#available-tasks)
- [Caveats](#caveats)
- [Resources](#resources)
- [Available flags](#available-flags)
- [Todos](https://github.com/elycruz/gulpw/blob/master/TODOS.md)

### Install
Install the `gulpw` module globally `npm install gulpw -g` and
locally  from project root `npm install gulpw`.

### Setup
1. Create your project's bundle configs folder;  E.g., './bundle-configs' etc.
2. Create your project's empty or non-empty `bundle.wrangler.config.*` file.  Then run `gulpw config` to populate the file.
3. Tell your `bundle.wrangler.config.*` file where your bundle configs folder is: Set `bundlesPath` to your bundles config path.
5. Configure your global tasks within your `bundle.wrangler.config.*` file.
6. Execute `gulpw deploy-config` to configure servers to deploy your work to (this step is not currently optional).
7. Reap the benefits of using gulpw.

### Bundle config
A bundle config:
- is made of either a *.yaml, *.json, or *.js file with one or more properties listed in it.
- only requires an `alias` property to be a valid bundle config file.
- can have many sections used by tasks.
- can be creaated by calling `gulpw bundle-config`.  Note this task will not overwrite existing bundles but will let
you know when they already exists and will prompt you to enter a new name/alias.

#####Valid Bundle Config file:
```
# some-other-bundle.yaml
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

See the listed tasks below for ideas on what other sections you can use in your bundle files.
Also when running `gulpw config` you will be asked about the tasks you want to include which will
then be included in your bundle file consequently depending on your answers.

### Running tasks
- `gulpw {task-name}:{bundle-name}` to run task for one bundle.
- `gulpw {task-name}` to run tasks for all bundles.

where `{task-alias}` is the task you want to run ('build', 'minify' etc.)
and `{bundle-alias}` is the bundle you want to run the task for (for './bundle-configs/hello-world.yaml'
 the bundle alias would be `hello-world`.

Also, e.g., `gulpw build:global build:some-other-bundle deploy:global deploy:some-other-bundle --dev`
The above example builds (see [build](#build) task for more info) some bundles (in development mode
(unminified due to `--dev` flag)) and deploys them to
 the users selected server (see [deploy](#deploy) task section for more info).

## Available Tasks
- [build](#build)
- [bundle-config](#bundleconfig)
- [clean](#clean)
- [compass](#compass)
- [concat](#concat)
- [config](#config)
- [copy](#copy)
- [csslint](#csslint)
- [deploy](#deploy)
- [deploy-config](#deployconfig)
- [jshint](#jshint)
- [minify](#minify)
- [requirejs](#requirejs)
- [watch](#watch)
- [mocha](#mocha)

## Available Flags
- --dev (-d)
- --file-types (-t, --ext)
- --debug
- --verbose (-v)
- --skip-linting (--skip-hinting)

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

### bundle-config

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

### config
The config task backs up an existing bundle.wrangler.config.* (file could be empty) and creates a new
bundle.wrangler.config file in the chosen format.  The task also allows you to choose which sections
(with defaults) to include in the file.

** Usage **: `gulpw config`

### compass
The 'compass' task calls compass compile at compass project root location (config.rb home).

##### In bundle.wrangler.config.*:
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

##### In bundle.wrangler.config.*:
none.

##### In {bundle}.*:
```
copy:
  files:
    ./this/path/gets/copied/to: ./this/path
```

### csslint
The 'csslint' task runs csslint on a bundle or all bundles using the listed '.csslintrc' file or runs with
 default options if no '.csslintrc' file is listed.

##### In bundle.wrangler.config.*:
```
tasks:
  csslint:
      csslintrc: null
```

- **csslintrc:**  Location of '.csslintrc' file.

### deploy
Deploy's files using deploy section in 'bundle.wrangler.config.yaml' and deploy configuration generated by
'prompt:deploy' task.  See notes in config section below.

##### In bundle.wrangler.config.*:
```
tasks:
 # Deploy Task
  deploy:

    # Should files be linted before deploy
    lintBeforeDeploy: false

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

        # An array of hostname prefixes (if any)
        hostnamePrefixes:
          - web1
          - web2
          - web3

        # If set a `hostnamePrefixFolder` value becomes available
        # to any templates within this `domainToDevelopConfig[x]` config.
        hostnamePrefixFolders: null
          #web1: website1
          #web2: website2
          #web3: website3

        # Root folder on the server to use for deployments (prefix path for file paths being deployed that don't have
        # `deployRootFoldersByFileType` defined for their typ)))
        deployRootFolder: null # example: /home/some-user/sites/<%= hostnamePrefix %><%= hostname %> (recieves the `deploy` has from this config)

        # Deploy roots by file type. If defined, file types that are keys in it's hash will have the deploy root for said key
        # prepend as a deploy root to the file being deployed instead of the `deployRootFolder` root path.
        deployRootFoldersByFileType:
          md: /home/some-user/docroot/md-files.<%= hostnamePrefix %><%= hostname %>/

```

### deploy-config

### jshint
JsHint task.  If `jshintrc` is specified those options are used instead (maybe we'll merge these options
 in the future?).

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

#####In 'bundle.wrangler.config.yaml':
No bundle.wrangler.config section at this time.

- **localDeployFileName**: This property of the deploy task (`tasks.deploy.localDeployFileName`)
list the file name to use when generating a local deploy options file.

### requirejs
RequireJs task.

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

### Available Flags:
**A Note on using flags:**
- **`--file-types`:**  Used to pass a comma separated list of file extensions to your tasks.
    - **Affected tasks:**
        - `deploy` - Uses `--file-types` string to only deploy files of the types you passed in via `--file-types` or one of it's aliases.
    - **Aliases:** `--ext`
- **`--debug`:** Used for developing gulpw and allows you to keep your more pertinent debug logging declarations.
    - **Aliases:** `-d`
- **`--skip-tests`:**
    - **Aliases:** `--no-tests`, `--skip-testing`
- **`--verbose`:**
    - **Aliases:** `-v`

### Caveats:
- ~~Be able to pass in multiple flags from the command line (some with values some without values).  Running
 multiple tasks and passing in multiple flags and flags with values are allowed  (flags and values need to
  be passed in last for this to work (cli doesn't differentiate between task names and param/flag values));
    E.g., `gulp task1 --flag1 flag-value --flag2 --flag3 task2 --flag4` will only run `task1` and will parse
    task2 as a value of --flag2 unless you explicitely pass a value to --flag3~~
- Build files cannot be shared amongst bundles when wanting to use the 'watch' task cause they cause a
 cyclic dependency when running global
 watch tasks;  I.e., `gulpw watch`

### Resources
- [Initial UML Diagram](http://www.gliffy.com/go/publish/6312461) (http://www.gliffy.com/go/publish/6312461) (original design has diverged a bit from original diagram).
- [gulp site](http://gulpjs.com/) (http://gulpjs.com/)
- [gulp docs](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md) (https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md)
- [gulp plugins](http://gulpjs.com/plugins/) (http://gulpjs.com/plugins/)
- [gulpw sample app](https://github.com/elycruz/gulpw-sample-app) (https://github.com/elycruz/gulpw-sample-app) (needed when running tests for `gulpw`)

### License(s):
- MIT (http://opensource.org/licenses/MIT)
- GNU v2+ (http://www.gnu.org/licenses/gpl-2.0.html)
- GNU v3 (http://www.gnu.org/licenses/gpl.html)
