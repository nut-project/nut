const marked = require( 'marked' )
const Prism = require( 'prismjs' )
require( 'prismjs/components/prism-yaml' )
require( 'prismjs/components/prism-bash' )
require( 'prismjs/components/prism-diff' )
require( 'prismjs/components/prism-docker' )
require( 'prismjs/components/prism-jsx' )
require( 'prismjs/components/prism-less' )
require( 'prismjs/components/prism-typescript' )

function escape( html, encode ) {
  if ( encode ) {
    if ( escape.escapeTest.test( html ) ) {
      return html.replace(
        escape.escapeReplace,
        function ( ch ) {
          return escape.replacements[ ch ]
        }
      )
    }
  } else if ( escape.escapeTestNoEncode.test( html ) ) {
    return html.replace(
      escape.escapeReplaceNoEncode,
      function ( ch ) {
        return escape.replacements[ ch ]
      }
    )
  }

  return html
}

escape.escapeTest = /[&<>"']/
escape.escapeReplace = /[&<>"']/g
escape.replacements = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;'
}

escape.escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/
escape.escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g

const renderer = new marked.Renderer()
renderer.code = function ( code, infostring, escaped ) {
  const lang = ( infostring || '' ).match( /\S*/ )[ 0 ]
  const out = highlight( code, lang )
  if ( out != null && out !== code ) { // eslint-disable-line
    escaped = true
    code = out
  }

  if ( !lang ) {
    return '<div class="nut-language-highlight"><pre class="language-unknown"><code>' +
    ( escaped ? code : escape( code, true ) ) +
    '</code></pre></div>'
  }

  const langClass = 'language-' + escape( lang, true )

  return '<div class="nut-language-highlight"><pre class="' + langClass + '" data-lang="' + escape( lang, true ) +
    '"><code class="' + langClass + '">' +
    ( escaped ? code : escape( code, true ) ) +
    '</code></pre></div>\n'
}

function highlight( str, lang ) {
  let rendered = str
  if ( Prism.languages[ lang ] ) {
    rendered = Prism.highlight( str || '', Prism.languages[ lang ], lang )
  }

  return rendered
}

module.exports = function ( markdown = '' ) {
  marked.setOptions( {
    gfm: true,
  } )

  return marked( markdown, {
    renderer
  } )
}
