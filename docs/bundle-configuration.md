### Bundle config
A bundle config:
- is made of either a *.yaml, *.json, or *.js file with one or more properties listed in it.
- can have many config sections used by tasks.
- can be created by calling `gulpw bundle-config`.  Note this task will not overwrite existing bundles but will let
you know when they already exists and will prompt you to enter a new name/alias.

##### Valid Bundle Config file:
```
# some-other-bundle.yaml
alias: some-other-bundle
```

##### Another Valid Bundle Config file:
```
# some-bunde.yaml
alias: some-bundle
files:
  js:
    - some/file/path.js
    - some/other/file/path.js
  css:
    - some/other/file/path1.css
    - some/other/file/path2.css
requirejs:
	options:
		# requirejs options here ...
		...
```

See the listed tasks below for ideas on what other sections you can use in your bundle files.
Also when running `gulpw config` you will be asked about the tasks you want to include which will
then be included in your bundle file consequently depending on your answers.
