<template>
  <span style="color: blue;" @click="onClick">{{ text }}</span>
</template>

<script>
export default {
  props: {
    text: String,
  },
  methods: {
    onClick() {
      alert( 'clicked' )
    }
  }
}
</script>

<style lang="css">

</style>
