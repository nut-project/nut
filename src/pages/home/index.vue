<template>
  <div :class="$style.x">
    vue test
  </div>
</template>

<script type="text/javascript">
  export default {
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
  }
</script>

<style module lang="scss">
  $blue: #1875e7;

  .x {
    color : $blue;
  }
</style>
