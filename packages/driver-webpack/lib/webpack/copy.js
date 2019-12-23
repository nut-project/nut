const path = require( 'path' )
const CopyPlugin = require( 'copy-webpack-plugin' )

exports.extend = function ( config ) {
  config
    .plugin( 'copy' )
    .use( CopyPlugin, [
      [
        {
          from: {
            glob: '**/*',
            dot: true
          },
          to: '.',
          ignore: [ '.DS_Store' ],
          context: path.join( process.cwd(), 'public' )
        }
      ],
      {}
    ] )
}

exports.expose = function ( driver ) {
  driver.expose( 'copy', ( copies = [] ) => {
    driver.useHook( 'dangerously_chainWebpack', config => {
      copies.forEach( copy => {
        config
          .plugin( 'copy' )
          .tap( ( args = [] ) => {
            args[ 0 ] = args[ 0 ] || []
            args[ 0 ].push( {
              from: {
                glob: copy.from,
                dot: true
              },
              to: copy.to || '.',
              toType: copy.toType,
              context: copy.context || process.cwd(),
              ignore: [ '.DS_Store' ]
            } )

            return args
          } )
      } )
    } )
  } )
}
