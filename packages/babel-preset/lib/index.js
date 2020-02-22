const path = require( 'path' )

module.exports = api => {
  const isModern = api.caller( caller => Boolean( caller ) && caller.isModern )

  return {
    sourceType: 'unambiguous',
    presets: [
      // replace preset-env with preset-modules in modern mode
      isModern ?
        [
          require.resolve( '@babel/preset-modules' ),
          { loose: true }
        ] :
        [
          require.resolve( '@babel/preset-env' ),
          {
            // debug: true,
            modules: false, // hand over to webpack
          }
        ]
    ].filter( Boolean ),
    plugins: [
      [
        require.resolve( '@babel/plugin-transform-runtime' ),
        {
          helpers: true,
          regenerator: !isModern,
          absoluteRuntime: path.dirname(
            require.resolve( '@babel/runtime/package.json' )
          ),
          // specify version can reduce bundle size
          version: require( '@babel/runtime/package.json' ).version
        }
      ],
      require.resolve( '@babel/plugin-syntax-dynamic-import' ),
      [
        require.resolve( '@babel/plugin-proposal-object-rest-spread' ),
        { useBuiltIns: true }
      ],
    ],
  }
}
