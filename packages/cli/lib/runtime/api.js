const api = {
  _plugin_methods: {},
  _plugin_alias: {},

  expose( pluginName, methodName, method ) {
    this._plugin_methods[ pluginName ] = this._plugin_methods[ pluginName ] || {}
    this._plugin_methods[ pluginName ][ methodName ] = method
  },

  use( pluginName, methodName, ...args ) {
    const realPluginName = this._plugin_alias[ pluginName ] || pluginName
    const methods = this._plugin_methods[ realPluginName ]

    if ( !methods ) {
      return
    }

    const method = methods[ methodName ]

    if ( typeof method === 'function' ) {
      return method.apply( null, args )
    }

    return method
  },

  pluginAlias( oPluginName, nPluginName ) {
    this._plugin_alias[ nPluginName ] = oPluginName
  },

  // 比如想在开发环境禁用登录组件
  disablePlugin() {

  },
}

export default api
