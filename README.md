# react-globe-cli

> A CLI tool for extracting a gettext POT file from multiple JS source files using [react-globe](https://github.com/queicherius/react-globe)

## Install

```bash
npm install react-globe-cli --save
```

## Usage

```bash
# Go through all the files and extract the translations into the output file
react-globe-cli --files='./src/**/*.js' --output='templates.pot'
```

> **Note:** Make sure you are running this on unminified source code, since it requires the
> `t` and `tPlural` function calls to keep their names. It should be fine with parsing es2015 
> and jsx code, but if you are using bleeding edge (e.g. the `stage-0` babel plugin)
> you will have to pre-compile that.

## Example

**Input (JS)**

```jsx
// ...
t('Hello World')
// ...
<h1>{t('Sup!')}</h1>
// ...
tPlural({one: 'One potato', many: '{{count}} potatoes'}, {count: 10})
```

**Output (POT)**

```pot
msgid "Hello World"
msgstr ""

msgid "Sup!"
msgstr ""

msgid "One potato"
msgid_plural "{{count}} potatoes"
msgstr[0] ""
msgstr[1] ""
```

## API

You can also use parts of this as programmatic APIs, if you wish so:

```js
const extract = require('react-globe-cli/extract')
extract(string) // -> ['Text', 'Text2', ['Singular', 'Plural']]

const convert = require('react-globe-cli/convert')
convert(extractedArray) // -> gettext file as a string, ready for writing
```
