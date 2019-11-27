module.exports = {
  presets: [
    {
      cli: require.resolve( '@nut-project/cli-pages' ),
      drivers: [
        require.resolve( '@nut-project/driver-webpack' )
      ],
      plugins: [
        require.resolve( './plugins/plugin-rem' ),
        '@nut-project/driver-webpack/plugins/clear-console',
        '@nut-project/driver-webpack/plugins/memory-usage',
        '@nut-project/driver-webpack/plugins/server-info',
      ],
    }
  ]
}
