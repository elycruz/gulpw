/**
 * Created by edelacruz on 5/27/2015.
 */
// @notes:
// - Task will be a per bundle task
// - Task will use jsdoc3 and possibly gulp-jsdoc (doesn't support tutorials and sourcing configuration from jsdoc.conf files)
// example .jsdocrc file
/**
 * {
    "tags": {
        "allowUnknownTags": true,
        "dictionaries": ["jsdoc", "closure"]
    },
    "source": {
        "include": ["package.json", "README.md"],
        "includePattern": ".js$",
        "excludePattern": "(node_modules/|docs)"
    },
    "plugins": [
        "plugins/markdown"
    ],
    "templates": {
        "cleverLinks": true,
        "monospaceLinks": true
    },
    "opts": {
        "destination": "./docs/jsdoc/",
        "encoding": "utf8",
        "private": true,
        "recurse": true
    }
}

 other:
 configure: './node_modules/ink-docstrap/template/jsdoc.conf.json',
 template: './node_modules/ink-docstrap/template'
 */
//   Make task read from .jsdocrc
//   Use ink-docstrap
