### Available Flags:
**Note** All long forms of these flags use the `--{flag-name}` format.  Short forms use `-{flag-one-letter-alias}`.
- **file-types:**  Used to pass a comma separated list of file extensions to the defined tasks.
    - **Affected tasks:**
        - `deploy` - Uses `--file-types` string to only deploy files of the types you passed in via `--file-types` or one of it's aliases.
    - **Aliases:** `--ext`, `-t`
- **debug:** Used for developing gulpw and allows you to keep your more pertinent debug logging declarations.
    - **Aliases:** None.
- **dev:** Used to ignore minification (at this time).
    - **Affected tasks:**
        - `minify` ~~and `concat`~~ - Minification is skipped when used with these tasks.
- **skip-tests:** Causes `mocha` and `jasmine` tests to not run.
    - **Aliases:** `--no-tests`, `--skip-testing`
- **verbose:** Used to print verbose mode logs.
    - **Aliases:** `-v`
