---
title: 静态资源
---

nut 约定 `src/public` 目录作为静态目录

## 示例

假如你有这样一些文件

```
src/public/sample.jpg
src/public/font.woff2
```

↓ 打包后 ↓

```
dist/sample.jpg
dist/font.woff2
```

## 使用

在你的代码中你只要这样引用即可

```
${ publicUrl }sample.jpg
${ publicUrl }font.woff2
```

<p class="danger">
  publicUrl 请根据你的情况自行替换，可能为 `./`，`/` 或者 `CDN 路径`
</p>
