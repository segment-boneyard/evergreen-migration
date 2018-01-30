'use strict'

class ImportStatement {
  constructor({ startLineIndex }) {
    this.startLineIndex = startLineIndex
    this.endLineIndex = null
    this.isComplete = false
    this.hasFromWord = false
    this.words = ['import']
    this.package = null
    this.exports = []
  }

  isEvergreenPackage() {
    return this.package.includes('evergreen-')
  }

  process() {
    let isDefaultExport = true
    let isAlias = false
    for (let i = 0; i < this.words.length; i++) {
      const word = this.words[i]

      if (word === 'import') continue
      if (word === 'from') break
      if (word === '}') break

      if (word === '{') {
        isDefaultExport = false
        continue
      }
      if (isDefaultExport) {
        this.exports.push({ isDefaultExport: true, name: word })
        break
      }
      if (word === 'as') {
        isAlias = true
        continue
      }
      if (isAlias) {
        this.exports[this.exports.length - 1].alias = word.replace(',', '')
        isAlias = false
        continue
      }
      if (word) {
        this.exports.push({ name: word.replace(',', '') })
        continue
      }
    }
    return this
  }
}

function findImportStatements(input) {
  const lines = input.split('\n')
  const imports = []

  const lastStatement = () => imports[imports.length - 1]

  lines.forEach((line, index) => {
    const words = line.split(' ')

    words.forEach((word, wordIndex) => {
      if (word === 'import' && wordIndex === 0) {
        imports.push(new ImportStatement({ startLineIndex: index }))
      } else if (lastStatement() && !lastStatement().isComplete) {
        if (word === 'from') {
          lastStatement().hasFromWord = true
          lastStatement().words.push(word)
        } else if (lastStatement().hasFromWord) {
          lastStatement().package = word
          lastStatement().isCompleted = true
          lastStatement().endLineIndex = index
          lastStatement().words.push(word)
        } else if (!/\s/.test(word)) {
          if (!Number.isNaN(word.charCodeAt())) {
            // Weird whitespace bug
            lastStatement().words.push(word)
          }
        }
      }
    })
  })

  return { lines, imports }
}

function createNewImportStatement(inputImports) {
  const stringBuilder = ['import', '{']

  const result = inputImports
    .reduce(
      (arr, imp) => [
        ...arr,
        imp.exports
          .map(exp => {
            if (exp.alias) {
              return `${exp.name} as ${exp.alias}`
            }
            return exp.name
          })
          .join(', ')
      ],
      []
    )
    .join(', ')

  stringBuilder.push(result)

  stringBuilder.push('}')
  stringBuilder.push('from')
  stringBuilder.push(`'evergreen-ui'`)
  return stringBuilder.join(' ')
}

function shouldSkipLine(inputImports, lineIndex) {
  let skip = false

  inputImports.forEach(imp => {
    if (lineIndex >= imp.startLineIndex && lineIndex <= imp.endLineIndex)
      skip = true
  })

  return skip
}

module.exports = contents => {
  const { lines, imports } = findImportStatements(contents)
  const evergreenImports = imports
    .filter(x => x.isEvergreenPackage())
    .map(x => x.process())

  const newLines = []

  lines.forEach((line, index) => {
    if (index === evergreenImports[0].startLineIndex) {
      newLines.push(createNewImportStatement(evergreenImports))
    } else if (!shouldSkipLine(evergreenImports, index)) {
      newLines.push(line)
    }
  })

  return newLines.join('\n')
}
