<template>
  <q-page padding>
    <h1 class="text-center">
      Bid
    </h1>

    <the-connect-wallet />
  </q-page>
</template>

<script>
import TheConnectWallet from 'components/TheConnectWallet.vue';

export default {
  name: 'BidPage',

  components: {
    TheConnectWallet,
  },
};
</script>
