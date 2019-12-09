exports.extend = function ( config, context = {} ) {
  const { userConfig = {} } = context

  const outdir = userConfig.output && userConfig.output.path
  if ( outdir ) {
    config.output.path( outdir )
  }
}
