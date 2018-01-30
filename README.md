# evergreen-migration

[![Build Status](https://travis-ci.org/segmentio/evergreen-migration.svg?branch=master)](https://travis-ci.org/segmentio/evergreen-migration)
[![Dependency Status](https://david-dm.org/segmentio/evergreen-migration/status.svg)](https://david-dm.org/segmentio/evergreen-migration)

Command line tool for migrating between major Evergreen versions.

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
  <glob>     Glob of files you want to migrate (node_modules is automatically ignored).
  --version  Prints the version.
  --help     Prints this message.
Examples
  $ evergreen-migration '**/*.js'
```

## License

evergreen-migration is released under the ISC license.

Copyright © 2018, Segment.io, Inc.
