import Vue from 'vue'
import * as Files from '@zeit-ui/vue/lib/files.common'
import * as Link from '@zeit-ui/vue/lib/link.common'
import * as Card from '@zeit-ui/vue/lib/card.common'
import * as Note from '@zeit-ui/vue/lib/note.common'
import * as Fieldset from '@zeit-ui/vue/lib/fieldset.common'
import * as Button from '@zeit-ui/vue/lib/button.common'
import * as Switcher from '@zeit-ui/vue/lib/switcher.common'
import '@zeit-ui/vue/lib/files.css'
import '@zeit-ui/vue/lib/link.css'
import '@zeit-ui/vue/lib/card.css'
import '@zeit-ui/vue/lib/note.css'
import '@zeit-ui/vue/lib/fieldset.css'
import '@zeit-ui/vue/lib/button.css'
import '@zeit-ui/vue/lib/switcher.css'
import '@/css/index.less'

export default ( { api } ) => {
  Files.install( Vue )
  Link.install( Vue )
  Card.install( Vue )
  Note.install( Vue )
  Fieldset.install( Vue )
  Button.install( Vue )
  Switcher.install( Vue )

  api.sidebar.configure( [
    {
      icon: '',
      title: '指南',
      children: [
        {
          title: 'Get Started',
          children: [
            { title: '介绍', path: 'pages/guide/introduction' },
            { title: '安装', path: 'pages/guide/installation' },
            { title: '体验', path: 'pages/guide/experience' },
          ],
        },
        {
          title: 'Concepts',
          children: [
            { title: '微前端', path: 'pages/guide/microfrontends' },
            { title: '插件', path: 'pages/guide/plugin' },
            { title: '布局', path: 'pages/guide/layout' },
            // { title: '主题', path: 'pages/guide/theme' },
          ]
        },
        {
          title: 'Features',
          children: [
            { title: 'CSS 预处理器', path: 'pages/guide/css-preprocessor' },
            { title: 'CSS Modules', path: 'pages/guide/css-modules' },
            { title: 'Markdown', path: 'pages/guide/markdown' },
            { title: 'QuickLink', path: 'pages/guide/quicklink' },
            { title: '静态资源', path: 'pages/guide/public' },
            { title: '内置图标', path: 'pages/guide/icon' },
          ]
        }
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

  api.page( 'pages/home' ).set( 'layout', 'now-custom' )
}
