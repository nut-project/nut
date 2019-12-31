const EventEmitter = require( 'events' )
const path = require( 'path' )
const chokidar = require( 'chokidar' )
const { config } = require( '@nut-project/core' )
const getPages = require( './get-pages' )

// extract from filesystem / watch filesystem:
// pages from src/pages
// src/app.{js|ts}
// config from nut.config.js
// markdown ...
module.exports = async function ( { name, env } = {} ) {
  const cfg = config( name )

  const emitter = new EventEmitter()

  await cfg.check()

  if ( env === 'development' ) {
    await watch( cfg, emitter )
  }

  Object.assign( emitter, {
    async getArtifacts() {
      const config = await this.getConfig()
      let pages = await getPages( config.plugins )

      if (
        config &&
        config.hooks &&
        typeof config.hooks.filterPage === 'function'
      ) {
        pages = pages.filter( config.hooks.filterPage )
      }

      return {
        config,
        pages,
      }
    },

    async getConfig() {
      return normalizeConfig( await cfg.get() )
    },
  } )

  return emitter
}

async function watch( cfg, emitter ) {
  const dirs = {
    project: process.cwd()
  }

  // watch files
  const watchOptions = {
    ignoreInitial: true,
    persistent: true,
    followSymlinks: false,
    atomic: false,
    alwaysStat: true,
    ignorePermissionErrors: true,
  }

  const appFiles = [
    path.join( dirs.project, 'src/app.js' ),
    path.join( dirs.project, 'src/app.ts' ),
  ]

  const configDir = path.join( dirs.project, 'src/config' )

  const callback = () => {
    emitter.emit( 'change' )
  }

  chokidar
    .watch( [
      await cfg.getFile(),
      ...appFiles,
      configDir,
    ], watchOptions )
    .on( 'add', callback )
    .on( 'unlink', callback )
    .on( 'change', callback )

  chokidar
    .watch( [
      path.join( dirs.project, 'src/pages' ),
    ], watchOptions )
    .on( 'add', callback )
    .on( 'unlink', callback )
}

function normalizeConfig( config ) {
  config.plugins = config.plugins || {}

  // normalize plugin
  for ( const name in config.plugins ) {
    const plugin = config.plugins[ name ]

    plugin.env = plugin.env || [ 'dev', 'prod' ]

    // eslint-disable-next-line
    plugin.enable = typeof plugin.enable !== 'undefined' ?
      Boolean( plugin.enable ) :
      true
  }

  return config
}
