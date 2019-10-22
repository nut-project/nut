<template>
  <div class="nut-microfrontends__palette">
    <div
      :class="[ 'nut-microfrontends__trigger', isShowCommands ? 'is-show-commands' : '' ]"
      @click="toggleCommands"
      ref="trigger"
    >
      <div class="nut-microfrontends__trigger-bg"></div>

      <div v-show="loading" class="nut-microfrontends__trigger-spinner"></div>

      <div
        class="nut-microfrontends__trigger-button"
      >
        <img class="nut-microfrontends__logo" :src="logo" alt="">
      </div>
    </div>

    <ul
      ref="popper"
      v-if="isShowCommands"
      class="nut-microfrontends__commands"
    >
      <li
        v-for="p in palette"
        class="nut-microfrontends__command"
        @click="onClickPalette( p )"
      >{{ p.text }}</li>
    </ul>
  </div>
</template>

<script>
import Popper from 'popper.js'
import logo from './logo.png'

export default {
  props: {
    palette: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      isShowCommands: false,
      logo,
      blocks: [],
      loading: false,
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
    onClickPalette( p ) {
      if ( typeof p.click === 'function' ) {
        p.click( {
          hide: this.hideCommands.bind( this )
        } )
      }
    },

    hideCommands() {
      if ( this.popper ) {
        this.popper.destroy()
        this.popper = null
      }

      this.isShowCommands = false
    },

    toggleCommands() {
      if ( this.isShowCommands ) {
        this.hideCommands()
      } else {
        this.showCommands()
      }
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

    loadingStart() {
      this.loading = true
    },

    loadingEnd() {
      this.loading = false
    },
  }
}
</script>

<style lang="less" scoped>
  .nut-microfrontends {
    &__palette {
      position: fixed;
      right: 40px;
      bottom: 40px;
    }

    &__trigger {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      overflow: hidden;
      box-shadow: 0 0 10px 6px rgba(0,0,0,.1);
      z-index: 9001;

      &.is-show-commands &-button {
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
      border-radius: 50%;
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
      transition: all .3s ease;
    }

    &__trigger-spinner {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #fff;
      background: linear-gradient(to right, #ffffff 10%, rgba(255, 255, 255, 0) 42%);
      animation: microfrontends-trigger-spin .6s infinite linear;
    }

    &__trigger-spinner:before {
      width: 50%;
      height: 50%;
      background: #000;
      border-radius: 100% 0 0 0;
      position: absolute;
      top: 0;
      left: 0;
      content: '';
    }

    &__trigger-spinner:after {
      background: #fff;
      width: 90%;
      height: 90%;
      border-radius: 50%;
      content: '';
      margin: auto;
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
    }

    &__logo {
      width: 100%;
      height: 100%;
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

  @-webkit-keyframes microfrontends-trigger-spin {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
  @keyframes microfrontends-trigger-spin {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
</style>
