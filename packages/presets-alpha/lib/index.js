module.exports = [
  {
    cli: require.resolve( '@nut-project/cli-pages' ),
    drivers: [
      require.resolve( '@nut-project/driver-webpack' ),
    ],
    plugins: {
      clearConsole: require.resolve( '@nut-project/driver-webpack/plugins/clear-console' ),
      memoryUsage: require.resolve( '@nut-project/driver-webpack/plugins/memory-usage' ),
      serverInfo: require.resolve( '@nut-project/driver-webpack/plugins/server-info' ),
    }
  }
]
