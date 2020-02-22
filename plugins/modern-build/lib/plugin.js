// modified from zeit/next.js:packages/next/build/webpack/plugins/next-esm-plugin.ts

const ID = `modern-build-webpack-plugin`
const TERSER_PLUGIN_NAME = `TerserPlugin`

// https://gist.github.com/samthor/64b114e4a4f539915a95b91ffd340acc
const safariFix = `!function(){var e=document,t=e.createElement("script");if(!("noModule"in t)&&"onbeforeload"in t){var n=!1;e.addEventListener("beforeload",function(e){if(e.target===t)n=!0;else if(!e.target.hasAttribute("nomodule")||!n)return;e.preventDefault()},!0),t.type="module",t.src=".",e.head.appendChild(t),t.remove()}}();`

class ModernBuildWebpackPlugin {
  constructor( options = {} ) {
    this._options = options
  }

  apply( compiler ) {
    const { api, legacyTerserPluginOptions } = this._options

    compiler.hooks.compilation.intercept( {
      register( tapInfo ) {
        if ( tapInfo.name === TERSER_PLUGIN_NAME ) {
          const oldFn = tapInfo.fn
          tapInfo.fn = ( compilation, params ) => {
            // skip terser for childCompiler, we will add new terser
            if ( compilation.name === ID ) {
              return
            }

            oldFn( compilation, params )
          }
        }

        return tapInfo
      }
    } )

    // make hook is after compilation hook, terser is already applied atm
    compiler.hooks.make.tapAsync( ID, ( compilation, callback ) => {
      this.modernBuild( api, legacyTerserPluginOptions, compiler, compilation )
        .then( callback )
    } )

    this.alterScriptTags( api, compiler )
  }

  alterScriptTags( api, compiler ) {
    const HtmlWebpackPlugin = api.driverRequire( 'html-webpack-plugin' )

    let publicPath = compiler.options.output.publicPath || ''
    if ( publicPath && !publicPath.endsWith( '/' ) ) {
      publicPath = publicPath + '/'
    }

    function isModernUrl( pathString ) {
      if ( !pathString ) {
        return false
      }

      pathString = pathString.replace( publicPath, '' )

      return !pathString.includes( `legacy/` )
    }

    compiler.hooks.compilation.tap( ID, compilation => {
      const hooks = HtmlWebpackPlugin.getHooks( compilation )

      const headTagFunction = tag => {
        if (
          tag.tagName === 'link' &&
          tag.attributes &&
          tag.attributes.rel === 'preload' &&
          tag.attributes.as === 'script' &&
          isModernUrl( tag.attributes.href )
        ) {
          tag.attributes.rel = 'modulepreload'
        }

        return tag
      }

      const bodyTagFunction = tag => {
        if ( tag.tagName !== 'script' || !( tag.attributes && tag.attributes.src ) ) {
          return tag
        }

        if ( !tag.attributes ) {
          tag.attributes = {}
        }

        if ( isModernUrl( tag.attributes.src ) ) {
          tag.attributes.type = 'module'
        } else {
          tag.attributes.nomodule = ''
        }

        return tag
      }

      const isLegacyScript = tag => {
        if ( tag.tagName !== 'script' || !( tag.attributes && tag.attributes.src ) ) {
          return false
        }

        if ( tag.attributes && isModernUrl( tag.attributes.src ) ) {
          return false
        }

        return true
      }

      hooks.alterAssetTagGroups.tap( ID, assets => {
        try {
          assets.headTags = assets.headTags.map( headTagFunction )

          // modern scripts -> safarifix -> legacy scripts
          const legacyScripts = assets.bodyTags
            .filter( tag => isLegacyScript( tag ) )

          assets.bodyTags = assets.bodyTags
            .filter( tag => !isLegacyScript( tag ) )

          assets.bodyTags.push( {
            tagName: 'script',
            closeTag: true,
            innerHTML: safariFix,
          } )

          assets.bodyTags.push( ...legacyScripts )

          assets.bodyTags = assets.bodyTags.map( bodyTagFunction )
        } catch ( e ) {
          console.log( e )
        }
      } )
    } )
  }

  async modernBuild( api, legacyTerserPluginOptions, compiler, compilation ) {
    const SplitChunksPlugin = api.webpackRequire( 'lib/optimize/SplitChunksPlugin' )
    const RuntimeChunkPlugin = api.webpackRequire( 'lib/optimize/RuntimeChunkPlugin' )
    const SingleEntryPlugin = api.webpackRequire( 'lib/SingleEntryPlugin' )
    const MultiEntryPlugin = api.webpackRequire( 'lib/MultiEntryPlugin' )
    const JsonpTemplatePlugin = api.webpackRequire( 'lib/web/JsonpTemplatePlugin' )

    const excludePluginNames = [
      this.constructor.name,
      'VueLoaderPlugin', // execute VueLoaderPlugin two times will mess rules up
      'HtmlWebpackPlugin',
      'InlineChunkHtmlPlugin',
      'HtmlCheerioPlugin',
    ]

    const outputOptions = { ...compiler.options.output }

    outputOptions.filename = `legacy/${ outputOptions.filename }`
    outputOptions.chunkFilename = `legacy/${ outputOptions.chunkFilename }`

    const plugins = ( compiler.options.plugins || [] )
      .filter( p => !excludePluginNames.includes( p.constructor.name ) )

    const childCompiler = compilation.createChildCompiler( ID, outputOptions )

    childCompiler.context = compiler.context
    childCompiler.inputFileSystem = compiler.inputFileSystem
    childCompiler.outputFileSystem = compiler.outputFileSystem

    if ( Array.isArray( plugins ) ) {
      for ( const plugin of plugins ) {
        plugin.apply( childCompiler )
      }
    }

    let entries = compiler.options.entry

    if ( typeof entries === 'function' ) {
      entries = await entries()
    }

    if ( typeof entries === 'string' ) {
      entries = { index: entries }
    }

    Object.keys( entries ).forEach( entry => {
      const entryFiles = entries[ entry ]
      if ( Array.isArray( entryFiles ) ) {
        new MultiEntryPlugin( compiler.context, entryFiles, entry ).apply(
          childCompiler
        )
      } else {
        new SingleEntryPlugin( compiler.context, entryFiles, entry ).apply(
          childCompiler
        )
      }
    } )

    new JsonpTemplatePlugin().apply( childCompiler )

    const optimization = compiler.options.optimization
    if ( optimization ) {
      if ( optimization.splitChunks ) {
        new SplitChunksPlugin(
          Object.assign( {}, optimization.splitChunks )
        ).apply( childCompiler )
      }

      if ( optimization.runtimeChunk ) {
        new RuntimeChunkPlugin(
          Object.assign( {}, optimization.runtimeChunk )
        ).apply( childCompiler )
      }

      if ( optimization.minimize ) {
        // add our terser plugin
        const terser = compiler.options.optimization.minimizer
          .find( m => m.constructor.name === TERSER_PLUGIN_NAME )

        const TerserPlugin = terser.constructor
        new TerserPlugin( legacyTerserPluginOptions )
          .apply( childCompiler )
      }
    }

    compilation.hooks.optimizeAssets.tapAsync( ID, ( assets, callback ) => {
      const babelLoader = getLoaders(
        childCompiler.options.module.rules,
        loader => loader.includes( 'lib/webpack/babel/loader' )
      )[ 0 ]

      if ( babelLoader ) {
        babelLoader.options = Object.assign( {}, babelLoader.options, {
          isModern: false,
        } )
      }

      childCompiler.runAsChild( ( err, entries, childCompilation ) => {
        if ( err ) {
          compilation.errors.push( err )
          callback()
          return
        }

        if ( childCompilation.errors.length > 0 ) {
          compilation.errors.push( ...childCompilation.errors )
          callback()
          return
        }

        mergeCompilation( compilation, childCompilation )

        callback()
      } )
    } )
  }
}

function getLoaders( rules, predicate ) {
  const results = []
  for ( const rule of rules ) {
    if ( Array.isArray( rule.use ) ) {
      const matches = rule.use.filter(
        r => r.loader && predicate( r.loader )
      )
      if ( matches.length > 0 ) {
        results.push( ...matches )
      }
    }

    const ruleUse = rule.use
    let ruleLoader = rule.loader
    if ( typeof ruleLoader === 'object' && 'loader' in ruleLoader ) {
      ruleLoader = ruleLoader.loader
    }
    if (
      ( ruleUse && ruleUse.loader && predicate( ruleUse.loader ) ) ||
      ( ruleLoader && predicate( ruleLoader ) )
    ) {
      results.push( ruleUse || rule )
    }
  }
  return results
}

function mergeCompilation( compilation, childCompilation ) {
  compilation.assets = Object.assign(
    childCompilation.assets,
    compilation.assets
  )

  compilation.namedChunkGroups = Object.assign(
    childCompilation.namedChunkGroups,
    compilation.namedChunkGroups
  )

  const unnamedChunks = []
  const childChunkFileMap = childCompilation.chunks.reduce(
    ( chunkMap, chunk ) => {
      // Dynamic chunks may not have a name. It'll be null in such cases
      if ( chunk.name === null ) {
        unnamedChunks.push( chunk )
      } else {
        chunkMap[ chunk.name ] = chunk
      }

      return chunkMap
    },
    {}
  )

  // Merge chunks - merge the files of chunks with the same name
  compilation.chunks.forEach( chunk => {
    const childChunk = childChunkFileMap[ chunk.name ]

    // Do not merge null named chunks since they are different
    if ( chunk.name !== null && childChunk && childChunk.files ) {
      delete childChunkFileMap[ chunk.name ]
      chunk.files.push(
        ...childChunk.files.filter( v => !chunk.files.includes( v ) )
      )
    }
  } )

  // Add modern only chunks into the main compilation
  compilation.chunks.push(
    ...Object.values( childChunkFileMap ),
    ...unnamedChunks
  )

  // Place modern only (unmerged) chunks inside the right entry point
  compilation.entrypoints.forEach( ( entryPoint, entryPointName ) => {
    const childEntryPoint = childCompilation.entrypoints.get( entryPointName )

    childEntryPoint.chunks.forEach( chunk => {
      if (
      // Add null named dynamic chunks since they weren't merged
        chunk.name === null ||
          childChunkFileMap.hasOwnProperty( chunk.name ) // eslint-disable-line
      ) {
        entryPoint.chunks.push( chunk )
      }
    } )
  } )
}

module.exports = ModernBuildWebpackPlugin
