<template>
  <article class="homepage">
    <div class="progress_container">
      <div class="progress_container__inner" id="nut-layout-now2-progress"></div>
    </div>

    <div class="header">
      <div class="header__content">
        <div class="title">
          <div>{{ $ctx.app.zh | toUpperCase }}</div>
        </div>
        <div class="sidebar">
          <a
            v-for="item in $ctx.api.sidebar.get()"
            :href="normalizeRoute( item.route )"
            @click="onRoute( $event, item )"
            :class="[ 'sidebar__item', item.active ? 'is_active' : '' ]"
          >
            {{ item.title }}
          </a>
        </div>
      </div>
    </div>

    <section ref="$$mount">
    </section>
  </article>
</template>

<script>
export default {
  props: {
    $ctx: Object
  },

  filters: {
    toUpperCase( value ) {
      return value.toUpperCase()
    },
  },

  methods: {
    normalizeRoute( url ) {
      const config = this.$ctx.app
      const routerMode = ( config && config.router && config.router.mode ) || 'hash'

      if ( routerMode === 'hash' ) {
        return '#' + url
      }

      return url
    },
    onRoute( e, item ) {
      e.preventDefault()

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
.progress_container {
  position: fixed;
  width: 100%;
  height: 2px;
  z-index: 16;

  &__inner {
    width: 100%;
    height: 100%;
  }
}

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
</style>
