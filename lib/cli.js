#!/usr/bin/env node
'use strict'
const meow = require('meow')
const globby = require('globby')
const ora = require('ora')
const sander = require('sander')
const pLimit = require('p-limit')
const chalk = require('chalk')
const codemod = require('./codemod')

// Since we're CPU bound, loading lots of files at the same time just hurts performance
const limit = pLimit(5)
let spinner

const cli = meow({
  help: `
Usage
  $ evergreen-migration '<glob>'

Options
  <glob>         Glob of files you want to migrate (node_modules is automatically ignored).
  -d, --dry-run  Don't write anything, just show what files would have been changed.
  --version      Prints the version.
  --help         Prints this message.

Examples
  $ evergreen-migration '**/*.js'
  `.trim(),
  flags: {
    'dry-run': {
      type: 'boolean',
      default: false,
      alias: 'd'
    }
  }
})

async function main() {
  // A glob is required
  if (cli.input.length === 0) {
    cli.showHelp()
    return
  }

  spinner = ora().start()

  const filepaths = await globby([...cli.input, '!**/node_modules/**'])

  if (filepaths.length === 0) {
    spinner.fail('No matching files found')
    process.exitCode = 2
    return
  }

  const results = await Promise.all(
    filepaths.map(filepath =>
      limit(async () => {
        // Limit concurrency
        const contents = await sander.readFile(filepath, { encoding: 'utf-8' })

        spinner.text = filepath
        spinner.render() // Manually trigger a render before the event loop gets locked

        const newContents = codemod(contents)

        if (newContents) {
          if (!cli.flags.dryRun) {
            await sander.writeFile(filepath, newContents)
          }

          return chalk.white(filepath)
        }

        return chalk.gray(filepath)
      })
    )
  )

  spinner.stop()
  console.log(results.join('\n'))
}

main().catch(err => {
  // Handle uncaught errors gracefully
  if (spinner) {
    spinner.fail()
  }
  console.error(err)
  process.exitCode = 1
})
