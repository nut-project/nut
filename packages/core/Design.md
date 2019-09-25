## gatherer

collect artifacts for driver / plugin
expose api for reading filesystem and communicating with runtime
TODO: remove events, use gatherer.on

## driver

1. setup basic webpack( or other bundler )
2. expose api for plugin( webpack + artifacts from gatherer )
3. contains gatherer

## runtime

1. define commands( addCommand ), define entries, modify webpack config using driver api
2. expose api for plugin( runtime )
3. runtime can be extended( extends: 'runtime-pages' ), user can write their own runtime

## plugin

1. plugin can hook artifacts / modify webpack entry / webpack dev server
2. plugin can call runtime api to modify runtime code

powered by preset-pages

preset-pages -> 插件集合（插件可以注册命令）（preset可以认为是commands集合，所以可以提供一个scope用于隔离命令）

  nut: [
    {
      "scope": "pages"
      "preset": [ "preset-pages" ]
    }
  ]
  // 插件内部是否需要集成 webpack 和 webpack dev server？可以暴露高阶api出来？
  插件内部的命令有 api.watchFiles() api.rebuild()(没有，应该是插件暴露的)
  插件增强插件(基础的pages)这一点可以作为卖点
  in plugin -> （备注：driver 概念可以移除，冗余，增加理解成本）
    // nut 级别的插件可以定制runtime（runtime级别还有一个插件，至于 nut插件和runtime插件的组合使用，可以再定一个新的集合（preset））
    new Gatherer( 'runtime' ) + new Runtime（在插件中结合 runtime）（概念移除，插件 api 中有对应的gatherer api和events）
    // runtime does not provide webpack config itself, but driver does
    // create webpack config in driver
    .connect( gatherer, runtime )
      -> createWebpackConfig( type )
    mode -> dev( start dev server ) / prod

    // 以下问题暂时不考虑，弱点没关系，划分够细即可，作为一个插件存在，至于插件之间如何增强可以参考webpack的插件hooks，可以在另一个插件内部
    // 目前唯一的问题在于，runtime提供的api太弱，很多代码都是硬编码在内部，然后要求 webpack 适配的
    // 需增强 runtime api，最好类似runtime.createFile(  )，全部 runtime 文件可以在 driver 中创建（借助 virtual modules），这样才是一个单向的过程，从收集产物到和runtime的对接，一气呵成，而不是实现写好 runtime，然后要求 webpack 配合修改配置，这样后面的插件能力也才足够强
    // 所以问题的关键不在于，怎么划分，是否有 gatherer 这些都不重要，重点在于 driver 如何从中进行连接并驱动

另外就是插件的能力范围
可以允许插件注册commands，那其实 commands-pages 就没必要了，可以是

in project package.json

"scripts": {
  "dev": "nut pages dev",
  "build": "nut pages build"
}
