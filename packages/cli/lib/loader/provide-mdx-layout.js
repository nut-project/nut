const fm = require( 'front-matter' )

module.exports = function ( source ) {
  const result = fm( source )
  const content = result.body || ''
  const attributes = result.attributes || {}

  if ( /export\s+default/.test( content ) ) {
    return `
${ content }
export const attributes = ${ JSON.stringify( attributes ) }
    `
  }

  return `
${ content }

export default {
  render() {
    return h( 'div', {}, this.$slots.default )
  }
}
export const attributes = ${ JSON.stringify( attributes ) }
  `
}
