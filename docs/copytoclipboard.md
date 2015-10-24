### copytoclipboard
Copies files to clipboard.

##### In gulpw-config.*:
```
tasks:
  copytoclipboard:
    alternateAlias: clipboard
    constructorLocation: ./src/bundle-tasks-adapters/CopyToClipboardTaskAdapter.js
    priority: -100

```

##### In {bundle}.*:
```
copytoclipboard:
    # The following two attributes are optional but at least one must declared inorder to use this task:
    #file: {String} - Optional.
    #files: {String|Array} - Optional.
```

##### Flags:
None.

