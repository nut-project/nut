---
title: 详情
---

import Regular from 'regularjs'

export default Regular.extend( {
  template: `
    <div>
      <a href="#/defaultのpages/home/foo/index">home/foo/{ $router.params.id }</a>
    </div>
  `,
  config() {
    
  },
} )
