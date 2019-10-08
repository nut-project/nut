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
