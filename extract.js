var recast = require('recast')
var types = require('ast-types')

// Parse the code into an abstract syntax tree and map all function calls
function extractStrings (code) {
  var ast = recast.parse(code)
  var strings = []

  types.visit(ast, {
    visitCallExpression: function (path) {
      extractSingular(strings, path.value.callee.name, path.value.arguments)
      extractPlural(strings, path.value.callee.name, path.value.arguments)
      this.traverse(path)
    }
  })

  return strings
}

// Extract all "t" function calls called with INLINE strings as arguments
function extractSingular (strings, name, arguments) {
  if (name !== 't') return
  var argument = arguments[0]
  if (argument.type !== 'Literal') return

  strings.push(argument.value)
}

// Extract all "tPlural" function calls called with INLINE objects as arguments
function extractPlural (strings, name, arguments) {
  if (name !== 'tPlural') return
  var argument = arguments[0]
  if (argument.type !== 'ObjectExpression') return

  var properties = argument.properties
  var object = {}

  for (var i = 0; i != properties.length; i++) {
    var prop = properties[i]
    if (prop.value.type !== 'Literal') return
    object[prop.key.name] = prop.value.value
  }

  if (object.zero) {
    strings.push(object.zero)
  }

  strings.push([object.one, object.many])
}

module.exports = extractStrings
