const TerserJSPlugin = require( 'terser-webpack-plugin' )
const OptimizeCSSAssetsPlugin = require( 'optimize-css-assets-webpack-plugin' )
const css = require( './css' )

module.exports = function ( config ) {
  css( config, 'production' )

  config.mode( 'production' )
  config.devtool( false )
  config.output.filename( '[name].[contenthash].js' )

  config.optimization
    .minimizer( 'js' )
    .use( TerserJSPlugin, [
      {
        cache: true,
        parallel: true,
        sourceMap: false,
        terserOptions: {
          parse: {
            ecma: 8
          },
          /* eslint-disable */
            // compress is from vue-cli
            compress: {
              // turn off flags with small gains to speed up minification
              arrows: false,
              collapse_vars: false, // 0.3kb
              comparisons: false,
              computed_props: false,
              hoist_funs: false,
              hoist_props: false,
              hoist_vars: false,
              inline: false,
              loops: false,
              negate_iife: false,
              properties: false,
              reduce_funcs: false,
              reduce_vars: false,
              switches: false,
              toplevel: false,
              typeofs: false,

              // a few flags with noticable gains/speed ratio
              // numbers based on out of the box vendor bundle
              booleans: true, // 0.7kb
              if_return: true, // 0.4kb
              sequences: true, // 0.7kb
              unused: true, // 2.3kb

              // required features to drop conditional branches
              conditionals: true,
              dead_code: true,
              evaluate: true,

              warnings: false,
              comparisons: false,
              inline: 2
            },
            /* eslint-enable */
          mangle: true,
          safari10: true,
          output: {
            ecma: 5,
            comments: false,
            // eslint-disable-next-line
              ascii_only: true
          }
        }
      }
    ] )

  config.optimization
    .minimizer( 'css' )
    .use( OptimizeCSSAssetsPlugin )
}
