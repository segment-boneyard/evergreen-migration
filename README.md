# evergreen-migration [![Build Status](https://circleci.com/gh/segmentio/evergreen-migration/tree/master.svg?style=svg)](https://circleci.com/gh/segmentio/evergreen-migration/tree/master)

Command line tool for migrating from the separate `evergreen-*` packages to the new `evergreen-ui` package.

It rewrites the imports in JavaScript files to combine the all separate `evergreen-*` imports into a single `evergreen-ui` import.

_Note: only supports ES2015 `import` statements (not CommonJS `require` calls)._

## Install

```sh
yarn global add evergreen-migration
# or
npm install -g evergreen-migration
```

## Usage

```
Usage
  $ evergreen-migration '<glob>'

Options
  <glob>         Glob of files you want to migrate (node_modules is automatically ignored).
  -d, --dry-run  Don't write anything, just show what files would have been changed.
  --version      Prints the version.
  --help         Prints this message.

Examples
  $ evergreen-migration '**/*.js'
```

## License

evergreen-migration is released under the ISC license.

Copyright © 2018, Segment.io, Inc.
