function toVueJSX(node, parentNode = {}, options = {}) { // eslint-disable-line
  let children = ''

  if ( node.type === 'root' ) {
    const importNodes = []
    const exportNodes = []
    const jsxNodes = []
    let layout
    for ( const childNode of node.children ) {
      if ( childNode.type === 'import' ) {
        importNodes.push( childNode )
        continue
      }

      if ( childNode.type === 'export' ) {
        if ( childNode.default ) {
          layout = childNode.value
            .replace( /^export\s+default\s+/, '' )
            .replace( /;\s*$/, '' )
          continue
        }

        exportNodes.push( childNode )
        continue
      }

      jsxNodes.push( childNode )
    }

    const mdxLayout = `const MDXLayout = ${ layout ? layout : '"wrapper"' }`

    const fn = `function MDXContent({ components, ...props }) {
  return (
    <MDXLayout
      {...props}
      components={components}>
${ jsxNodes.map( childNode => toVueJSX( childNode, node, options ) ).join( '' ) }
    </MDXLayout>
  )
}
MDXContent.isMDXComponent = true`

    return (
      importNodes.map( childNode => toVueJSX( childNode, node, options ) ).join( '\n' ) +
      '\n' +
      exportNodes.map( childNode => toVueJSX( childNode, node, options ) ).join( '\n' ) +
      '\n' +
      mdxLayout +
      '\n' +
      fn +
      '\n' +
      ( options.skipExport ? '' : toVueExport( layout, jsxNodes, node ) )
    )
  }

  // Recursively walk through children
  if ( node.children ) {
    const childOptions = {
      preserveNewlines: options.preserveNewlines || ( node.tagName === 'pre' )
    }

    children = node.children
      .map( childNode => toVueJSX( childNode, node, childOptions ) )
      .join( '' )
  }

  if ( node.type === 'comment' ) {
    return node.value.replace( '<!--', '{/*' ).replace( '-->', '*/}' )
  }

  if ( node.type === 'element' ) {
    let props = '' // eslint-disable-line

    let lang = ''
    if ( node.tagName === 'pre' ) {
      lang = getLanguage( node )
    }

    if ( Array.isArray( node.properties.className ) ) {
      node.properties.className = node.properties.className.join( ' ' )
    }

    if ( node.properties.className ) {
      node.properties.class = node.properties.className
      delete node.properties.className
    }

    if ( lang ) {
      node.properties[ 'data-lang' ] = lang
    }

    if ( Object.keys( node.properties ).length > 0 ) {
      props = JSON.stringify( node.properties )
    }

    return `<MDXTag name="${ node.tagName }" components={ components }${
      parentNode.tagName ? ` parentName="${ parentNode.tagName }"` : ''
    }${ props ? ` cprops={${ props }}` : '' }>${ children }</MDXTag>`
  }

  // Wraps all text nodes except new lines inside template string
  // so that we don't run into escaping issues.
  // https://github.com/mdx-js/mdx/blob/master/packages/mdx/mdx-hast-to-jsx.js#L250
  if ( node.type === 'text' ) {
    return node.value === '\n' ?
      ( options.preserveNewlines ? '{`\n`}' : '' ) :
      '{`' + node.value.replace( /`/g, '\\`' ).replace( /\$/g, '\\$' ) + '`}'
  }

  if ( node.type === 'import' || node.type === 'export' || node.type === 'jsx' ) {
    return node.value
  }
}

function toVueExport( layout, jsxNodes, node ) {
  return `
    export default {
      props: {
        components: {
          type: Object,
          default: {}
        }
      },
      render() {
        return (
          <${ node.tagName } ${ layout ? `Layout={${ layout }} layoutProps={props}` : '' }
            name="wrapper"
            components={this.components}
          >
            ${ jsxNodes.map( childNode => toVueJSX( childNode, node ) ).join( '' ) }
          </${ node.tagName }>
        );
      }
    }
  `
}

function getLanguage( node ) {
  const className = node.properties.className || []

  for ( const classListItem of className ) {
    if ( classListItem.slice( 0, 9 ) === 'language-' ) {
      return classListItem.slice( 9 ).toLowerCase()
    }
  }

  return 'unknown'
}

module.exports = function VueJSXCompiler( options = {} ) {
  this.Compiler = tree => {
    return toVueJSX( tree, {}, options )
  }
}
