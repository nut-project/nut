require( 'v8-compile-cache' )
const { logger } = require( '@nut-project/dev-utils' )
const path = require( 'path' )
const resolveFrom = require( 'resolve-from' )
const importFresh = require( 'import-fresh' )
const pkg = require( '../package.json' )

require( 'please-upgrade-node' )( pkg, {
  exitCode: 0,
} )

process
  .on( 'unhandledRejection', ( reason, p ) => {
    console.error( reason, 'Unhandled Rejection at Promise', p )
  } )

async function startup( { presets = [], plugins: extraPlugins = [] } = {} ) {
  const argv = process.argv
  const scope = argv[ 2 ]

  normalizePresets( presets )

  const preset = presets.find( preset => {
    return preset.cli.name() === scope
  } )

  if ( !preset ) {
    console.log()
    logger.error( `No preset found matches scope "${ scope }"` )
    return
  }

  // remove scope from argv
  argv.splice( 2, 1 )

  const { cli: CLI, drivers = [], plugins = [] } = preset

  const cli = new CLI()
  await cli.use( {
    drivers,
    plugins: [
      ...plugins,
      ...normalizePlugins( extraPlugins )
    ]
  } )
  await cli.parse( argv )
}

function normalizePresets( presets ) {
  presets.forEach( preset => {
    const { cli = '', drivers = [], plugins = [] } = preset
    preset.cli = normalizeCLI( cli )
    preset.drivers = normalizeDrivers( drivers )
    preset.plugins = normalizePlugins( plugins )
  } )
}

function normalizeCLI( cli ) {
  if ( typeof cli === 'string' ) {
    return require( cli )
  }

  return cli
}

function normalizeDrivers( drivers ) {
  return drivers
    .map( driver => {
      if ( typeof driver === 'string' ) {
        try {
          return require( driver )
        } catch ( e ) {
          logger.error( 'Invalid Driver: ' + driver )
          console.log()
          console.log( e.stack )
        }
      }

      return driver
    } )
    .filter( Boolean )
}

function normalizePlugins( plugins ) {
  return plugins
    .map( plugin => {
      let resolved
      let context
      let options

      if ( typeof plugin === 'string' ) {
        try {
          resolved = importFresh( plugin )
        } catch ( e ) {
          logger.error( 'Invalid plugin: ' + plugin )
          console.log( e )
        }

        context = getContext( plugin )
        options = {}
      } else if ( plugin.resolve ) {
        try {
          resolved = importFresh( plugin.resolve )
        } catch ( e ) {
          logger.error( 'Invalid plugin: ' + plugin )
          console.log( e )
        }

        context = getContext( plugin.resolve )
        options = plugin.options
      }

      if ( !resolved ) {
        return false
      }

      return {
        plugin: resolved,
        context,
        options,
      }
    } )
    .filter( Boolean )
}

function getContext( targetPath ) {
  const pkgPath = resolveFrom.silent( targetPath, './package.json' )
  return path.dirname( pkgPath || targetPath )
}

module.exports = startup
