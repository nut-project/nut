const cosmiconfig = require( 'cosmiconfig' )

const explorer = cosmiconfig( 'nut', {
  cache: false,
} )

module.exports = async function () {
  let result = {}
  try {
    result = await explorer.search()
  } catch ( e ) {
    console.log( e )
  }

  return result
}
