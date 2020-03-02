<template>
  <q-page padding>
    <h1 class="text-center">
      Deposit
    </h1>

    <the-connect-wallet />
  </q-page>
</template>

<script>
import TheConnectWallet from 'components/TheConnectWallet.vue';

export default {
  name: 'DepositPage',

  components: {
    TheConnectWallet,
  },
};
</script>
