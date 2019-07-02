const fm = require( 'front-matter' )

module.exports = function ( source ) {
  const result = fm( source )
  const content = result.body || ''
  const attributes = result.attributes || {}

  return `
${ content }
export const attributes = ${ JSON.stringify( attributes ) }
  `
}
