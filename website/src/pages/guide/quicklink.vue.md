nut 内部使用 quicklink 对加载做了优化

## 对比

| 未使用 quicklink | 使用 quicklink |
| :---: | :---: |
| ![no-quicklink](/no-quicklink.gif) | ![quicklink](/quicklink.gif) |

## API

`ctx.api.quicklink.prefetch`

**举例**

```js
ctx.api.quicklink.prefetch( [
  'pages/foo',
  'pages/bar'
] )
```
