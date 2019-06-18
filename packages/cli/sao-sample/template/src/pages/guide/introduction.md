**NUT，中后台系统的前端解决方案**。

从广义的角度来说，nut 是一个静态站点生成工具。但是他本身提供的诸多特性，更专注于提供一套中后台系统的解决方案

<img width="500px" src="./terminal.png" alt="terminal screenshot">

# 理念

- 从 代码构建 到 应用构建
- 弱化了路由和单页的概念，强化了组件即页面
- 使用了框架无关的路由体系，支持各种类型的页面（markdown、vue、regular...）
- 基于插件实现的 enhance
- 集成 webpack 最佳实践
- 内置的加载优化

...

# 提问环节

<details>
  <summary>路由方案更换，如何升级所有工程？</summary>
  <p style="font-size: 15px;margin: 10px 15px">
    通常路由的代码会编码在仓库中，每次技术选型更换，路由相关代码如何修改？与之相关的还有菜单管理（路由变化->菜单的激活），<strong>为此，nut提供了一个基于文件系统、框架无关的路由方案</strong>
  </p>
</details>

<details>
  <summary>布局升级，如何升级所有工程？</summary>
  <p style="font-size: 15px;margin: 10px 15px">
    比如 header、sidebar 等需要统一升级，应该怎么做？nut 的做法和很多静态站点生成工具一样，将 layout 这部分抽象并提取了出来，做到了可升级、可更换，只要修改配置，无需改动任何代码
  </p>
</details>

<details>
  <summary>提供用户使用文档，需要几步？</summary>
  <p style="font-size: 15px;margin: 10px 15px">
    <p>一个相对完整的应用应该提供一份详细的用户文档</p>
    <p>你也可以独立部署一个文档站点，但显然在应用内部的体验会好很多</p>
    <p>如果你自己实现，可能需要以下几步：</p>
    <ol>
      <li>添加文档路由和页面</li>
      <li>用 markdown-it / marked 解析 markdown 内容，添加代码高亮</li>
      <li>选择合适的代码高亮主题</li>
    </ol>
    <p>用了 nut 之后，你只要书写 markdown 文件即可，他会帮你生成路由、菜单，并且内置了几套不错的代码高亮主题</p>
  </p>
</details>

<details>
  <summary>如何在10秒内对接登录系统？</summary>
  <p style="font-size: 15px;margin: 10px 15px">
    <p>如果你想要接入登录，你通常需要做这些事情</p>
    <ol>
      <li>阅读接口文档，了解如何接入</li>
      <li>加入登录状态判断、展示用户名、退出登录等逻辑</li>
    </ol>
    <p>后端通常会有 Egg 插件之类的形式提供几个登录相关的接口</p>
    <p>后端装个 Egg 插件配置下就可以了，<strong>为什么前端不呢？</strong></p>
    <p>有了nut，安装对应的 nut plugin，稍作配置，就可以帮你接入登录系统</p>
  </p>
</details>

<details>
  <summary>页面如何跨工程复用？</summary>
  <p style="font-size: 15px;margin: 10px 15px">
    <p>诸如 Koa / Eggjs 可以通过 middleware 给后端添加路由，实现路由的跨工程复用</p>
    <p>都说前后端路由是相通的，为什么前端没有复用路由（页面）的方案呢？</p>
    <p>工具方法可以通过封装 npm 包的形式跨工程复用，那么一个页面呢？</p>
    <p>假如有两个单页应用 A 和 B，分别使用了 vue 和 regular，某个页面想在 A、B 两个工程中复用，该怎么做呢？</p>
    <p>nut 通过插件体系解决了这个问题</p>
  </p>
</details>

<br>
...

# 特性 / 优点

- **零构建配置**

  <p style="font-size: 15px;">无需在工程中保留大量的构建配置文件</p>

- **标准化的路由、layout、事件系统**
  <p style="font-size: 15px;">一致的开发体验，更低的维护成本，不熟悉不同工程的路由方案、菜单管理？不存在的</p>
  <p style="font-size: 15px;">会新建文件，你就会写单页应用</p>

- **灵活 & 可扩展的 layout 生态**

  <p style="font-size: 15px;">业务无关视图的剥离，一键换装</p>

- **页面的 跨工程 & 跨技术栈 复用**

  <p style="font-size: 15px;">借鉴后端的 middleware 方案，支持从外部向应用内添加前端路由（页面），无视工程技术栈（regular 或 vue），无缝将新页面对接到 nut 的路由系统中</p>

- **完善的插件体系**

  <p style="font-size: 15px;">通常一个完整功能都需要前后端的交互，Egg 提供了插件的生态，前端如果要和后端接口进行交互，势必要出一套对应的插件体系，你可以通过插件定制功能、调用后端接口，并分享给他人</p>
  <p style="font-size: 15px;">你可以通过插件来增强你的应用，这种理念可以参考 atom 编辑器的插件体系，普通的 npm包 需要被你引用并调用，但是<strong>插件可以主动增强你的应用</strong>，这是 nut 的插件体系相比普通 npm 包最大的优势</p>

- **内置的文档方案**

  <p style="font-size: 15px;">会 markdown 语法就可以上手写文档！</p>
  <p style="font-size: 15px;">markdown 如何转 html，代码如何高亮等等，这些你都不需要关心</p>

- **智能的 quicklink 支持**

- **内置 500+ 的字体图标**
  <p style="font-size: 15px;">满足你的日常使用</p>
