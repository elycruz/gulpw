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

