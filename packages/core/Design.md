## gatherer

collect artifacts for driver / plugin
expose api for reading filesystem and communicating with runtime

## driver

1. setup webpack( or other bundler )
2. expose api for plugin( webpack + artifacts from gatherer )
3. contains gatherer

## runtime

1. define entries, modify webpack config using driver api
2. expose api for plugin( runtime )

## plugin

1. plugin can hook artifacts / modify webpack entry / webpack dev server
2. plugin can call runtime api to modify runtime code

## presets

combine different driver and runtime
