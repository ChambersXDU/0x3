# 0x3

一个极简风格的网址导航，使用原生 HTML、CSS 和 JavaScript 编写，无需安装依赖或构建。

## 功能

- 六个导航分类：日常、娱乐、生活、学习、开发、设计，共 288 个网址。
- 八种搜索引擎，支持通过 `#gg`、`#bd`、`#bi` 等指令配合 Tab 或空格快捷切换。
- 自定义分类、分组和网址，支持添加、编辑与删除。
- 十种配色，以及自动、日间、夜间主题模式。
- 图标显示方式、链接打开方式和图片横幅开关。
- 设置保存在当前浏览器的 localStorage 中，支持 JSON 备份导入导出。
- 适配桌面和手机布局。

## 原站油猴脚本

以下脚本用于原版 [0x3.com](https://0x3.com/)，在搜索框加载后通过原站菜单切换默认搜索引擎，仍可手动选择其他引擎。

| 默认引擎 | 脚本源码 | 安装链接 |
| --- | --- | --- |
| Google | [0x3-default-google.user.js](userscripts/0x3-default-google.user.js) | [安装 Google 版本](https://raw.githubusercontent.com/ChambersXDU/0x3/main/userscripts/0x3-default-google.user.js) |
| 必应 | [0x3-default-bing.user.js](userscripts/0x3-default-bing.user.js) | [安装必应版本](https://raw.githubusercontent.com/ChambersXDU/0x3/main/userscripts/0x3-default-bing.user.js) |

在浏览器中启用 Tampermonkey（油猴），打开对应安装链接并安装，然后刷新 `0x3.com`。如果浏览器仅显示代码，可将全文复制到油猴的新建脚本中保存。两个版本任选其一，不要同时启用，以免相互切换搜索引擎。这些脚本只匹配 `0x3.com`，不匹配本项目部署到其他域名的网站。

## 本地运行

需要 Python 3，在项目目录运行：

```sh
python3 preview.py
```

打开 http://localhost:4317 。预览服务支持 `/`、`/setting` 和 `/about` 路由。

## 部署

将 `dist` 目录作为网站根目录部署到静态托管服务，无需构建。网站使用根路径资源链接，需要部署到域名根目录；如果部署到 GitHub Pages 的项目子路径，需要相应调整资源和导航路径。

`dist/_redirects` 为支持该格式的托管服务提供设置页和关于页的路径回退规则。其他服务器需要将 `/setting` 和 `/about` 回退到 `index.html`。

## 项目结构

```text
dist/
  index.html       页面结构
  style.css        样式与响应式布局
  app.js           搜索、导航与设置逻辑
  data.json        网址分类数据
  icons.json       网站图标
  assets/          搜索图标、标志与横幅
  _redirects       静态托管路由规则
userscripts/
  0x3-default-google.user.js  原站默认 Google 搜索
  0x3-default-bing.user.js    原站默认必应搜索
preview.py         本地预览服务
```

## 来源说明

此项目是对 [0x3.com](https://0x3.com/) 的界面复刻。布局、标志、网址列表、网站图标及横幅参考原站公开资源，交互逻辑独立实现。本项目与原网站独立运行，不接入原站云端同步、广告联盟、统计脚本或在线搜索联想服务。

第三方品牌标志、图标及图片的权利属于各自权利人，本项目不声称拥有这些素材。页面中的品牌与网址名称仅用于导航展示。
