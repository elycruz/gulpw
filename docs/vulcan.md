### vulcan
Vulcan + crisper task

#####In 'gulpw-config.yaml':
```
tasks:
  # Runs vulcanize and crisper on a file and alternately the file hash as a prefix or suffix
  # to the file's basename.
  vulcan:
    constructorLocation: ./src/bundle-tasks-adapters/VulcanTaskAdapter
    priority: 92

    # Files to vulcanize
    # files: // Populated from bundle.{json,js,yaml} file

    # Destination directory for resulting files
    # destDir: // Populated from bundle ""

    # Crisper options
    # @see for available options see: https://www.npmjs.com/package/crisper
    #crisperOptions:
      #jsFileName: # populated from bundle.  Optional.  Default `bundle.alias`
      #scriptInHead: false.  Puts script in head with 'defer' attribute.
      #onlySplit: false.  If false, omits script include of outputted javascript file

    # Vulcanize options (options for `gulp-vulcanize`)
    # @see for available options: https://github.com/Polymer/vulcanize#using-vulcanize-programmatically
    vulcanizeOptions:
      inlineScripts: true
      inlineCss: true

    # Remove generated 'html>head+body' elements and just keep the body's contents
    # @see for more options: https://www.npmjs.com/package/gulp-dom
    #noDomWrapper: false # Best used from bundle config level

```

##### In {bundle}.*:
```
  "Same as in 'gulp-config.yaml' file except `constructorLocation` and `priority` options."
```

##### Flags:
--show-file-sizes