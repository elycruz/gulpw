### Available Flags:
**Note** All long forms of these flags use the `--{flag-name}` format.  Short forms use `-{flag-one-letter-alias}`.
All flag default values are `null`/`false`.
- **bundle:** Reserved but not yet used.
- **file-types:**  Used to pass a comma separated list of file extensions to the defined tasks.
    - **Affected tasks:**
        - `deploy` - Uses `--file-types` string to only deploy files of the types you passed in via `--file-types` or one of it's aliases.
    - **Aliases:**
        - `--filetypes`
        - `--filetype`
        - `--ext`
        - `-t`
        - `-x`
- **force:** Used to force the task runner to continue despite any errors.
    - **Aliases:** -f
- **debug:** Used for developing gulpw and allows you to keep your more pertinent debug logging declarations.
    - **Aliases:** None.
- **dev:** Used to ignore minification (at this time).
    - **Affected tasks:**
        - `minify` Minification is skipped when used with this flag.
- **verbose:** Used to print verbose mode logs.
    - **Aliases:** `-v`
- **async:** Runs all tasks asynchronously.  **Note** This may cause race condition errors between certain tasks;  E.g.,
    ``` gulpw build deploy ``` // If you have many bundles deploy may fire before all build sub-tasks are done cause a failure (deploy task will timeout while waiting for files to become available for deploy if they are being used). 
    - **Aliases:** `-a`
- **section:** Used by static help task to show help for a given readme.md section.
- **skip-artifacts:** Causes artifacts to be skipped on deploy task.
- **skip-css-linting:** Causes any css linting/hinting to be skipped from the `minify` task.
- **skip-jasmine-testing:** Causes Jasmine tests to be skipped.
- **skip-js-linting:** Causes js linting tasks to be skipped (jshint/eslint).
- **skip-linting:** Causes css and js linting/hinting to be skipped via 'minify' task.
    - **Aliases:** --skip-jshint --skip-jslint --skip-linting
- **skip-mocha-testing:** Causes mocha tests to be skipped.
- **skip-tests:** Causes `mocha` and `jasmine` tests to not run.
    - **Aliases:** 
        - `--no-tests`
        - `--skip-testing`
