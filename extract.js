var recast = require('recast')
var types = require('ast-types')

// Parse the code into an abstract syntax tree and map all function calls
function extractStrings (code, file) {
  var strings = []
  if(/\.tsx?$/.test(file)) {
    var ts = require("typescript");
    var ast = ts.createSourceFile(file, code, ts.ScriptTarget.ES6, true);
    visit(ast);
    function visit(node) {
        switch (node.kind) {
            case ts.SyntaxKind.CallExpression: // function call
              if(node.expression.text == 't') { // function name is 't'
                if(node.arguments.length == 1) { // has one argument 
                  if(node.arguments[0].kind == ts.SyntaxKind.StringLiteral) { // that is a string literal 
                    strings.push(node.arguments[0].text);
                  }
                }
              } else if(node.expression.text == 'tPlural') { // function name is 'tPlural'
                if(node.arguments.length == 2) { // has two arguments
                  if(node.arguments[0].kind == ts.SyntaxKind.ObjectLiteralExpression) { // first parameter is object literal
                    var ob = {}
                    for(var i = 0; i<node.arguments[0].properties.length; i++) {
                      if(node.arguments[0].properties[i].initializer.kind == ts.SyntaxKind.StringLiteral) { // take just properties that have string literal value
                        ob[node.arguments[0].properties[i].name.text] = node.arguments[0].properties[i].initializer.text;
                      }
                    }
                    if (ob.zero) {
                      strings.push(ob.zero)
                    }

                    strings.push([ob.one, ob.many])
                  }
                }
              }
            break;
        }
        ts.forEachChild(node, visit);
    }
  } else {
    var ast = recast.parse(code)

    types.visit(ast, {
      visitCallExpression: function (path) {
        extractSingular(strings, path.value.callee.name, path.value.arguments)
        extractPlural(strings, path.value.callee.name, path.value.arguments)
        this.traverse(path)
      }
    })
  }
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
