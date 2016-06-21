var header = [
  'msgid ""',
  'msgstr ""',
  '"MIME-Version: 1.0\\n"',
  '"Content-Type: text/plain; charset=utf-8\\n"',
  '"Content-Transfer-Encoding: 8bit\\n"',
  '"Plural-Forms: nplurals=2; plural=(n != 1)\\n"'
].join('\n')

function convertStrings (strings) {
  strings = strings.map(convertString)
  strings = [header].concat(strings)
  return strings.join('\n\n')
}

function convertString (string) {
  if (typeof string === 'object') {
    return [
      'msgid "' + escapeString(string[0]) + '"',
      'msgid_plural "' + escapeString(string[1]) + '"',
      'msgstr[0] ""',
      'msgstr[1] ""'
    ].join('\n')
  }

  return [
    'msgid "' + escapeString(string) + '"',
    'msgstr ""'
  ].join('\n')
}

function escapeString (string) {
  return string.replace(/"/g, '\\"')
}

module.exports = convertStrings
