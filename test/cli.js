import path from 'path'
import test from 'ava'
import { readFile, writeFile } from 'sander'
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
`

test('transforms a single file', async t => {
  const outputPath = tempy.file()
  await writeFile(outputPath, fixture)
  await execa(cliPath, [outputPath])

  t.is(await readFile(outputPath, { encoding: 'utf-8' }), expectedOutput)
})

test('transforms a glob of files', async t => {
  const outputDirectory = tempy.directory()
  await writeFile(outputDirectory, 'test1.js', fixture)
  await writeFile(outputDirectory, 'test2.js', fixture)
  await execa(cliPath, [`${outputDirectory}/test*.js`])

  t.is(
    await readFile(outputDirectory, 'test1.js', { encoding: 'utf-8' }),
    expectedOutput
  )
  t.is(
    await readFile(outputDirectory, 'test2.js', { encoding: 'utf-8' }),
    expectedOutput
  )
})

test('ignores files in node_modules', async t => {
  const outputDirectory = tempy.directory()
  await writeFile(outputDirectory, 'test.js', fixture)
  await writeFile(outputDirectory, 'node_modules/test.js', fixture)
  await execa(cliPath, [`${outputDirectory}/**/*.js`])

  t.is(
    await readFile(outputDirectory, 'test.js', { encoding: 'utf-8' }),
    expectedOutput
  )
  t.is(
    await readFile(outputDirectory, 'node_modules/test.js', {
      encoding: 'utf-8'
    }),
    fixture
  )
})
