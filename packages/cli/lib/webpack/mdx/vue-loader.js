const { getOptions } = require( 'loader-utils' )
const mdx = require( '@mdx-js/mdx' )
const path = require( 'path' )

module.exports = async function ( content ) {
  const callback = this.async()
  const options = Object.assign( {}, getOptions( this ), {
    filepath: this.resourcePath
  } )
  let result

  try {
    result = await mdx( content, { ...options, skipExport: true } )
  } catch ( err ) {
    return callback( err )
  }

  const code = `// vue babel plugin doesn't support the pragma replacement
import { mdx } from '@mdx-js/vue'
import MDXTag from ${ JSON.stringify( path.join( __dirname, './tag.js' ) ) }

let h;
${ result }

export default {
  name: 'Mdx',
  render(vueCreateElement) {
    h = mdx.bind({vueCreateElement})
    return MDXContent({})
  }
}
   `

  return callback( null, code )
}
