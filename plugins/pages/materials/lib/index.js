const path = require( 'path' )
const axios = require( 'axios' )
const tarStream = require( 'tar-stream' )
const gunzip = require( 'gunzip-maybe' )
const fse = require( 'fs-extra' )
const compiler = require( 'vue-template-compiler' )
const prettier = require( 'prettier' )
const { parse } = require( '@babel/parser' )
const parserHTML = require( 'posthtml-parser' )
const renderHTML = require( 'posthtml-render' )
const t = require( '@babel/types' )
const generate = require( '@babel/generator' ).default
const traverse = require( '@babel/traverse' ).default

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

      const extractPath = path.join( process.cwd(), `src/materials/${ page.page.replace( /^pages\//, '' ) }`, 'block0' )
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

      try {
        const ast = compiler.parseComponent( content, {} )
        // 处理template
        ast.template.content = insertEnd( ast.template.content, [ 'block0' ] )
        // 处理script
        ast.script.content = insertBlocks( ast.script.content, [
          { name: 'block0', location: '../materials/home/block0' }
        ] )
        // 处理style
        const styles = ast.styles.map( _ => {
          return `<style ${ Object.keys( _.attrs ).map( key => key + '=' + _.attrs[ key ] ).join( ' ' ) }>${ _.content }</style>`
        } ).join( '\n' )
        await fse.writeFile( location, `<template>
        ${ ast.template.content }</template>
        <script>
        ${ ast.script.content }
        </script>
        ${ styles }
        `, 'utf8' )
        await api.delay( 1500 )
      } catch ( error ) {
        console.error( error )
      }
      sendResponse( { success: true } )
    } )
  } )
}

/**
 *
 * @param {*} content
 * @param {*} blocks
 * @example
 * blocks = [
  *   { name: 'block0', location: '../../blcok0.vue' }
  * ]
  */
function insertBlocks( content, blocks ) {
  const ast = parse( content, {
    sourceType: 'module'
  } )
  const body = ast.program.body
  // 插入声明
  body.unshift(
    ...blocks.map( _ => t.importDeclaration( [ t.importDefaultSpecifier( {
      type: 'Identifier',
      name: _.name
    } ) ], t.stringLiteral( _.location ) ) )
  )
  // 引入components
  const visitor = {
    enter( path ) {
      if ( t.isExportDefaultDeclaration( path.node ) ) {
        const exportDefault = path.node.declaration
        let components = exportDefault.properties.find( _ => _.key.name === 'components' )

        const componentIdentifiers = blocks.map( _ => t.objectProperty( {
          type: 'Identifier',
          name: _.name
        }, {
          type: 'Identifier',
          name: _.name
        } ) )

        if ( components ) {
          components.value.properties.push( ...componentIdentifiers )
        } else {
          components = t.objectProperty(
            {
              type: 'Identifier',
              name: 'components'
            },
            t.objectExpression( componentIdentifiers )
          )
          exportDefault.properties.push( components )
        }
      }
    }
  }

  traverse( ast, visitor )
  const { code } = generate(
    {
      type: 'Program',
      body,
    },
    { comments: true, retainFunctionParens: true, compact: true }
  )

  return prettier.format( code, { parser: 'babel' } )
}

function insertEnd( content, blocks ) {
  content = content.replace( /^\n/g, '' ).replace( /\n$/g, '' )
  const ast = parserHTML( content )

  ast[ 0 ].content.push( ...blocks.map( _ => ( {
    tag: _
  } ) ) )

  return renderHTML( ast, {
    singleTags: blocks,
    closingSingleTag: 'slash'
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
