<template>
  <section class="content">
    <img width="750px" height="375px" src="/social-media-preview-750.png" alt="social media preview" />

    <div class="buttons">
      <a href="javascript:;" @click="onRoute( { route: 'pages/guide/introduction' } )" class="button" style="margin-right: 15px;">🏇Get Started</a>

      <a target="_blank" href="https://github.com/nut-project/nut" class="button is-primary">
        <i style="margin-right: 5px;font-size: 15px;" class="nut-icons nut-icon-github-fill"></i>
        GitHub
      </a>
    </div>
  </section>
</template>

<script>
  export default {
    filters: {
      toUpperCase( value ) {
        return value.toUpperCase()
      }
    },

    created() {
      this.$ctx.api.quicklink.prefetch( [
        'pages/guide/introduction',
        'pages/docs/config'
      ] )
    },

    methods: {
      onRoute( item ) {
        if ( item.route ) {
          this.$ctx.api.router.push( item.route )
          return
        }
        if ( item.link ) {
          window.open( item.link )
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  .content {
    padding-top: 100px;
    display: flex;
    align-items: center;
    flex-direction: column;
  }

  .buttons {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .button {
    padding: 0 20px;
    border: solid 1px #000;
    height: 46px;
    line-height: 46px;
    cursor: pointer;
    min-width: 190px;
    text-align: center;
    border-radius: 4px;
    text-decoration: none;
    background-color: #fff;
    color: #000;
    border: solid 1px #000;

    &.is-primary {
      background-color: #000;
      color: #fff;
      border: solid 1px #000;
    }
  }
</style>
