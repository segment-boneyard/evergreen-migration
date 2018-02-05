import path from 'path'
import test from 'ava'
import fs from 'fs-extra'
import tempy from 'tempy'
import execa from 'execa'

const cliPath = path.join(__dirname, '../lib/cli.js')
const fixture = `
import React from 'react'
import {
  Pane as EGPane,
  Card
} from 'evergreen-layers'
import TextInput from 'evergreen-text-input'
import SelectMenu from 'evergreen-select-menu'
import { Text } from 'evergreen-typography'
import DropdownButton from './DropdownButton'
`
const expectedOutput = `
import React from 'react'
import { Pane as EGPane, Card, TextInput, SelectMenu, Text } from "evergreen-ui";
import DropdownButton from './DropdownButton'
`.trim()

test('transforms a single file', async t => {
  const outputPath = tempy.file()
  await fs.writeFile(outputPath, fixture)
  await execa(cliPath, [outputPath])

  t.is(await fs.readFile(outputPath, { encoding: 'utf-8' }), expectedOutput)
})

test('transforms a glob of files', async t => {
  const outputDirectory = tempy.directory()
  await fs.writeFile(path.join(outputDirectory, 'test1.js'), fixture)
  await fs.writeFile(path.join(outputDirectory, 'test2.js'), fixture)
  await execa(cliPath, [`${outputDirectory}/test*.js`])

  t.is(
    await fs.readFile(path.join(outputDirectory, 'test1.js'), {
      encoding: 'utf-8'
    }),
    expectedOutput
  )
  t.is(
    await fs.readFile(path.join(outputDirectory, 'test2.js'), {
      encoding: 'utf-8'
    }),
    expectedOutput
  )
})

test('ignores files in node_modules', async t => {
  const outputDirectory = tempy.directory()
  await fs.writeFile(path.join(outputDirectory, 'test.js'), fixture)
  await fs.outputFile(
    path.join(outputDirectory, 'node_modules/test.js'),
    fixture
  )
  await execa(cliPath, [`${outputDirectory}/**/*.js`])

  t.is(
    await fs.readFile(path.join(outputDirectory, 'test.js'), {
      encoding: 'utf-8'
    }),
    expectedOutput
  )
  t.is(
    await fs.readFile(path.join(outputDirectory, 'node_modules/test.js'), {
      encoding: 'utf-8'
    }),
    fixture
  )
})

test('dry run mode does not change files', async t => {
  const outputPath = tempy.file()
  await fs.writeFile(outputPath, fixture)
  const result = await execa(cliPath, ['--dry-run', outputPath])

  t.true(result.stdout.includes(outputPath))
  t.is(await fs.readFile(outputPath, { encoding: 'utf-8' }), fixture)
})

test('handles files with no evergreen imports', async t => {
  const fixture = `
import React from 'react'
import DropdownButton from './DropdownButton'
`
  const outputPath = tempy.file()
  await fs.writeFile(outputPath, fixture)
  await execa(cliPath, [outputPath])

  t.is(await fs.readFile(outputPath, { encoding: 'utf-8' }), fixture)
})
