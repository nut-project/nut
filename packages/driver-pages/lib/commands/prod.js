/* eslint-disable indent */

const path = require( 'path' )
const webpackMerge = require( 'webpack-merge' )
const table = require( 'text-table' )
const stringWidth = require( 'string-width' )
const chalk = require( 'chalk' )
const prettyBytes = require( 'pretty-bytes' )
const resolveFrom = require( 'resolve-from' )
const { build } = require( '@nut-project/webpack' )
const createBaseWebpackConfig = require( '../webpack/create-base-config' )

async function prod( gatherer = {}, runtime, cliOptions = {} ) {
  const config = await gatherer.getConfig() || {}

  const webpackConfig = createBaseWebpackConfig( config, 'production' )

  await runtime.apply( {
    env: 'production',
    cli: {
      options: cliOptions,
    },
    api: {
      gatherer,
      webpack: webpackConfig,
      require( id ) {
        const context = path.join( __dirname, '../../node_modules' )
        const resolved = resolveFrom( context, id )

        return require( resolved )
      }
    }
  } )

  if ( typeof config.chainWebpack === 'function' ) {
    config.chainWebpack( webpackConfig )
  }

  let finalWebpackConfig = webpackConfig.toConfig()

  if ( typeof config.configureWebpack === 'function' ) {
    config.configureWebpack( finalWebpackConfig )
  } else if ( typeof config.configureWebpack === 'object' ) {
    finalWebpackConfig = webpackMerge.smart(
      finalWebpackConfig,
      config.configureWebpack
    )
  }

  try {
    const stats = await build( finalWebpackConfig )

    const result = stats.toJson( {
      assets: true,
      // remove extra fields
      chunks: false,
      children: false,
      chunkGroups: false,
      chunkModules: false,
      warnings: false,
      modules: false,
      source: false,
      entrypoints: false,
      performance: false,
    } )

    let output = [
      [ ' File', 'Size' ].map( s => chalk.bold( s ) ),
      [ ' ----', '----' ].map( s => chalk.dim( s ) )
    ]

    result.assets.sort( ( a, b ) => {
      return b.size - a.size
    } )

    output = output.concat( result.assets.map( asset => [ chalk.green( ' ' + asset.name ), prettyBytes( asset.size ) ] ) )

    output = table( output, {
      stringLength: stringWidth,
    } )

    console.log( `\n${ output }\n` )

    console.log(
      stats.toString( {
        assets: false,
        children: false,
        chunks: false,
        colors: true,
        warnings: false,
        errors: true,
        errorDetails: true,
        modules: false,
        entrypoints: false,
        performance: false,
      } )
    )

    console.log( '\n' )
  } catch ( e ) {
    console.error( e )
  }
}

module.exports = prod
