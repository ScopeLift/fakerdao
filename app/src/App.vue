<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',

  created() {
    // Every few seconds, check blockchain for updates
    this.$store.dispatch('auth/pollBlockchain');
    setInterval(() => {
      this.$store.dispatch('auth/pollBlockchain');
    }, 7000);
  },
};
</script>
