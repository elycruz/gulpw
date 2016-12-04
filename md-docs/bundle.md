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
