<template>
  <div :class="$style.x">
    vue test
  </div>
</template>

<script type="text/javascript">
  export default {
    // 非核心属性，解耦，改用接口的方式
    // attributes: {
    //   layout: 'now',
    // },

    beforeEnter( ctx ) {
      setTimeout( () => {
        ctx.next( function ( vm ) {
          console.log( 'beforeEnter vm', vm )
        } )
      }, 2000 )
    },

    enter() {
      console.log( 'enter vm', this )
    },

    created() {
      console.log( this.$ctx )
    }
  }
</script>

<style module lang="scss">
  $blue: #1875e7;

  .x {
    color : $blue;
  }
</style>
