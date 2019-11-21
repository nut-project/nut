const CopyPlugin = require( 'copy-webpack-plugin' )

exports.extend = function () {
  // TODO: read user config
}

exports.expose = function ( { driver } = {} ) {
  driver.expose( 'copy', ( copies = [] ) => { // eslint-disable-line
    // const [ { from, to } ] = copies
    driver.useHook( 'dangerously_chainWebpack', config => {
      config.plugin( 'copy' )
        .use( CopyPlugin, [
          // ...
        ] )
    } )
  } )
}
