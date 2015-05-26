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

##### In 'gulpw-config.*':
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
Creates a bundle config file in the designated 'bundlesPath' property
described in your gulpw-config.* file.

##### In gulpw-config.*:
```
static-tasks:
  bundle:
    allowedTasks:
      - browserify
      - compass
      - copy
      - csslint
      - deploy
      - jasmine
      - jshint
      - mocha
      - requirejs
      - watch
```

##### Options:
- **allowedTasks:**  List of tasks that the user is allowed to choose
from when generating a new bundle config.

##### In {bundle}.*:
None.

##### Flags:
- **bundle:** Sets the default bundle name to use for the new bundle
config file for the current bundle generation session.  Default 'bundle'.
Optional (will ask the user for the name of the bundle to generate
 but will have the passed in --bundle value as the default).


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

##### In 'gulpw-config.*':
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

##### In gulpw-config.*:
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
The config task backs up an existing gulpw-config.* (file could be empty) and creates a new
gulpw-config file in the chosen format.  The task also allows you to choose which sections
(with defaults) to include in the file.

##### Options:
None.

##### Flags:
None.

##### In 'gulpw-config.*':
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

##### In gulpw-config.*:
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
 default options if no '.csslintrc' file is listed (default options are listed in `gulpw-config.*` file
 and also `wrangler.config.yaml` also has a default definition set up for it).

##### In gulpw-config.*:
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
The `deploy` task deploys files using the deploy section in a user's local 'gulpw-config.*' and also uses a user level deploy configuration generated by
the 'deploy-config' task.  See notes in config section below.

##### In gulpw-config.*:
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
 'gulpw-config.*' file or the default is used ('./.gulpw').

##### In 'gulpw-config.*':
None.


### eslint
The `eslint` task expects `gulp-eslint` options (link to gulp-eslint: https://github.com/adametry/gulp-eslint)
along with a couple of custom optional attributes:

##### In gulpw-config.*:
```
tasks:
    eslint:
        options:
            useEslintrc: true // Whether to use .eslintrc file
        failAfterError: false
        failOnError: false
        eslintrc: ./.eslintrc // deprecated.  Use options hash map instead
```

##### Options:
- **options:**  `gulp-eslint` options (https://github.com/adametry/gulp-eslint)
    - **useEslintrc:** {Boolean} - Whether to use .eslintrc files found in the directories checked.  Default 'true'.
- **failAfterError:** {Boolean} - Whether to fail the task after an error or not.  Default 'false'.
- **failOnError:** {Boolean} - Whether to fail the task on an error or not.  Default 'false'.

##### In {bundle}.*:
None.

##### Flags:
- **skip-lint{ing}**
- **skip-jshint{ing}**
- **skip-jslint{int}**

### help

Coming soon

### jasmine
Jasmine tests task runs the jasmine module on your test 'files' array or string using `options` if any.

##### Options:
Jasmine options (see jasmine module for available options).

##### Flags:
- Skip Testing:
  - `--skip-tests`, `--skip-testing`, `--skip-jasmine-tests`, `--skip-jasmine-testing`

##### In 'gulpw-config.*':
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

##### In 'gulpw-config.*':
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

##### In 'gulpw-config.yaml':
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

##### In 'gulpw-config.yaml':
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

#####In 'gulpw-config.yaml':
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

##### In 'gulpw-config.*':
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
