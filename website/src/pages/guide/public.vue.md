nut 默认使用 `src/public` 作为静态目录

## 示例

<zi-files defaultExpand={ true } files={ [ {
  type: 'directory',
  name: 'src',
  files: [ {
    type: 'directory',
    name: 'public',
    files: [ {
      type: 'file',
      name: 'sample.jpg',
      size: 1,
    }, {
      type: 'file',
      name: 'font.woff2',
      size: 1,
    } ],
  } ],
} ] }></zi-files>

↓ 打包后 ↓

<zi-files defaultExpand={ true } files={ [ {
  type: 'directory',
  name: 'dist',
  files: [ {
    type: 'file',
    name: 'sample.jpg',
    size: 1,
  }, {
    type: 'file',
    name: 'font.woff2',
    size: 1,
  } ],
} ] }></zi-files>

## 如何引用 pulic 下的文件

```
${ publicUrl }sample.jpg
${ publicUrl }font.woff2
```

<zi-note label="Tips">
  publicUrl 根据实际情况替换，可能为 `./`、`/` 或 `CDN 路径`
</zi-note>
