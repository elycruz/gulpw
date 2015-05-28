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
  # Boolean for also watching files in `deploy.otherFiles` hash
  watchDeployOtherFilesToo: false
  otherFiles:
    - path/to/some/file.js
    - path/to/some/file.file
    - ...
```
