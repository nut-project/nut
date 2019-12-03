require( 'v8-compile-cache' )
const { logger } = require( '@nut-project/dev-utils' )
const pkg = require( '../package.json' )

require( 'please-upgrade-node' )( pkg, {
  exitCode: 0,
} )

process
  .on( 'unhandledRejection', ( reason, p ) => {
    console.error( reason, 'Unhandled Rejection at Promise', p )
  } )

async function startup( { presets = [] } = {} ) {
  const argv = process.argv
  const scope = argv[ 2 ]

  normalizePresets( presets )

  const preset = presets.find( preset => {
    return preset.cli.name() === scope
  } )

  if ( !preset ) {
    console.log()
    logger.error( `No preset found for scope "${ scope }"` )
    return
  }

  // remove scope from argv
  argv.splice( 2, 1 )

  const { cli: CLI, drivers = [], plugins = [] } = preset

  const cli = new CLI()
  await cli.parse( argv )

  const userPlugins = normalizePlugins( await cli.getUserPlugins() )

  // chain fulfilled promise in cli.use
  await cli.use( {
    drivers,
    plugins: mergePlugins( plugins, userPlugins ), // TODO: to array
  } )
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

// merge as an array
function mergePlugins( presetPlugins = {}, userPlugins = {} ) {
  const names = new Set( [
    ...Object.keys( presetPlugins ),
    ...Object.keys( userPlugins ),
  ] )

  const merged = []

  for ( const name of names ) {
    merged.push(
      mergePlugin( name, presetPlugins[ name ], userPlugins[ name ] )
    )
  }

  return merged
}

function mergePlugin( name, presetPlugin = {}, userPlugin = {} ) {
  // check conflicts
  if ( presetPlugin.resolve && userPlugin.resolve ) {
    logger.warn( `plugin name "${ name }" is already used in preset, skipped` )
    console.log()

    return presetPlugin
  }

  const merged = {}

  ;[ 'name', 'resolve', 'options' ].forEach( key => {
    merged[ key ] = userPlugin[ key ] || presetPlugin[ key ]
  } )

  return merged
}

function normalizePlugins( plugins = {} ) {
  return Object.keys( plugins )
    .map( name => {
      let plugin = plugins[ name ]

      if ( typeof plugin === 'string' ) {
        plugin = {
          resolve: plugin
        }
      }

      const options = plugin.options
      const resolve = plugin.resolve

      return {
        name,
        resolve,
        options,
      }
    } )
    .reduce( ( all, plugin ) => {
      all[ plugin.name ] = plugin
      return all
    }, {} )
}

module.exports = startup
