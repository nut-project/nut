module.exports = function ( api ) {
  api.cache.never()

  return {
    plugins: [
      '@babel/plugin-proposal-optional-chaining',
    ]
  }
}
