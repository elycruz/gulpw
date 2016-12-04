
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
