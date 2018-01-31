'use strict'
const recast = require('recast')
const babylon = require('babylon')

// Wrapper to set babylon options
const parser = {
  parse(code) {
    return babylon.parse(code, {
      sourceType: 'module',
      plugins: [
        'jsx',
        'flow',
        'doExpressions',
        'objectRestSpread',
        'decorators2',
        'classProperties',
        'classPrivateProperties',
        'classPrivateMethods',
        'exportDefaultFrom',
        'exportNamespaceFrom',
        'asyncGenerators',
        'functionBind',
        'functionSent',
        'dynamicImport',
        'numericSeparator',
        'optionalChaining',
        'importMeta',
        'bigInt',
        'optionalCatchBinding',
        'throwExpressions',
        'pipelineOperator',
        'nullishCoalescingOperator'
      ]
    })
  }
}

const builders = recast.types.builders
const visit = recast.types.visit

function buildImportSpecifiers(specifiers) {
  const specifierAsts = []

  for (const specifier of specifiers) {
    if (
      specifier.imported &&
      specifier.imported.name !== specifier.local.name
    ) {
      specifierAsts.push(
        builders.importSpecifier(
          builders.identifier(specifier.imported.name),
          builders.identifier(specifier.local.name)
        )
      )
    } else {
      specifierAsts.push(
        builders.importSpecifier(builders.identifier(specifier.local.name))
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
      const node = path.node
      this.traverse(path)

      if (!node.source.value.startsWith('evergreen-')) {
        return
      }

      if (firstEvergreenImportIndex === null) {
        firstEvergreenImportIndex = path.name
      }

      importSpecifierAsts = importSpecifierAsts.concat(
        buildImportSpecifiers(node.specifiers)
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
