gulp-bundle-wrangler (Beta)
====================

Allows the management of a website or web application via bundle configuration files from the
command line (uses gulp in the background) and makes feature based development easier.

## Basic Idea
So the idea is as follows:
    We have a `bundles` directory (could be named anything via the `bundle.wrangler.config.*` file).
That directory should contain "bundle-configuration" files which are used by "task adapters" to run a
task via the command line;  E.g., `$ gulpw build:global deploy:global deploy:other-bundle`.
The bundle files will then hold the user's configurations in the *.yaml, *.json, or *.js format.

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
2. Call `gulpw` from your projects root (a `bundle.wrangler.config.*` file will be generated there).
    Then run `gulpw config` to help populate the file (file can be customzied manually instead).
3. Tell your `bundle.wrangler.config.*` file where your bundle configs folder is: Set `bundlesPath` to your bundles config path.
5. Configure your global tasks within your `bundle.wrangler.config.*` file.
6. (Optional) Execute `gulpw deploy-config` to configure servers to deploy your work to.
7. Reap the benefits of using gulpw.

### Bundle config
A bundle config:
- is made of either a *.yaml, *.json, or *.js file with one or more properties listed in it.
- can have many config sections used by tasks.
- can be created by calling `gulpw bundle-config`.  Note this task will not overwrite existing bundles but will let
you know when they already exists and will prompt you to enter a new name/alias.

##### Valid Bundle Config file:
```
# some-other-bundle.yaml
alias: some-other-bundle
```

##### Another Valid Bundle Config file:
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
- [browserify](#browserify)
- [build](#build)
- [bundle](#bundle)
- [clean](#clean)
- [compass](#compass)
- [config](#config)
- [copy](#copy)
- [csslint](#csslint)
- [deploy](#deploy)
- [deploy-config](#deploy-config)
- [eslint](#eslint)
- [help](#help)
- [jasmine](#jasmine)
- [jshint](#jshint)
- [minify](#minify)
- [mocha](#mocha)
- [requirejs](#requirejs)
- [watch](#watch)

### browserify

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

##### Options:
- **ignoredTasks {Array}:**  List of standalone tasks to ignore when calling build (*note some tasks are
 included as conglomerate tasks).

##### Flags:
`--skip-linting`, `--skip-csslint`, `--skip-jshint`, `--dev`,
`--skip-testing`, `--skip-mocha-test`, `--skip-jasmine-tests`

##### In 'bundle.wrangler.config.*':
```
tasks:
  # Build Task (Looks through {bundle-alias}.yaml file and runs
  # all tasks that are not in the `ignoreTasks`
  build:
    ignoredTasks:
      - clean
      - deploy
      - jshint
      - csslint
```

##### In {bundle}.*:
None.


### bundle

### clean
The 'clean' task cleans out any artifact files outputted by a bundle;  E.g., if a bundle has a `files` key or
`requirejs` key then the artifacts outputted by these sections are cleaned up (deleted) when clean is called.
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

##### Options:
- **allowedFileTypes: {Array}:** A list of file types to allow for cleaning.

##### In 'bundle.wrangler.config.*':
```
tasks:
  clean:
    allowedFileTypes:
      - js
      - css
      - html
```

##### In {bundle}.*:
```
 clean:
   - some/file/path.js
   - some/file/path.css
   - etc.
```

### compass
The 'compass' task calls 'compass compile' at compass project root location (config.rb home).

##### In bundle.wrangler.config.*:
```
tasks:
  compass:
  	# Compass project root dir
    configrb: null # config.rb home
```

##### In {bundle}.*:
```
  compass:
  	# Compass project root dir
    configrb: null # config.rb home
```

##### Options:
None.

##### Flags:
None.


### config
The config task backs up an existing bundle.wrangler.config.* (file could be empty) and creates a new
bundle.wrangler.config file in the chosen format.  The task also allows you to choose which sections
(with defaults) to include in the file.

##### Options:
None.

##### Flags:
None.

##### In 'bundle.wrangler.config.*':
None.

##### In {bundle}.*:
None.

### copy
The 'copy' task copies any files listed in a `copy` section's `files` hash within in a {bundle-name}.* config file.
E.g.,
```
copy:
  files:
    ./fe-dev/bower_components/requirejs/require.js: ./public/js/vendors/require.js
```

'copy' copies the 'key' to the 'value' location for every entry in the `files` hash.

##### Options:
None.

##### In bundle.wrangler.config.*:
None.

##### In {bundle}.*:
```
copy:
  files:
    ./this/path/gets/copied/to: ./this/path
```

##### Flags:
None.


### csslint
The 'csslint' task runs csslint on a bundle or all bundles using the listed '.csslintrc' file or runs with
 default options if no '.csslintrc' file is listed (default options are listed in `bundle.wrangler.config.*` file
 and also `wrangler.config.yaml` also has a default definition set up for it).

##### In bundle.wrangler.config.*:
```
tasks:
  csslint:
      csslintrc: null
```

##### Options:
- **csslintrc:**  Location of '.csslintrc' file.

##### In {bundle}.*:
None.

##### Flags:
None.

### deploy
The `deploy` task deploys files using the deploy section in a user's local 'bundle.wrangler.config.*' and also uses a user level deploy configuration generated by
the 'deploy-config' task.  See notes in config section below.

##### In bundle.wrangler.config.*:
```
tasks:
 # Deploy Task
  deploy:

    # Use unix style paths for deployment
    deployUsingUnixStylePaths: true

    # Options written by `deploy-config` to `.gulpw/deploy.yaml`
    developingDomain: null
    hostnamePrefix: null
    hostname: null
    port: 22
    username: null
    password: null
    publickeyPassphrase: null
    privatekeyLocation: null

    # File types that are allowed for deployment
    allowedFileTypes: # This will change to `ingoredFileTypes`
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
      somedomain.com:

        # Servers where user can deploy to `domainToDevelopFor`
        # (in this case `domainToDevelopFor` is `somedomain.com`)
        hostnames: # slots/hosts
          - -devslot1.somedomain.com
          - -devslot2.somedomain.com
          - -devslot3.somedomain.com

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

        # Root folder on the server to use for deployments (prefix
        # path for file paths being deployed that don't have
        # `deployRootFoldersByFileType` defined for their typ)))
        # example: /home/some-user/sites/<%= hostnamePrefix %><%= hostname %>
        # (recieves the `deploy` has from this config)
        deployRootFolder: null

        # Deploy roots by file type. If defined, file types that are keys in
        # it's hash will have the deploy root for said key
        # prepend as a deploy root to the file being deployed instead of the
        # `deployRootFolder` root path.
        deployRootFoldersByFileType:
          md: /home/some-user/docroot/md-files.<%= hostnamePrefix %><%= hostname %>/

```

### deploy-config
Launches an interactive questionnaire for generating a local 'deploy.yaml' file with deployment details
 for current development environment.
****Note**** This task must be run before the `deploy` task in order for it to function.
****Note**** File is put in the directory specified by `localConfigPath` of the
 'bundle.wrangler.config.*' file or the default is used ('./.gulpw').

##### In 'bundle.wrangler.config.*':
None.


### eslint

### help

Coming soon

### jasmine
Jasmine tests task runs the jasmine module on your test 'files' array or string using `options` if any.

##### Options:
Jasmine options (see jasmine module for available options).

##### Flags:
- Skip Testing:
  - `--skip-tests`, `--skip-testing`, `--skip-jasmine-tests`, `--skip-jasmine-testing`

##### In 'bundle.wrangler.config.*':
```
tasks:
  jasmine:
    files:
      - some/tests/folder/with/tests/**/*.js
      - some/tests/file.js
    options: null # - {Object} - Jasmine options if any.  Default `null`
```

##### In {bundle}.*:
```
jasmine:
  files:
    - some/tests/folder/with/tests/**/*.js
    - some/tests/file.js
```

### jshint
JsHint task.  If `jshintrc` is specified those options are used instead (maybe we'll merge these options
 in the future?).

##### Options:
See jshint module for options.

##### Flags:
`--skip-jshint`, `skip-jslint`, `skip-linting`

##### In 'bundle.wrangler.config.*':
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

##### In {bundle}.*:
```
jshint:
    jshintrc: ./.jshintrc
    options:
        ... # see jshint module for options
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

##### Flags:
`--skip-linting`, `--skip-csslint`, `--skip-jshint`, `--skip-jslint`, `--dev`

##### In 'bundle.wrangler.config.yaml':
```
tasks:
  minify:
    # Header for top of file (lodash template)
    header: |
      /*! Company Name http://www.company-website.com <%= bundle.options.alias %>.js <%= bundle.options.version %> */
    cssBuildPath: some/css/build/path
    htmlBuildPath: some/html/build/path
    jsBuildPath: some/js/build/path
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

##### In {bundle}.*:
```
files:
    js: # {Array} of file paths
        ...
    css: # {Array} of file paths
        ...
    html: # {Array} of file paths
        ...
    mustache: # {Array} of file paths
        ...
    handlbars: # {Array} of file paths
        ...
    ejs: # {Array} of file paths
        ...
```


### mocha
Mocha tests task runs the mocha module on your test 'files' array or string using `options` if any.

##### Flags
- Skip Testing:
  - `--skip-tests`, `--skip-testing`, `--skip-mocha-tests`, `--skip-mocha-testing`

##### Options:
Mocha options.  See Mocha module for options.

##### In 'bundle.wrangler.config.yaml':
```
tasks:
  mocha:
    # {String|Array} of files.  Default `null`
    files: # or ./some/tests/**/*.js
      - some/tests/folder/with/tests/**/*.js
      - some/tests/file.js
    options: null # - {Object} - Options if any.  Default `null`
```

##### In {bundle}.*:
```
mocha:
  files:
    - some/tests/folder/with/tests/**/*.js
    - some/tests/file.js
```

### requirejs
RequireJs task.

#####In 'bundle.wrangler.config.yaml':
```
tasks:
  requirejs: null # requirejs options here
    #options:
      ...
```

##### In {bundle}.*:
```
requirejs:
  options:
    ...
```

### watch
The 'watch' task watches any files listed in the `requirejs`, `files.*`, and `watch.otherFiles`
keys (this will be dynamic in upcoming version so that you can say what keys should be watched by
default.

##### Options:
- **ignoredTasks {Array}:** Tasks to ignore by default.
- **tasks {Array}:** Tasks to run sequentially when a watched file change is detected.
- Not implemented yet ~~**otherFiles {Array}:** Other files to watch globally.  Default `null`.~~

##### Flags:
- Not yet implement ~~`--file-type` (`--ext`, `-t`) - A list of comma separated file types to watch explicitly (ignores all other file types).~~

##### In 'bundle.wrangler.config.*':
```
tasks:
  watch:
    ignoredTasks:
      - clean
      - deploy
    tasks:
      - build
      - deploy
    otherFiles: null
```

##### In {bundle}.*:
```
watch:
  otherFiles:
    - path/to/some/file.js
    - path/to/some/file.file
    - ...
```

### Available Flags:
**Note** All long forms of these flags use the `--{flag-name}` format.  Short forms use `-{flag-one-letter-alias}`.
- **file-types:**  Used to pass a comma separated list of file extensions to the defined tasks.
    - **Affected tasks:**
        - `deploy` - Uses `--file-types` string to only deploy files of the types you passed in via `--file-types` or one of it's aliases.
    - **Aliases:** `--ext`, `-t`
- **debug:** Used for developing gulpw and allows you to keep your more pertinent debug logging declarations.
    - **Aliases:** None.
- **dev:** Used to ignore minification (at this time).
    - **Affected tasks:**
        - `minify` ~~and `concat`~~ - Minification is skipped when used with these tasks.
- **skip-tests:** Causes `mocha` and `jasmine` tests to not run.
    - **Aliases:** `--no-tests`, `--skip-testing`
- **verbose:** Used to print verbose mode logs.
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
