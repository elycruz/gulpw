### build
The 'build' task calls every sub task listed in a {bundle-name}.yaml config file except (by default can be
 altered in local wrangler config file):
		- clean (we could have this run via a flag in the future but is ignored for now to speed up performance)
		- deploy
		- jshint (called by the minify task so is ignored as standalone task)
		- csslint (called by the minify task so is ignored as a standalone task)

**Note:** The minify task runs 'jshint' and 'csslint' (along with other tasks) so that
is why they are being ignored as standalone tests.

'build' also adds the 'minify' task to it's list of tasks 'to' run for a particular bundle or bundles
depending on if an `html`, `css` or `js` section is found with the `files` section.

##### Options:
- **ignoredTasks {Array}:**  List of standalone tasks to ignore when calling build (*note some tasks are
 included as conglomerate tasks).

##### Flags:
`--skip-linting`, `--skip-csslint`, `--skip-jshint`, `--dev`,
`--skip-testing`, `--skip-mocha-test`, `--skip-jasmine-tests`

##### In 'bundle.wrangler.config.*':
```
tasks:
  # Build Task (Looks through {bundle-alias}.yaml file and runs
  # all tasks that are not in the `ignoreTasks`
  build:
    ignoredTasks:
      - clean
      - deploy
      - jshint
      - csslint
```

##### In {bundle}.*:
None.

