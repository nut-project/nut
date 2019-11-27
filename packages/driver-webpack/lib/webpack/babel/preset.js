const path = require( 'path' )

module.exports = () => {
  return {
    presets: [
      [
        require( '@babel/preset-env' ),
        { modules: false }
      ]
    ],
    plugins: [
      [
        require( '@babel/plugin-transform-runtime' ),
        {
          helpers: false,
          regenerator: true,
          absoluteRuntime: path.dirname(
            require.resolve( '@babel/runtime/package.json' )
          )
        }
      ],
      require( '@babel/plugin-syntax-dynamic-import' ),
      [
        require( '@babel/plugin-proposal-object-rest-spread' ),
        { useBuiltIns: true }
      ],
    ],
  }
}
