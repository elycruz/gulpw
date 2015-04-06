## Basic Idea
So the idea is as follows:
    We have a `bundles` directory (could be named anything via the `bundle.wrangler.config.*` file).
That directory should contain "bundle-configuration" files which are used by "task adapters" to run a
task via the command line;  E.g., `$ gulpw build:global deploy:global deploy:other-bundle`.
The bundle files will then hold the user's configurations in the *.yaml, *.json, or *.js format.
