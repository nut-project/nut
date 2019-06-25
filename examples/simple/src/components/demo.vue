<template>
  <button :class="[ 'demo', square ? 'is-square' : '' ]" @click="onClick">hello</button>
</template>

<script>
export default {
  props: {
    square: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    onClick() {
      console.log( 'clicked' )
    }
  }
}
</script>

<style lang="scss" scoped>
  .demo {
    outline: none;
    border: none;
    border-radius: 40px;
    padding: 0 32px;
    height: 32px;
    white-space: nowrap;
    word-break: break-all;
    color: #fff;
    cursor: pointer;
    background-image: linear-gradient(-90deg, #FF0000 0%, #FF3164 100%);

    &.is-square {
      border-radius: 0;
    }
  }
</style>
