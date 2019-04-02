/*!
 * Modified from dush
 * dush <https://github.com/tunnckoCore/dush>
 *
 * Copyright (c) Charlike Mike Reagent <@tunnckoCore> (https://i.am.charlike.online)
 * Released under the MIT license.
 */

'use strict'

/**
 * > A constructor function that returns an object
 * with a few methods.
 *
 * See [JSBin Example](http://jsbin.com/mepemeluhi/edit?js,console).
 *
 * **Example**
 *
 * ```js
 * const dush = require('dush')
 * const emitter = dush()
 *
 * console.log(emitter._allEvents) // => {}
 * console.log(emitter.on) // => Function
 * console.log(emitter.once) // => Function
 * console.log(emitter.off) // => Function
 * console.log(emitter.emit) // => Function
 * ```
 *
 * @name   dush()
 * @return {Object} methods
 * @api public
 */

export default function createEmitter () {
  let _allEvents = Object.create(null)
  const app = {
    _allEvents,

    use (plugin, options) {
      const ret = plugin(app, options)
      return ret || app
    },

    on (name, handler, once) {
      let e = app._allEvents[name] || (app._allEvents[name] = [])

      function func () {
        if (!func.called) {
          app.off(name, func)
          handler.apply(handler, arguments)
          func.called = true
        }
      }

      var fn = once ? func : handler
      fn.__sourceString = handler.toString()

      e.push(fn)
      return app
    },

    once (name, handler) {
      app.on(name, handler, true)
      return app
    },

    off (name, handler) {
      if (handler && app._allEvents[name]) {
        const fnStr = handler.toString()
        app._allEvents[name] = app._allEvents[name].filter(
          (func) => func.__sourceString !== fnStr
        )
      } else if (name) {
        app._allEvents[name] = []
      } else {
        app._allEvents = Object.create(null)
      }

      return app
    },

    async emit (name) {
      if (name !== '*') {
        var args = [].slice.call(arguments);
        var callbacks = app._allEvents[name] || []
        var allCallbacks = app._allEvents['*'] || []

        for ( let i = 0, len = callbacks.length; i < len; i++ ) {
          const callback = callbacks[ i ]
          const result = callback.apply(callback, args.slice(1))
          if ( result instanceof Promise ) {
            await result
          }
        }

        for ( let i = 0, len = allCallbacks.length; i < len; i++ ) {
          const callback = allCallbacks[ i ]
          const result = callback.apply(callback, args)
          if ( result instanceof Promise ) {
            await result
          }
        }
      }

      return app
    }
  }

  return app
}
