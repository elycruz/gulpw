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

