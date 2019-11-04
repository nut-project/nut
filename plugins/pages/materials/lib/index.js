const path = require( 'path' )
const axios = require( 'axios' )
const tarStream = require( 'tar-stream' )
const gunzip = require( 'gunzip-maybe' )
const fse = require( 'fs-extra' )
const compiler = require( 'vue-template-compiler' )
const j = require( 'jscodeshift' )
const pascalcase = require( 'pascalcase' )

const ID = 'materials'

exports.name = ID

exports.apply = async ( api, options ) => {
  api.hooks.beforeRun.tapPromise( ID, async () => {
    if ( api.env !== 'development' ) {
      return
    }

    api.addRuntimeModule( {
      file: path.join( __dirname, 'runtime/index.js' ),
    } )

    // only enable in development mode
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
        return sendResponse( {
          success: false,
          message: '未找到该区块',
        } )
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
        return sendResponse( {
          success: false,
          message: '区块依赖安装失败'
        } )
      }

      api.service.message( 'toast', {
        success: true,
        message: `区块依赖安装完毕(${ deps.length }/${ deps.length })...`
      } )

      api.service.message( 'toast', {
        success: true,
        message: '正在下载区块源码...'
      } )

      const extractPath = path.join( process.cwd(), `src/materials/${ page.page.replace( /^pages\//, '' ) }`, block.name )
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
        const key = block.name
        const identifier = pascalcase( block.name )
        const source = path.relative( path.dirname( location ), extractPath )
        const ast = compiler.parseComponent( content )

        // handle template
        const template = addBlockTag( ast.template.content, key )
        // handle script
        const script = addBlock( ast.script.content, {
          key,
          identifier,
          source,
        } )

        // handle styles
        const styles = ast.styles
          .map( style => {
            const attrs = style.attrs
            const content = style.content

            const attrsString = Object.keys( attrs )
              .map( key => {
                const value = attrs[ key ]
                return value === true ? key : key + '=' + JSON.stringify( value )
              } )
              .join( ' ' )

            return ( `<style ${ attrsString }>${ indentLines( content, 2 ) }</style>` )
          } )
          .join( '\n' )

        let output = ``

        output = output + `<template>${ indentLines( template, 2 ) }</template>\n\n`
        output = output + `<script>${ indentLines( script, 2 ) }</script>\n\n`
        output = output + styles

        await fse.writeFile( location, output, 'utf8' )

        sendResponse( { success: true } )
      } catch ( error ) {
        console.error( error )
        return sendResponse( {
          success: false,
          message: '添加区块失败'
        } )
      }
    } )
  } )
}

function indentLines( content, times ) {
  return content
    .split( '\n' )
    .map( line => {
      if ( line.trim() ) {
        return ' '.repeat( times ) + line
      }

      return line
    } )
    .join( '\n' )
}

function addBlock( source = '', options = {} ) {
  const ast = j( source )

  const importDeclaration = j.importDeclaration(
    [ j.importDefaultSpecifier( j.identifier( options.identifier ) ) ],
    j.literal( options.source )
  )

  const imports = ast.find( j.ImportDeclaration )

  if ( imports.size() > 0 ) {
    imports.get().append( importDeclaration )
  } else {
    ast.find( j.Program ).get( 'body' ).unshift( importDeclaration )
  }

  const exportDefaults = ast.find( j.ExportDefaultDeclaration )

  if ( exportDefaults.size() > 0 ) {
    const last = exportDefaults.at( -1 ).get()
    const declaration = last.node.declaration
    if ( declaration.type === 'ObjectExpression' ) {
      const properties = declaration.properties
      let index
      const hasComponents = properties.some( ( prop, i ) => {
        const key = prop.key
        const isComponents = prop.type === 'Property' &&
          key && key.type === 'Identifier' && key.name === 'components'

        if ( isComponents ) {
          index = i
        }

        return isComponents
      } )

      const prop = j.property(
        'init',
        j.literal( options.key ),
        j.identifier( options.identifier )
      )

      if ( hasComponents ) {
        last
          .get( 'declaration', 'properties', index, 'value', 'properties' )
          .push( prop )
      } else {
        const statement = j.property(
          'init',
          j.identifier( 'components' ),
          j.objectExpression( [ prop ] )
        )
        last
          .get( 'declaration', 'properties' )
          .unshift( statement )
      }
    }
  }

  return ast.toSource( {
    quote: 'single',
    tabWidth: 2,
    arrayBracketSpacing: true,
    objectCurlySpacing: true,
  } )
}

function addBlockTag( content, blockName ) {
  const indents = getIndents( content )

  return content.replace( /\s*<\/[^>]+>\s*$/, $0 => {
    const hasLineBreak = $0.charAt( 0 ) === '\n'
    return `\n${ indents }<${ blockName } />${ hasLineBreak ? '' : '\n' }${ $0 }`
  } )
}

function getIndents( content ) {
  const matches = content.match( /[ \t]*<\/[^>]+>/g )

  if ( !matches ) {
    return
  }

  const len = matches.length
  const indentLen = getIndentLength( matches[ len - 1 ] )

  return ' '.repeat( indentLen + 2 )
}

function getIndentLength( string ) {
  const spaces = string.replace( /\t/g, '  ' ).match( /^\s*/ )
  return ( spaces && spaces[ 0 ] && spaces[ 0 ].length ) || 0
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
