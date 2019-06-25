<template>
  <article class="homepage">
    <div class="header">
      <div class="header__content">
        <div class="title">
          <div>{{ $ctx.app.zh | toUpperCase }}</div>
        </div>
        <div class="${ styles.sidebar }">
          <a
            v-for="item in $ctx.api.sidebar.get()"
            href="javascript:;"
            @click="onRoute( item )"
            :class="[ 'sidebar__item', item.active ? 'is_active' : '' ]"
          >
            {{ item.title }}
          </a>
        </div>
      </div>
    </div>

    <section class="content">
      <img width="750px" height="375px" src="/social-media-preview-750.png" alt="social media preview">

      <div class="buttons">
        <a
          href="javascript:;"
          @click="onRoute( { route: 'pages/guide/introduction' } )"
          class="button"
          style="margin-right: 15px;"
        >🏇Get Started</a>

        <a
          target="_blank"
          href="https://github.com/nut-project/nut"
          class="button is-primary"
        >
          <i style="margin-right: 5px;font-size: 15px;" class="nut-icons nut-icon-github-fill"></i>
          GitHub
        </a>
      </div>
    </section>
  </article>
</template>

<script>
export default {
  filters: {
    toUpperCase( value ) {
      return value.toUpperCase()
    },
  },

  created() {
    this.$ctx.api.quicklink.prefetch( [
      'pages/guide/introduction',
      'pages/docs/config',
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
  },
}
</script>

<style lang="less" scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  background-color: #fff;
  border-bottom: solid 1px #eaeaea;
  padding: 0 20px;
  font-size: 14px;
  height: 60px;
  z-index: 1;
  font-size: 14px;

  &__content {
    max-width: 1024px;
    height: 100%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.title {
  font-weight: bold;
  display: flex;
  align-items: center;
  font-size: 14px;
  cursor: pointer;
}

.logo {
  max-height: 36px;
  margin-right: 10px;
}

.sidebar {
  font-size: 14px;

  &__item {
    display: inline-block;
    color: #666;
    text-decoration: none;
    padding: 0 6px;
    text-decoration: none;
    cursor: pointer;

    &.is_active {
      color: #000;
    }

    &:hover {
      color: #000;
    }
  }
}

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
