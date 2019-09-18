const EventEmitter = require( 'events' )
const path = require( 'path' )
const chokidar = require( 'chokidar' )
const { gatherer } = require( '@nut-project/core' )

// extract from filesystem / watch filesystem:
// pages from src/pages
// src/app.{js|ts}
// config from nut.config.js
// markdown ...
class PagesGatherer {
  constructor( name ) {
    this.name = name
    this.emitter = new EventEmitter()
  }

  async apply( env ) {
    const name = this.name

    await gatherer.check( name )

    if ( env === 'development' ) {
      await this._watch()
    }

    return {
      events: this.emitter,
      api: {
        async getArtifacts() {
          const pages = []
          const plugins = []
          // const pluginOptions = []
          // const markdownHighlightCSS = ''
          // const app = {}

          return {
            config: await gatherer.getConfig( name ),
            pages,
            plugins,
          }
        },

        getConfig: () => {
          return gatherer.getConfig( name )
        },
      }
    }
  }

  async _watch() {
    const name = this.name
    const emitter = this.emitter

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
        await gatherer.getConfigFile( name ),
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
}

module.exports = PagesGatherer
