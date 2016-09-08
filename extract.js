var recast = require('recast')
var types = require('ast-types')
var ts = require('typescript')

// Parse the code into an abstract syntax tree and map all function calls
function extractStrings (code, file) {
  if (/\.tsx?$/.test(file)) {
    return extractStringsTS(code, file)
  }

  return extractStringsJS(code)
}

// Extract the function calls from normal JS files
function extractStringsJS (code) {
  var strings = []
  var ast = recast.parse(code)

  types.visit(ast, {
    visitCallExpression: function (path) {
      extractSingularJS(strings, path.value.callee.name, path.value.arguments)
      extractPluralJS(strings, path.value.callee.name, path.value.arguments)
      this.traverse(path)
    }
  })

  return strings
}

// Extract all 't' function calls called with INLINE strings as arguments
function extractSingularJS (strings, name, args) {
  if (name !== 't') return
  var argument = args[0]
  if (argument.type !== 'Literal') return

  strings.push(argument.value)
}

// Extract all 'tPlural' function calls called with INLINE objects as arguments
function extractPluralJS (strings, name, args) {
  if (name !== 'tPlural') return
  var argument = args[0]
  if (argument.type !== 'ObjectExpression') return

  var properties = argument.properties
  var object = {}

  for (var i = 0; i !== properties.length; i++) {
    var prop = properties[i]
    if (prop.value.type !== 'Literal') continue
    object[prop.key.name] = prop.value.value
  }

  if (object.zero) {
    strings.push(object.zero)
  }

  strings.push([object.one, object.many])
}

// Extract the function calls from TS files
function extractStringsTS (code, file) {
  var strings = []
  var ast = ts.createSourceFile(file, code, ts.ScriptTarget.ES6, true)
  visitNode(ast)

  function visitNode (node) {
    if (node.kind === ts.SyntaxKind.CallExpression) {
      extractSingularTS(strings, node)
      extractPluralTS(strings, node)
    }

    ts.forEachChild(node, visitNode)
  }
}

// A singular function has to be called 't', have 1 argument and be a string
function extractSingularTS (strings, node) {
  if (node.expression.text !== 't') {
    return
  }

  if (node.arguments.length !== 1) {
    return
  }

  if (node.arguments[0].kind !== ts.SyntaxKind.StringLiteral) {
    return
  }

  strings.push(node.arguments[0].text)
}

// A plural function has to be called 'tPlural', have 2 arguments and be an object
function extractPluralTS (strings, node) {
  if (node.expression.text !== 'tPlural') {
    return
  }

  if (node.arguments.length !== 2) {
    return
  }

  if (node.arguments[0].kind !== ts.SyntaxKind.ObjectLiteralExpression) {
    return
  }

  var properties = node.arguments[0].properties
  var object = {}

  for (var i = 0; i < properties.length; i++) {
    if (properties[i].initializer.kind === ts.SyntaxKind.StringLiteral) {
      object[properties[i].name.text] = properties[i].initializer.text
    }
  }

  if (object.zero) {
    strings.push(object.zero)
  }

  strings.push([object.one, object.many])
}

module.exports = extractStrings
