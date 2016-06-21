#!/usr/bin/env node
var debug = require('debug')('react-globe-cli')
var fs = require('fs')
var args = require('minimist')(process.argv.slice(2))
var glob = require('glob')
var extract = require('./extract')
var convert = require('./convert')

var fileGlob = args.files
var outputFile = args.output

if (!fileGlob || !outputFile) {
  console.log('Missing "files" glob or "output" file')
  process.exit(1)
}

debug('Reading in files for glob: ' + fileGlob)
glob(fileGlob, function (err, files) {
  if (err) {
    console.log(err)
    process.exit(1)
  }

  debug('Parsing ' + files.length + ' files')
  var strings = []
  files.map(function (file) {
    strings = strings.concat(parseFile(file))
  })

  debug('Making sure translations are unique')
  strings = deepUnique(strings)

  debug('Sort translations')
  strings.sort()

  debug('Converting ' + strings.length + ' translation keys into gettext')
  var gettextContent = convert(strings)

  debug('Writing into output file')
  fs.writeFileSync(outputFile, gettextContent, 'utf-8')
})

function parseFile (file) {
  debug('Parsing ' + file)

  try {
    var content = fs.readFileSync(file, 'utf-8')
    var strings = extract(content)
  } catch (e) {
    console.log('Parsing error in file "' + file + '":\n', e)
    process.exit(1)
  }

  return strings
}

function deepUnique (array) {
  array = array.map(JSON.stringify)
  array = array.filter(function (x, i, self) {
    return self.indexOf(x) === i
  })
  array = array.map(JSON.parse)
  return array
}
