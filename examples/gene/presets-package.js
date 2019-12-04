module.exports = [
  {
    cli: require.resolve( '@nut-project/cli-pages' ),
    drivers: [
      require.resolve( '@nut-project/driver-webpack' ),
      require.resolve( '@nut-project/driver-mock' )
    ],
    plugins: {
      clearConsole: '@nut-project/driver-webpack/plugins/clear-console',
      memoryUsage: '@nut-project/driver-webpack/plugins/memory-usage',
      serverInfo: '@nut-project/driver-webpack/plugins/server-info',
    }
  }
]
