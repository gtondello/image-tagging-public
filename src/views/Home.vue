<template>
  <div class="home">
  </div>
</template>

<script>
export default {
  name: 'home',
  created() {
    this.$router.push({ name: 'ImageTagging' })
  }
}
</script>
