const path = require( 'path' )
const axios = require( 'axios' )
const tarStream = require( 'tar-stream' )
const gunzip = require( 'gunzip-maybe' )
const fse = require( 'fs-extra' )

const ID = 'materials'

exports.name = ID

exports.apply = async ( api, options ) => {
  api.addRuntimeModule( {
    file: path.join( __dirname, 'runtime/index.js' ),
  } )

  api.hooks.beforeRun.tapPromise( ID, async () => {
    api.service.onCall( 'get-blocks', async ( data, sendResponse ) => {
      if ( options.url ) {
        try {
          const response = await axios.get( options.url )
          sendResponse( response.data )
        } catch ( e ) {
          sendResponse( {} )
        }
      }
    } )

    api.service.onCall( 'add-block', async ( { block = {}, page = {} }, sendResponse ) => {
      const { dependencies = {}, source = {} } = block

      const response = await axios.get( `${ source.registry }/${ source.npm }` )
      const json = response.data

      if ( json.error ) {
        sendResponse( {
          success: false,
          message: json.error,
        } )

        return
      }

      let tarball

      try {
        tarball = json.versions[ source.version ].dist.tarball
      } catch ( e ) {
        console.log( e.stack )
      }

      if ( !tarball ) {
        sendResponse( {
          success: false,
          message: '未找到该区块',
        } )

        return
      }

      delete dependencies.vue

      const deps = Object.keys( dependencies )
        .map( name => `${ name }@${ dependencies[ name ] }` )

      api.service.message( 'toast', {
        success: true,
        message: `正在安装区块依赖(0/${ deps.length })...`
      } )

      try {
        await api.install( deps )
      } catch ( e ) {
        console.log( 'install error', e )
      }

      api.service.message( 'toast', {
        success: true,
        message: `区块依赖安装完毕(${ deps.length }/${ deps.length })...`
      } )

      await api.delay( 1500 )

      api.service.message( 'toast', {
        success: true,
        message: '正在下载区块源码...'
      } )

      const extractPath = path.join( process.cwd(), `src/materials/${ page.page.replace( /^pages\//, '' ) }` )
      await fse.mkdirp( extractPath )

      const files = await readTarball( tarball )

      api.service.message( 'toast', {
        success: true,
        message: '正在添加区块...'
      } )

      const jobs = files
        .map( file => {
          if ( file.type !== 'file' || !file.path.startsWith( 'src/' ) ) {
            return false
          }

          const targetPath = path.join( extractPath, file.path.replace( /^src\//, '' ) )

          return fse.writeFile( targetPath, file.content )
        } )
        .filter( Boolean )

      await Promise.all( jobs )

      const location = page.location

      // eslint-disable-next-line
      const content = await fse.readFile( location, 'utf8' )

      // TODO: insert new block
      await fse.writeFile( location, ``, 'utf8' )

      await api.delay( 1500 )

      sendResponse( { success: true } )
    } )
  } )
}

async function readTarball( url ) {
  const streamResponse = await axios( {
    method: 'get',
    url,
    responseType: 'stream',
  } )

  const stream = streamResponse.data

  const extract = extractFiles()

  stream
    .pipe( gunzip() )
    .pipe( extract )

  let files = []
  try {
    files = await extract.promise
  } catch ( e ) {
    console.log( e )
  }

  return files
}

function extractFiles() {
  const extract = tarStream.extract()
  const files = []

  const packageReg = /^package\//
  extract.on( 'entry', ( header, stream, cb ) => {
    const chunk = []

    stream.on( 'data', data => chunk.push( data ) )
    stream.on( 'end', () => {
      const content = Buffer.concat( chunk )

      const file = {
        type: header.type,
        path: header.name.replace( packageReg, '' ),
        content,
      }

      if ( header.type === 'symlink' || header.type === 'link' ) {
        file.linkname = header.linkname
      }

      files.push( file )
      cb()
    } )
  } )

  const promise = new Promise( ( resolve, reject ) => {
    extract.on( 'finish', () => resolve( files ) )
    extract.on( 'error', reject )
  } )

  extract.promise = promise

  return extract
}
