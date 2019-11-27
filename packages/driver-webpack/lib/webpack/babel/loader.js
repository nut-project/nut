const babelLoader = require( 'babel-loader' )

module.exports = babelLoader.custom( babel => {
  const preset = babel.createConfigItem(
    require( './preset' ),
    { type: 'preset' }
  )

  return {
    config( cfg ) {
      if ( cfg.hasFilesystemConfig() ) {
        return cfg.options
      }

      return {
        ...cfg.options,
        presets: [ ...cfg.options.presets, preset ]
      }
    }
  }
} )
