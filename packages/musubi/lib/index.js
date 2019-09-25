const Musubi = require( './musubi' )
const { singleton } = require( './utils' )

module.exports = () => singleton( Musubi )
