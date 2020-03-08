<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="q-mx-md q-mt-md" style="color: #000000; background-color: rgba(0,0,0,0)">
      <div class="float-right text-caption">Your account: {{ publicAddress }}</div>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'BaseLayout',

  computed: {
    ...mapState({
      publicAddress: (state) => state.auth.provider.selectedAddress,
    }),
  },
};
</script>
