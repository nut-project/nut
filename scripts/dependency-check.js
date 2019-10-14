const check = require( 'dependency-check' )
const globby = require( 'globby' )
const path = require( 'path' )
const chalk = require( 'chalk' )

process
  .on( 'unhandledRejection', ( reason, p ) => {
    console.error( reason, 'Unhandled Rejection at Promise', p )
  } )

;( async () => {
  const files = await globby( [
    'packages/**/package.json',
    'plugins/pages/**/package.json',
    '!packages/**/node_modules/**/package.json',
    '!plugins/**/node_modules/**/package.json',
    '!plugins/pages/microfrontends/lib/create/templates/**/package.json',
  ], {
    absolute: true
  } )

  files.map( file => path.dirname( file ) )

  console.log()

  await files.reduce( async ( total, file ) => {
    await total

    const basedir = path.relative( process.cwd(), path.dirname( file ) )

    const data = await check( {
      path: file,
      entries: [],
      noDefaultEntries: false,
      extensions: [ '.js' ]
    } )

    const pkg = data.package
    const deps = data.used

    const missing = check.missing( pkg, deps, {
      excludeDev: false,
      excludePeer: false,
      ignore: []
    } )

    if ( missing.length ) {
      console.error( basedir + ':', chalk.red( 'Fail!' ) +' Dependencies not listed in package.json: ' )
      console.log()
      console.log( missing.map( m => chalk.blue.inverse( ' ' + m + ' ' ) ).join( ' ' ) )
    } else {
      console.log( basedir + ':', chalk.green( 'Passed' ) )
    }

    console.log()
  }, Promise.resolve() )
} )()
