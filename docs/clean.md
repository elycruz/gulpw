
### clean
The 'clean' task cleans out any artifact files outputted by a bundle;  E.g., if a bundle has a `files` key or
`requirejs` key then the artifacts outputted by these sections are cleaned up (deleted) when clean is called.
'clean' also cleans/deletes any files listed in a `clean` section;  E.g.,

```
 clean:
   - some/file/path.js
   - some/file/path.css
   - etc.
```

*The `files` section can have many different sections that output artifact files for
 example a `js`, `css`, or `html` section(s).
*See the ['minify'](#minify) section for more info on the possible sections supported by the `files` section.

##### Options:
- **allowedFileTypes: {Array}:** A list of file types to allow for cleaning.

##### In 'bundle.wrangler.config.*':
```
tasks:
  clean:
    allowedFileTypes:
      - js
      - css
      - html
```

##### In {bundle}.*:
```
 clean:
   - some/file/path.js
   - some/file/path.css
   - etc.
```
