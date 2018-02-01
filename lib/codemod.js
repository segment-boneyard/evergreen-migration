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
    let imported = specifier.local.name
    const local = specifier.local.name

    if (types.ImportDefaultSpecifier.check(specifier)) {
      if (defaultExports[packageName]) {
        imported = defaultExports[packageName]
      }
    } else {
      imported = specifier.imported.name
    }

    if (imported === local) {
      specifierAsts.push(builders.importSpecifier(builders.identifier(local)))
    } else {
      specifierAsts.push(
        builders.importSpecifier(
          builders.identifier(imported),
          builders.identifier(local)
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

  visit(ast, {
    visitImportDeclaration(path) {
      const specifiers = path.node.specifiers
      const packageName = path.node.source.value
      this.traverse(path)

      if (!packageName.startsWith('evergreen-')) {
        return
      }

      if (firstEvergreenImportIndex === null) {
        firstEvergreenImportIndex = path.name
      }

      importSpecifierAsts = importSpecifierAsts.concat(
        buildImportSpecifiers(specifiers, packageName)
      )

      path.prune()
    }
  })

  if (importSpecifierAsts.length > 0) {
    const importAst = builders.importDeclaration(
      importSpecifierAsts,
      builders.literal('evergreen-ui')
    )
    ast.program.body.splice(firstEvergreenImportIndex, 0, importAst)
    return recast.print(ast).code
  }

  return contents
}
