### Running tasks
- `gulpw {task-name}:{bundle-name} [flags]` to run task for one bundle.
- `gulpw {task-name} [flags]` to run tasks for all bundles.

where `{task-alias}` is the task you want to run ('build', 'minify' etc.)
and `{bundle-alias}` is the bundle you want to run the task for (for './bundle-configs/hello-world.yaml'
 the bundle alias would be `hello-world`.

`[flags]` are any flags you would like to pass in with the task that you're calling;  E.g.,
`gulpw deploy:global --file-types js`

Also, e.g., `gulpw build:global build:some-other-bundle deploy:global deploy:some-other-bundle --dev`
The above example builds (see [build](#build) task for more info) some bundles (in development mode
(unminified due to `--dev` flag)) and deploys them to
 the users selected server (see [deploy](#deploy) task section for more info).
