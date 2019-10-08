## gatherer（can be merged into driver-pages）

collect artifacts for driver / plugin
expose api for reading filesystem and communicating with runtime

## @nut-project/webpack

1. setup basic webpack( or other bundler )
2. expose api for configure webpack

## driver ( e.g. driver-pages )

1. add commands
2. expose api for other user plugins
  api.watchFiles / api.rebuild...
3. can be extended for adding new commands
4. commands should be stable
5. use { "scope": "pages" } to limit commands namespace

in project package.json

"scripts": {
  "dev": "nut pages dev",
  "build": "nut pages build"
}

## user plugin ( api provided by driver-pages )

1. plugin can define entries / hook artifacts / modify webpack entry / webpack dev server
2. plugin can call runtime api to modify runtime code

## presets（ user plugins ）

powered by preset-pages

preset-pages -> user 插件集合（preset 是对 pages 的增强，不能新增命令，不然和 stable 违背）

  nutConfig: {
    "preset": [ "preset-pages" ]
  }

  // 目前的问题在于，runtime api 太弱，很多 runtime 代码都是硬编码在内部，然后要求 webpack 适配
  // TODO: 增强 runtime api，类似 runtime.createFile，全部 runtime 文件可以在 driver 中创建（借助 virtual modules），这样才是一个完整的插件流程，从收集产物 -> runtime -> modify webpack，而不是先写好 runtime，然后 webpack 修改配置进行配合
