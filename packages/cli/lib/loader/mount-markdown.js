const fm = require( 'front-matter' )
const loaderUtils = require( 'loader-utils' )
const marked = require( 'marked' )
const Prism = require( 'prismjs' )
require( 'prismjs/components/prism-yaml' )
require( 'prismjs/components/prism-bash' )
require( 'prismjs/components/prism-diff' )
require( 'prismjs/components/prism-docker' )
require( 'prismjs/components/prism-jsx' )
require( 'prismjs/components/prism-less' )
require( 'prismjs/components/prism-typescript' )
const pathUtils = require( '../utils/path-utils' )

function escape(html, encode) {
  if (encode) {
    if (escape.escapeTest.test(html)) {
      return html.replace(escape.escapeReplace, function (ch) { return escape.replacements[ch]; });
    }
  } else {
    if (escape.escapeTestNoEncode.test(html)) {
      return html.replace(escape.escapeReplaceNoEncode, function (ch) { return escape.replacements[ch]; });
    }
  }

  return html;
}

escape.escapeTest = /[&<>"']/
escape.escapeReplace = /[&<>"']/g
escape.replacements = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

escape.escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/
escape.escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g

const renderer = new marked.Renderer()
renderer.code = function ( code, infostring, escaped ) {
  var lang = (infostring || '').match(/\S*/)[0]
  var out = highlight(code, lang)
  if (out != null && out !== code) {
    escaped = true
    code = out
  }

  if (!lang) {
    return '<pre class="language-unknown"><code>'
      + (escaped ? code : escape(code, true))
      + '</code></pre>';
  }

  const langClass = 'language-' + escape(lang, true)

  return '<pre class="' + langClass + '" data-lang="' + escape(lang, true) + '"><code class="' + langClass + '">'
    + (escaped ? code : escape(code, true))
    + '</code></pre>\n'
}

function highlight( str, lang ) {
  let rendered = str
  if ( Prism.languages[ lang ] ) {
    rendered = Prism.highlight( str || '', Prism.languages[ lang ], lang )
  }

  return rendered
}

module.exports = function ( source ) {
  const nutifyPath = pathUtils.toRelative( require.resolve( './nutify/markdown' ) )

  const result = fm( source )

  marked.setOptions( {
    gfm: true,
  } )

  const html = marked( result.body || '', {
    renderer
  } )

  return `
    import nutify from '${ nutifyPath }'
    export default nutify( {
      default: ${ JSON.stringify( html ) },
      attributes: ${ JSON.stringify( result.attributes || {} ) },
    } )
  `
}
