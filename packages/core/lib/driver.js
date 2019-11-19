const tapable = require( 'tapable' )

class Driver {
  constructor() {
    this._hooks = {}
    this._api = {}

    const hooks = [
      'SyncHook',
      'SyncBailHook',
      'SyncWaterfallHook',
      'SyncLoopHook',
      'AsyncParallelHook',
      'AsyncParallelBailHook',
      'AsyncSeriesHook',
      'AsyncSeriesBailHook',
      'AsyncSeriesWaterfallHook'
    ]

    hooks.forEach( name => {
      this[ 'add' + name ] = ( hookName, args ) => {
        this._hooks[ hookName ] = new tapable[ name ]( args )
      }
    } )

    this.hooks()
    this.api()
  }

  /* --- use --- */

  useHook( name, callback ) {
    const hook = this._hooks[ name ]

    if ( !hook ) {
      return
    }

    const hookType = hook.constructor.name

    if ( hookType.startsWith( 'Sync' ) ) {
      return hook.tap( this.constructor.name(), callback )
    }

    if ( hookType.startsWith( 'Async' ) ) {
      return hook.tapPromise( this.constructor.name(), callback )
    }
  }

  /* --- call --- */

  callHook( name, ...args ) {
    const hook = this._hooks[ name ]

    if ( !hook ) {
      return
    }

    const hookType = hook.constructor.name

    if ( hookType.startsWith( 'Sync' ) ) {
      return hook.call( ...args )
    }

    if ( hookType.startsWith( 'Async' ) ) {
      return hook.promise( ...args )
    }
  }

  expose( key, value ) {
    this._api[ key ] = value
  }

  use() {
    return {
      hooks: this._hooks || {},
      api: this._api || {},
      hook: this.useHook.bind( this )
    }
  }

  // override in subclass
  static name() {}
  static version() {}
  hooks() {}
  api() {}
  apply() {}
}

module.exports = Driver
