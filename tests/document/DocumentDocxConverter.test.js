import test from 'tape'
import MemoryBuffer from '../../src/backend/MemoryBuffer'
import TestStorer from '../backend/TestStorer'

import DocumentDocxConverter from '../../src/document/DocumentDocxConverter'
const converter = new DocumentDocxConverter()


test('DocumentDocxConverter.match', function (t) {
  t.ok(DocumentDocxConverter.match('foo.docx'))
  t.notOk(DocumentDocxConverter.match('foo.bar'))
  t.end()
})

test.skip('DocumentDocxConverter.importDocument', function (t) {
  let converter = new DocumentDocxConverter()
  let storer = new TestStorer('/path/to/storer', 'hello-world.docx')
  storer.writeFile('hello-world.docx', 'text/docx', 'Hello world')
  let buffer = new MemoryBuffer()

  converter.importDocument(
    storer,
    buffer
  ).then((manifest) => {
    t.equal(manifest.type, 'document')
    buffer.readFile('index.html', 'text/html').then((html) => {
      t.equal(html, `<!DOCTYPE html>
<html>
  <head>
    <title></title>
  </head>
  <body>
    <main>
      <div id="data" data-format="html">
        <div class="content"><p>Hello world</p></div>
      </div>
    </main>
  </body>
</html>`)
      t.end()
    })
  })
})

test('DocumentDocxConverter.exportDocument', function (t) {
  let converter = new DocumentDocxConverter()
  let buffer = new MemoryBuffer()
  buffer.writeFile('index.html', 'text/html', `<!DOCTYPE html>
<html>
  <head>
    <title></title>
  </head>
  <body>
    <main>
      <div id="data" data-format="html">
        <div class="content"><p>Hello world</p></div>
      </div>
    </main>
  </body>
</html>`)
  let storer = new TestStorer('/path/to/storer', 'hello-world.docx')

  converter.exportDocument(
    buffer,
    storer,
    {converter: 'none'}
  ).then(() => {
    storer.readFile('hello-world.docx', 'text/plain').then(docx => {
      t.equal(docx, 'DocumentDocxConverter.exportDocument was run with converter: none')
      t.end()
    })
  })
})


test.skip('DocumentDocxConverter.importContent', t => {
  const i = (md, options) => converter.importContent(md, options)

  t.equal(
    i('Para 1\n\nPara 2'),
    '<p>Para 1</p>\n<p>Para 2</p>',
    'returns pretty HTML (might be changed later)'
  )

  t.equal(
    i('Para 1\n\n\nPara 2\n\n  \n  \n    \n# My-header'),
    '<p>Para 1</p>\n<p>Para 2</p>\n<h1 id="my-header">My-header</h1>',
    'paragraphs are "squeezed" i.e. considered empty if it is composed of whitespace characters only'
  )

  t.equal(
    i('Para with [a bracketed span]{.class .other-class key=val another=example}.'),
    '<p>Para with <span class="class other-class" data-key="val" data-another="example">a bracketed span</span>.</p>',
    'plain bracketed spans work'
  )

  t.equal(
    i('An input [3]{name=variable1}'),
    '<p>An input <input name="variable1" value="3"></p>'
  )

  t.equal(
    i('An input []{name=variable1} with no current value'),
    '<p>An input <input name="variable1"> with no current value</p>'
  )

  t.equal(
    i('An input []{name=variable1 type=range min=1 max=100 step=1} with type specified'),
    '<p>An input <input name="variable1" type="range" min="1" max="100" step="1"> with type specified</p>'
  )

  t.equal(
    i('An input [nashi]{name=variable1 type=select pear=Pear nashi="Nashi pear"} of type select'),
    '<p>An input <select name="variable1"><option value="pear">Pear</option><option value="nashi" selected>Nashi pear</option></select> of type select</p>'
  )

  t.equal(
    i('An output [42]{expr="6*7"}'),
    '<p>An output <output for="6*7">42</output></p>'
  )

  t.equal(
    i('# Heading 1'),
    '<h1 id="heading-1">Heading 1</h1>',
    'headings are slugged'
  )

  t.equal(
    i('```\n```'),
    '<pre><code></code></pre>',
    'empty codeblock'
  )

  t.equal(
    i('```r\n```'),
    '<pre><code class="language-r"></code></pre>',
    'codeblock with language'
  )

  t.equal(
    i('```.\nvar2=sum(var1)\n```'),
    '<div data-cell="var2=sum(var1)"></div>',
    'internal cell using mini language'
  )

  t.equal(
    i('```run(){r}\nlibrary(myawesomepackage)\n```'),
    '<div data-cell="run()" data-language="r"><pre data-source="">library(myawesomepackage)</pre></div>',
    'cell which runs some R code'
  )

  t.equal(
    i('```run{r}\nlibrary(myawesomepackage)\n```'),
    '<div data-cell="run()" data-language="r"><pre data-source="">library(myawesomepackage)</pre></div>',
    'run has optional parentheses'
  )

  t.equal(
    i('```call(){r}\nreturn(6*7)\n```'),
    '<div data-cell="call()" data-language="r"><pre data-source="">return(6*7)</pre></div>',
    'external cell which calls some R code'
  )

  t.equal(
    i('```call{r}\nreturn(6*7)\n```'),
    '<div data-cell="call()" data-language="r"><pre data-source="">return(6*7)</pre></div>',
    'call has optional parentheses'
  )

  t.equal(
    i('```out1=call(in1,y=in2){r}\nreturn(in1*y)\n```'),
    '<div data-cell="out1=call(in1,y=in2)" data-language="r"><pre data-source="">return(in1*y)</pre></div>',
    'call with inputs and outputs'
  )

  t.end()
})

test.skip('DocumentDocxConverter.exportContent', t => {
  const e = converter.exportContent

  t.equal(
    e('<p>Para with <span class="class other-class" data-key="val" data-another="example">a bracketed span</span>.</p>'),
    'Para with [a bracketed span]{.class .other-class key=val another=example}.',
    'plain bracketed spans work'
  )

  t.equal(
    e('<p>An input <input name="variable1" value="3"></p>'),
    'An input [3]{name=variable1}'
  )

  t.equal(
    e('<p>An input <input name="variable1"> with no current value</p>'),
    'An input []{name=variable1} with no current value'
  )

  t.equal(
    e('<p>An input <input name="variable1" type="range" min="1" max="100" step="1"> with type specified</p>'),
    'An input []{name=variable1 type=range min=1 max=100 step=1} with type specified'
  )

  t.equal(
    e('<p>An input <select name="variable1"><option value="pear">Pear</option><option value="nashi" selected>Nashi pear</option></select> of type select</p>'),
    'An input [nashi]{name=variable1 type=select pear=Pear nashi="Nashi pear"} of type select'
  )

  t.equal(
    e('<p>An output <output for="6*7">42</output></p>'),
    'An output [42]{expr=6*7}'
  )

  t.equal(
    e('<h1 id="heading-1">Heading 1</h1>'),
    '# Heading 1',
    'ATX style headers'
  )

  t.equal(
    e('<pre><code class="language-r"></code></pre>'),
    '```r\n\n```',
    'codeblock with language'
  )

  t.equal(
    e('<div data-cell="var2=sum(var1)"></div>'),
    '```.\nvar2=sum(var1)\n```',
    'internal cell using mini language'
  )

  t.equal(
    e('<div data-cell="run()" data-language="r"><pre data-source="">library(myawesomepackage)</pre></div>'),
    '```run(){r}\nlibrary(myawesomepackage)\n```',
    'chunk which runs some R code'
  )

  t.equal(
    e('<div data-cell="call()" data-language="r"><pre data-source="">return(6*7)</pre></div>'),
    '```call(){r}\nreturn(6*7)\n```',
    'external cell which calls some R code'
  )

  t.equal(
    e('<div data-cell="out1=call(in1,y=in2)" data-language="r"><pre data-source="">return(6*7)</pre></div>'),
    '```out1=call(in1,y=in2){r}\nreturn(6*7)\n```',
    'call with inputs and outputs'
  )

  t.end()
})

test.skip('DocumentDocxConverter.importContent+exportContent', t => {
  const ie = mdIn => {
    let html = converter.importContent(mdIn)
    let mdOut = converter.exportContent(html)
    t.equal(mdOut, mdIn)
  }

  ie('Para 1\n\nPara2')

  ie('# Heading 1')
  ie('## Heading 2')
  ie('### Heading 3')
  ie('#### Heading 4')
  ie('##### Heading 5')

  ie('[]{name=variable1}')
  ie('[42]{name=variable1}')
  ie('[42]{expr=6*7}')

  ie('```.\nvar2=sum(var1)\n```')
  ie('```run(){r}\nlibrary(myawesomepackage)\n```')
  ie('```call(){r}\nreturn(6*7)\n```')
  ie('```out1=call(in1,y=in2){r}\nreturn(6*7)\n```')

  t.end()
})
