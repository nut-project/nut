const CopyPlugin = require( 'copy-webpack-plugin' )

exports.extend = function ( config ) {
  config.plugin( 'copy' )
    .use( CopyPlugin, [
      [
        {
          from: {
            glob: 'public/**/*',
            dot: true
          },
          to: '.',
          ignore: [ '.DS_Store' ]
        }
      ],
      {
        context: process.cwd()
      }
    ] )
}

exports.expose = function ( driver ) {
  driver.expose( 'copy', ( copies = [] ) => {
    driver.useHook( 'dangerously_chainWebpack', config => {
      copies.forEach( copy => {
        config.plugin( 'copy' )
          .tap( ( args = [] ) => {
            args[ 0 ] = args[ 0 ] || []
            args[ 0 ].push( {
              from: {
                glob: copy.from,
                dot: true
              },
              to: copy.to || '.',
              toType: copy.toType,
              ignore: [ '.DS_Store' ]
            } )

            return args
          } )
      } )
    } )
  } )
}
