nut 使用 `src/public` 作为静态目录

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

## 如何引用

```
${ publicUrl }sample.jpg
${ publicUrl }font.woff2
```

<p class="danger">
  publicUrl 可以根据你的情况替换，可能为 `./`，`/` 或者 `CDN 路径`
</p>
