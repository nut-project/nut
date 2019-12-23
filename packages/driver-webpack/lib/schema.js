module.exports = function ( { struct } ) {
  const output = struct.object( {
    path: 'string?',
    clean: 'boolean?',
    html: struct.object( {
      title: 'string?',
      filename: 'string?',
      favicon: 'string?',
      template: 'string?',
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

  const htmlPluginOptions = struct.object( {
    entry: 'string',
    title: 'string?',
    filename: 'string?',
    favicon: 'string?',
    template: 'string?',
  } )

  const pages = struct.record( [
    'string',
    htmlPluginOptions
  ], {} )

  return {
    entry: 'string?',
    pages,
    output,
    babel,
    devServer,
    constants: struct.record( [ 'string', 'string | number | boolean' ], {} ),
    alias: struct.record( [ 'string', 'string' ], {} ),
    parallel: 'boolean?',
    minimize: 'boolean?',
    cache: 'boolean?',
    fast: 'boolean?',
    css: struct.object( {
      extract: 'boolean?'
    }, {} ),
  }
}
