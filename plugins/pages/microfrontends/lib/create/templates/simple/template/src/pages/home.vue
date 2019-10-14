<template>
  <div class="content">
    <img class="logo" src="/nut-logo.png" alt="">
    <p>NUT boilerplate</p>
    <button class="button" @click="gotoDemo">Enter</button>
  </div>
</template>

<script>
export default {
  methods: {
    gotoDemo() {
      this.$ctx.api.router.push( {
        page: 'pages/demo',
        query: { id: 1 }
      } )
    }
  }
}
</script>

<style lang="css" scoped>
  .content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%,-50%,0);
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .logo {
    height: 100px;
    width: auto;
  }

  .button {
    padding: 0 20px;
    height: 46px;
    line-height: 46px;
    cursor: pointer;
    min-width: 190px;
    text-align: center;
    border-radius: 4px;
    text-decoration: none;
    background-color: #fff;
    color: #000;
    border: 1px solid #000;
  }
</style>
