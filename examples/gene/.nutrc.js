module.exports = {
  presets: [
    {
      cli: require.resolve( '@nut-project/cli-pages' ),
      drivers: [
        require.resolve( '@nut-project/driver-webpack' )
      ],
      plugins: {
        rem: {
          resolve: require.resolve( './plugins/plugin-rem' ),
        },
        clearConsole: '@nut-project/driver-webpack/plugins/clear-console',
        memoryUsage: '@nut-project/driver-webpack/plugins/memory-usage',
        serverInfo: '@nut-project/driver-webpack/plugins/server-info',
      }
    }
  ]
}
