module.exports = {
  presets: [
    {
      cli: require.resolve( '@nut-project/cli-pages' ),
      drivers: [
        require.resolve( '@nut-project/driver-webpack' )
      ],
      plugins: [
        require.resolve( './plugins/plugin-rem' )
      ],
    }
  ]
}
