#!/usr/bin/env node
'use strict'
const meow = require('meow')
const globby = require('globby')
const ora = require('ora')
const sander = require('sander')
const codemod = require('./codemod')

let spinner

const cli = meow({
  help: `
  	Usage
  	  $ evergreen-migration '<glob>'
    Options
  	  <glob>     Glob of files you want to migrate (node_modules is automatically ignored).
      --version  Prints the version.
      --help     Prints this message.
  	Examples
  	  $ evergreen-migration '**/*.js'
  `.trim()
})

async function main() {
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

  await Promise.all(
    filepaths.map(async filepath => {
      const contents = await sander.readFile(filepath, { encoding: 'utf-8' })
      const newContents = codemod(contents)
      await sander.writeFile(filepath, newContents)
      spinner.text = filepath
    })
  )

  spinner.succeed('Done ✨')
}

main().catch(err => {
  if (spinner) {
    spinner.fail()
  }
  console.error(err)
  process.exitCode = 1
})
