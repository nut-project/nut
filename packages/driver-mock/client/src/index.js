import Vue from 'vue'
import ElementUI from 'element-ui'
import App from './App.vue'

Vue.use( ElementUI )

/* eslint-disable no-new */
new Vue( {
  el: '#app',
  // router,
  // store,
  components: { App },
  template: '<App/>'
} )
