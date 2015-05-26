### eslint
The `eslint` task expects `gulp-eslint` options (link to gulp-eslint: https://github.com/adametry/gulp-eslint)
along with a couple of custom optional attributes:

##### In bundle.wrangler.config.*:
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
