import test from 'ava'
import codemod from '../lib/codemod'

test('transforms basic import', t => {
  const fixture = `
import React from 'react'
import TextInput from 'evergreen-text-input'
import DropdownButton from './DropdownButton'
`.trim()
  const expected = `
import React from 'react'
import { TextInput } from "evergreen-ui";
import DropdownButton from './DropdownButton'
`.trim()

  t.is(codemod(fixture), expected)
})

test('handles newlines at start/end of file', t => {
  const fixture = `
import React from 'react'
import TextInput from 'evergreen-text-input'
import DropdownButton from './DropdownButton'
`
  const expected = `
import React from 'react'
import { TextInput } from "evergreen-ui";
import DropdownButton from './DropdownButton'
`

  t.is(codemod(fixture), expected)
})

test('handles comment at start of file', t => {
  const fixture = `
// eslint-disable
import React from 'react'
import TextInput from 'evergreen-text-input'
import DropdownButton from './DropdownButton'
`.trim()
  const expected = `
// eslint-disable
import React from 'react'
import { TextInput } from "evergreen-ui";
import DropdownButton from './DropdownButton'
`.trim()

  t.is(codemod(fixture), expected)
})

test('transforms destructure import', t => {
  const fixture = `
import React from 'react'
import { Text } from 'evergreen-typography'
import DropdownButton from './DropdownButton'
`.trim()
  const expected = `
import React from 'react'
import { Text } from "evergreen-ui";
import DropdownButton from './DropdownButton'
`.trim()

  t.is(codemod(fixture), expected)
})

test('transforms multiple import', t => {
  const fixture = `
import React from 'react'
import { Pane, Card } from 'evergreen-layers'
import DropdownButton from './DropdownButton'
`.trim()
  const expected = `
import React from 'react'
import { Pane, Card } from "evergreen-ui";
import DropdownButton from './DropdownButton'
`.trim()

  t.is(codemod(fixture), expected)
})

test('transforms multiple import statements', t => {
  const fixture = `
import React from 'react'
import TextInput from 'evergreen-text-input'
import SelectMenu from 'evergreen-select-menu'
import DropdownButton from './DropdownButton'
`.trim()
  const expected = `
import React from 'react'
import { TextInput, SelectMenu } from "evergreen-ui";
import DropdownButton from './DropdownButton'
`.trim()

  t.is(codemod(fixture), expected)
})

test('transforms alias import', t => {
  const fixture = `
import React from 'react'
import { Pane as EGPaneCard } from 'evergreen-layers'
import DropdownButton from './DropdownButton'
`.trim()
  const expected = `
import React from 'react'
import { Pane as EGPaneCard } from "evergreen-ui";
import DropdownButton from './DropdownButton'
`.trim()

  t.is(codemod(fixture), expected)
})

test('transforms multiline import', t => {
  const fixture = `
import React from 'react'
import {
  Pane
} from 'evergreen-layers'
import DropdownButton from './DropdownButton'
`.trim()
  const expected = `
import React from 'react'
import { Pane } from "evergreen-ui";
import DropdownButton from './DropdownButton'
`.trim()

  t.is(codemod(fixture), expected)
})

test('handles no spaces', t => {
  const fixture = `
import React from 'react'
import {Pane} from 'evergreen-layers'
import DropdownButton from './DropdownButton'
`.trim()
  const expected = `
import React from 'react'
import { Pane } from "evergreen-ui";
import DropdownButton from './DropdownButton'
`.trim()

  t.is(codemod(fixture), expected)
})

test('handles no evergreen imports', t => {
  const fixture = `
import React from 'react'
import DropdownButton from './DropdownButton'
`.trim()
  const expected = false

  t.is(codemod(fixture), expected)
})

test('does not transform random imports', t => {
  const fixture = `
import React from 'react'
import { Pane } from 'evergreen-layers'
import DropdownButton from './DropdownButton'

function test() {
  return "import { Pane } from 'evergreen-layers'"
}
`.trim()
  const expected = `
import React from 'react'
import { Pane } from "evergreen-ui";
import DropdownButton from './DropdownButton'

function test() {
  return "import { Pane } from 'evergreen-layers'"
}
`.trim()

  t.is(codemod(fixture), expected)
})

test('handles all the things', t => {
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
`.trim()
  const expected = `
import React from 'react'
import { Pane as EGPane, Card, TextInput, SelectMenu, Text } from "evergreen-ui";
import DropdownButton from './DropdownButton'
`.trim()

  t.is(codemod(fixture), expected)
})

test('supports parsing new ES syntax', t => {
  const fixture = `
import React from 'react'
import TextInput from 'evergreen-text-input'
import DropdownButton from './DropdownButton'

const a = do { if (true) { 'hi' } }
`.trim()
  const expected = `
import React from 'react'
import { TextInput } from "evergreen-ui";
import DropdownButton from './DropdownButton'

const a = do { if (true) { 'hi' } }
`.trim()

  t.is(codemod(fixture), expected)
})

test('transforms mismatched default exports', t => {
  const fixture = `
import React from 'react'
import Colors from 'evergreen-colors'
import DropdownButton from './DropdownButton'
`.trim()
  const expected = `
import React from 'react'
import { colors as Colors } from "evergreen-ui";
import DropdownButton from './DropdownButton'
`.trim()

  t.is(codemod(fixture), expected)
})
