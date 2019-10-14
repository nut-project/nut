module.exports = ( { browserslist } = {} ) => {
  return {
    presets: [
      [
        require.resolve( '@babel/preset-env' ),
        {
          targets: {
            browsers: browserslist
          }
        }
      ]
    ],
    plugins: [
      require.resolve( '@babel/plugin-transform-runtime' ),
      require.resolve( '@babel/plugin-syntax-dynamic-import' ),
    ],
    sourceType: 'unambiguous',
  }
}
