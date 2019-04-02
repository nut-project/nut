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
      return ret || this
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

      if ( handler.__from === 'plugin' ) {
        func.__plugin = handler.__plugin
      }

      var fn = once ? func : handler
      fn.__sourceString = handler.toString()

      e.push(fn)
      return this
    },

    once (name, handler) {
      app.on(name, handler, true)
      return this
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

      return this
    },

    async emit (name) {
      if (name !== '*') {
        if ( process.env.NODE_ENV === 'development' ) {
          console.log(
            '\n%cEvent%c' + name + '%c\n',
            'background-color: #48d67a;color: #fff;padding: 2px 6px;',
            'background-color: #31b754;color: #fff;padding: 2px 6px;',
            ''
          )
        }

        var args = [].slice.call(arguments);
        var callbacks = app._allEvents[name] || []
        var allCallbacks = app._allEvents['*'] || []

        for ( let i = 0, len = callbacks.length; i < len; i++ ) {
          const callback = callbacks[ i ]

          if ( process.env.NODE_ENV === 'development' ) {
            if ( callback.__plugin ) {
              console.log(
                '\n%cPlugin:' + callback.__plugin + '%c process ' + name + '%c\n',
                'background-color: #ff76a8;color: #fff;padding: 2px 6px;',
                'background-color: #da4590;color: #fff;padding: 2px 6px;',
                ''
              )
            }
          }

          const result = callback.apply(callback, args.slice(1))
          if ( result instanceof Promise ) {
            await result
          }
        }

        for ( let i = 0, len = allCallbacks.length; i < len; i++ ) {
          const callback = allCallbacks[ i ]

          if ( process.env.NODE_ENV === 'development' ) {
            if ( callback.__plugin ) {
              console.log(
                '\n%cPlugin:' + callback.__plugin + '%c process ' + name + '%c\n',
                'background-color: #ff76a8;color: #fff;padding: 2px 6px;',
                'background-color: #da4590;color: #fff;padding: 2px 6px;',
                ''
              )
            }
          }

          const result = callback.apply(callback, args)
          if ( result instanceof Promise ) {
            await result
          }
        }
      }

      return this
    }
  }

  return app
}
