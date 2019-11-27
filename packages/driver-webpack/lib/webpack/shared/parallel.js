module.exports = rule => {
  rule.use( 'thread' ).loader( require.resolve( 'thread-loader' ) )
}
