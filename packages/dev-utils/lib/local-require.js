const importFrom = require( 'import-from' )

module.exports = importFrom.bind( null, process.cwd() )
