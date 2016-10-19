1.  User launches `gulpw` in the command line.
2.  Initialization runs and the appropriate task manager is started with it's configurations.
3.  The task manager sorts through the passed in commands to find out what commands were passed in.
    I.)     If no commands were passed in then all `tasks` need to be run for `all bundles`.
    II.)    If commands were passed in then we need to sort through them.
        i.)     If a global task was passed in (no bundle name attached) then register all bundles with that task.
        ii.)    If a task with a bundle name attached was passed in then register that bundle with said task.
        iii.)   If a static task was passed in register it.
4.  Run task runner.

    