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

## presets ( user plugins )

powered by preset-pages

preset-pages -> user plugins for driver-pages

```json
nutConfig: {
  "preset": [ "preset-pages" ]
}
```

# App / Plugin API

pages.browser.js

```js
export default ( ctx, options ) => {
  ctx.api
  ctx.events
  ctx.expose
  ctx.emit
  ctx.on
}
```

pages.node.js

```js
module.exports = function ( ctx, options ) {
  ctx.restart( reason ) only in dev mode
  ctx.refreshBrowser
  ctx.html.addScript during webpack compile
  ctx.html.addMeta
  ctx.html.addLink
  ctx.html.addStyle
  ctx.virtualModules.write()
  ctx.chainWebpack
  ctx.modifyWebpack
  ctx.middlewares.append
  ctx.middlewares.prepend
  ctx.middlewares.before
  ctx.middlewares.after
  ctx.markdown.registerTheme
  ctx.markdown.addRemarkPlugin
  ctx.markdown.addRehypePlugin
  // ctx.emit
  // ctx.on
  // ctx.expose
}
```
