
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
