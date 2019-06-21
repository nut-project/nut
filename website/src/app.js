import '@/css/index.less'
import Files from '@zeit-ui/vue/packages/files'
import Link from '@zeit-ui/vue/packages/link'
import Card from '@zeit-ui/vue/packages/card'
import Vue from 'vue'

export default ( { api } ) => {
  Files.install( Vue )
  Link.install( Vue )
  Card.install( Vue )

  api.sidebar.configure( [
    {
      icon: '',
      title: '指南',
      children: [
        { title: '介绍', path: 'pages/guide/introduction' },
        { title: '安装', path: 'pages/guide/installation' },
        { title: '体验', path: 'pages/guide/experience' },
        // { title: '如何开始', path: 'pages/guide/get-started' },
        { title: '静态资源', path: 'pages/guide/public' },
        { title: 'CSS 预处理器', path: 'pages/guide/css-preprocessor' },
        { title: 'CSS Modules', path: 'pages/guide/css-modules' },
        { title: 'Markdown', path: 'pages/guide/markdown' },
        { title: '布局', path: 'pages/guide/layout' },
        { title: '主题', path: 'pages/guide/theme' },
        { title: '图标', path: 'pages/guide/icon' },
        { title: '插件', path: 'pages/guide/plugin' },
        { title: '微前端', path: 'pages/guide/microfrontends' },
      ]
    },

    {
      icon: '',
      title: '文档',
      children: [
        { title: 'Config', path: 'pages/docs/config' },
        { title: 'CLI', path: 'pages/docs/cli' },
        { title: 'API', path: 'pages/docs/api' },
      ]
    },

    {
      icon: '',
      title: 'GitHub',
      link: 'https://github.com/fengzilong/nut'
    },
  ] )

  api.page( 'pages/home' ).set( 'layout', 'none' )
}
