module.exports = function ( { struct } ) {
  const output = struct.object( {
    path: 'string?',
    clean: 'boolean?',
    html: struct.object( {
      title: 'string?',
      filename: 'string?',
      favicon: 'string?',
    }, {} ),
    publicPath: 'string?',
  }, {} )

  const babel = struct.object( {
    transpileModules: [ 'string' ],
  }, {
    transpileModules: []
  } )

  const devServer = struct.object( {
    host: 'string?',
    port: struct.optional( 'string | number' ),
    historyApiFallback: struct.optional( 'boolean | object' ),
    https: struct.optional( 'boolean | object' ),
    proxy: 'object?',
  }, {} )

  return {
    entry: 'string?',
    pages: 'object?',
    output,
    babel,
    devServer,
    envs: struct.record( [ 'string', 'string | number | boolean' ], {} ),
    constants: struct.record( [ 'string', 'string | number | boolean' ], {} ),
    alias: struct.record( [ 'string', 'string' ], {} ),
    parallel: 'boolean?',
    minimize: 'boolean?',
    cache: 'boolean?',
    fast: 'boolean?',
  }
}
