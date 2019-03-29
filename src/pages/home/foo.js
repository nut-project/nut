---
title: 列表
---

import Regular from 'regularjs'

export default Regular.extend( {
  template: `
    列表页 { count }
  `,

  config() {
    this.data.count = 0
  },

  init() {
    setInterval( () => {
      this.data.count = this.data.count + 1
      this.$update()
    }, 1000 )
  }
} )
