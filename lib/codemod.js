'use strict'
const recast = require('recast')
const parser = require('./parser')
const defaultExports = require('./default-exports')

const builders = recast.types.builders
const visit = recast.types.visit
const types = recast.types.namedTypes

function buildImportSpecifiers(specifiers, packageName) {
  const specifierAsts = []

  for (const specifier of specifiers) {
    let exportName = specifier.local.name
    const asName = specifier.local.name

    if (types.ImportDefaultSpecifier.check(specifier)) {
      // Handle mismatched default specifiers
      // (e.g: `textInput` becomes `TextInput as textInput`)
      if (defaultExports[packageName]) {
        exportName = defaultExports[packageName]
      }
    } else {
      // Only non-default specifiers have `imported`
      exportName = specifier.imported.name
    }

    // Only use `as` specifier if the names are different
    if (exportName === asName) {
      specifierAsts.push(builders.importSpecifier(builders.identifier(asName)))
    } else {
      specifierAsts.push(
        builders.importSpecifier(
          builders.identifier(exportName),
          builders.identifier(asName)
        )
      )
    }
  }

  return specifierAsts
}

module.exports = contents => {
  const ast = recast.parse(contents, { parser })
  let firstEvergreenImportIndex = null
  let importSpecifierAsts = []

  // Loop over all the import statements
  visit(ast, {
    visitImportDeclaration(path) {
      const specifiers = path.node.specifiers
      const packageName = path.node.source.value
      this.traverse(path)

      // Ignore non-evergreen imports
      if (!packageName.startsWith('evergreen-')) {
        return
      }

      // Save location of the first evergreen import
      if (firstEvergreenImportIndex === null) {
        firstEvergreenImportIndex = path.name
      }

      importSpecifierAsts = importSpecifierAsts.concat(
        buildImportSpecifiers(specifiers, packageName)
      )

      // Remove import
      path.prune()
    }
  })

  // Do nothing if there was no evergreen imports
  if (importSpecifierAsts.length === 0) {
    return false
  }

  // Build evergreen-ui import
  const importAst = builders.importDeclaration(
    importSpecifierAsts,
    builders.literal('evergreen-ui')
  )
  // Insert new import at the location of the first evergreen import
  ast.program.body.splice(firstEvergreenImportIndex, 0, importAst)
  return recast.print(ast).code
}
