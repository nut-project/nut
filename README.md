<p align="center">
  <img width="100px" src="./media/logo.png" alt="nut logo">
</p>

<h1 align="center">NUT Project</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@nut-project/cli">
    <img src="https://flat.badgen.net/npm/v/@nut-project/cli" alt="npm version">
  </a>
  <a href="https://circleci.com/gh/nut-project/nut">
    <img src="https://flat.badgen.net/circleci/github/nut-project/nut/master" alt="build status">
  </a>
  <a href="https://www.npmjs.com/package/@nut-project/cli">
    <img src="https://flat.badgen.net/npm/dm/@nut-project/cli" alt="npm downloads">
  </a>
  <a href="https://github.com/nut-project/nut/blob/master/LICENSE">
    <img src="https://flat.badgen.net/npm/license/@nut-project/cli" alt="license">
  </a>
</p>

## 特性

- Flexible layout mechanism
- File-based router system
- Customizable layouts and themes
- 500+ icons
- Builtin markdown support
- System events
- Config management
- Convenient hot reload
- Plugin system

## layout / theme HMR

<img src="./media/hmr.gif" alt="hmr.gif" width="600px">

## markdown theme HMR

<img src="./media/markdown-theme-hmr.gif" alt="markdown-theme-hmr.gif" width="600px">


## System events

<img src="./media/system-events.jpg" alt="system-events.jpg" width="300px">

## Route matching

<img src="./media/route-match.jpg" alt="route-match.jpg" width="300px">

## Builtin layouts

#### default

| ocean | sakura |
| :---: | :---: |
| ![ocean](./media/default-ocean.jpg) | ![sakura](./media/default-sakura.jpg) |

#### saber

| ocean | sakura |
| :---: | :---: |
| ![ocean](./media/saber-ocean.jpg) | ![sakura](./media/saber-sakura.jpg) |

#### now

<img src="./media/now.jpg" alt="now" width="400px">

### How to write a layout

...

### How to write a plugin

A standard plugin looks like

```js
export default {
  name: 'your-superb-plugin',
  // some special plugin need specify type，but you can ignore this in most cases
  type: 'login',
  apply( ctx = {}, options = {} ) {
    const { api, events } = ctx

    api.expose( 'method_name', () => {} )
    api.expose( 'prop', 'value' )

    events.on( 'system:before-startup', async ctx => {
      await api.axios() // do some request
      await events.pluginEmit( 'some-event', data ) // emit plugin event out
    } )
  }
}
```

You can expose some methods or props to application, or listen for system events, emit out some event in plugin

#### Using plugin

nut.config.js

```js
module.exports = {
  plugins: {
    superb: {
      package: 'your-superb-plugin',
      enable: true,
    }
  }
}
```

superb is the name in current application

Use above plugin for example

```js
// plugin exposed
ctx.use( 'superb', 'method_name' )
ctx.use( 'superb', 'prop' )

// plugin events
ctx.events.on( 'plugin:superb:some-event', async data => {} )
```

## Get started

```bash
yarn global add @nut-project/cli
```

```bash
nut # develop locally
nut --prod # build for production
```
