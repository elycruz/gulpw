### csslint
The 'csslint' task runs csslint on a bundle or all bundles using the listed '.csslintrc' file or runs with
 default options if no '.csslintrc' file is listed (default options are listed in `gulpw-config.*` file
 and also `wrangler.config.yaml` also has a default definition set up for it).

##### In gulpw-config.*:
```
tasks:
  csslint:
      csslintrc: null
```

##### Options:
- **csslintrc:**  Location of '.csslintrc' file.

##### In {bundle}.*:
None.

##### Flags:
None.
