## gatherer

collect artifacts for driver / plugin
expose api for reading filesystem and communicating with runtime

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

## presets

combine different driver, runtime, and several plugins
expose new command root

{
  "name": "pages",
  "driver": "driver-webpack",
  "gatherer": "gatherer-pages",
  "processor": "processor-pages"
}

in project package.json

"scripts": {
  "dev": "nut pages dev",
  "build": "nut pages build"
}
