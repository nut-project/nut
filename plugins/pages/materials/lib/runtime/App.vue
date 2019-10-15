<template>
  <div>
    <div
      :class="[ 'nut-materials__trigger', isShow ? 'is-show-panels' : '' ]"
      @click="showCommands"
      ref="trigger"
    >
      <div class="nut-materials__trigger-bg"></div>
      <div
        class="nut-materials__trigger-button"
      >
        <img class="nut-materials__logo" :src="logo" alt="">
      </div>
    </div>

    <ul
      ref="popper"
      v-if="isShowCommands"
      class="nut-materials__commands"
    >
      <li class="nut-materials__command">应用信息</li>
      <li class="nut-materials__command">物料市场</li>
    </ul>

    <div :class="[ 'nut-materials__panels', isShow ? 'is-show-panels' : '' ]">
      <img class="nut-materials__screenshot" v-for="block in blocks" :src="block.screenshot" alt="">
    </div>
  </div>
</template>

<script>
import Popper from 'popper.js'
import logo from './logo.png'

export default {
  props: {
    blocks: {
      type: Array,
      default() {
        return []
      }
    },
  },
  data() {
    return {
      isShow: false,
      isShowCommands: false,
      logo,
    }
  },
  mounted() {
    this.onGlobalClick = e => {
      const $trigger = this.$refs.trigger
      const $popper = this.$refs.popper

      if ( !$trigger || !$popper ) {
        return
      }

      const isClickOutside = !$trigger.contains( e.target ) && !$popper.contains( e.target )
      if ( isClickOutside ) {
        this.hideCommands()
      }
    }

    document.addEventListener( 'click', this.onGlobalClick, false )
  },
  beforeDestroy() {
    document.removeEventListener( 'click', this.onGlobalClick, false )
  },
  methods: {
    hideCommands() {
      if ( this.popper ) {
        this.popper.destroy()
        this.popper = null
      }

      this.isShowCommands = false
    },

    showCommands() {
      if ( this.isShowCommands ) {
        return
      }

      this.isShowCommands = true

      this.$nextTick( () => {
        this.popper = new Popper( this.$refs.trigger, this.$refs.popper, {
          placement: 'top-end',
          modifiers: {
            offset: { offset: '0,10px' },
          }
        } )
      } )
    },

    toggle() {
      this.isShow = !this.isShow

      const offsetClass = 'nut-materials--offset'
      const transitionClass = 'nut-materials--transition'
      const $app = document.getElementById( 'app' )

      if ( this.isShow ) {
        $app.classList.add( transitionClass )
        $app.classList.add( offsetClass )
      } else {
        $app.classList.remove( offsetClass )
      }
    }
  }
}
</script>

<style lang="less">
  @import './var.less';

  .nut-materials {
    &--transition {
      transition: transform .3s ease;
    }

    &--offset {
      transform: translate3d(-@panel-width,0,0);
    }
  }
</style>

<style lang="less" scoped>
  @import './var.less';

  .nut-materials {
    &__trigger {
      position: fixed;
      right: 40px;
      bottom: 40px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      overflow: hidden;
      box-shadow: 0 0 10px 6px rgba(0,0,0,.1);
      z-index: 9001;
      transition: transform .3s ease;

      &.is-show-panels {
        transform: translate3d(-@panel-width,0,0);
      }

      &.is-show-panels &-button {
        border: solid 3px #fff;
        mix-blend-mode: initial;
      }
    }

    &__trigger-bg {
      position: absolute;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: #fff;
    }

    &__trigger-button {
      position: absolute;
      width: 100%;
      height: 100%;
      border: solid 3px #fff;
      background-color: #f2f2f2;
      color: #fff;
      padding: 10px;
      border-radius: 50%;
      box-sizing: border-box;
      opacity: .9;
      cursor: pointer;
      mix-blend-mode: difference;
    }

    &__logo {
      width: 100%;
      height: 100%;
    }

    &__panels {
      position: fixed;
      right: 0;
      top: 0;
      bottom: 0;
      width: @panel-width;
      border-left: solid 1px #f2f2f2;
      background-color: #fff;
      z-index: 9000;
      transform: translate3d(100%,0,0);
      transition: transform .3s ease;
      overflow-y: auto;

      &.is-show-panels {
        transform: translate3d(0,0,0);
      }
    }

    &__screenshot {
      width: 80%;
    }

    &__commands {
      list-style: none;
      padding: 10px 0;
      margin: 0;
      background-color: #fff;
      cursor: pointer;
      width: 150px;
      font-size: 14px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    &__command {
      padding: 8px 20px;
      color: #999;
      background-color: #fff;

      &:hover {
        color: #000;
        background-color: #fafafa;
      }
    }
  }
</style>
