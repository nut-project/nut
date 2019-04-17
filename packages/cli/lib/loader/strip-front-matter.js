const fm = require( 'front-matter' )

module.exports = function ( source ) {
  const content = fm( source )

  return content.body || ''
}
