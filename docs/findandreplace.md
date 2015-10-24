### findandreplace
Finds and replaces strings in files.

##### In gulpw-config.*:
```
tasks:
  findandreplace:
    constructorLocation: ./src/bundle-tasks-adapters/FindAndReplaceAdapter.js
    priority: -98
    # 'gulp-replace' module options
    # @see for available options: https://www.npmjs.com/package/gulp-replace
    #options:

```

##### In {bundle}.*:
```
findandreplace:
    # Files to find and replace on.
    #files: {Array}
    
    # Key value hash of things to search for (regex|string) and values (string) to replace them with.
    # ** Note ** This feature is not supported yet.
    #findandreplace: {Object}
```