
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
