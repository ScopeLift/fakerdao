<template>
  <q-page padding>
    <h1 class="text-center">
      FakerDAO
    </h1>

    <div class="row justify-center">
      <!-- DEPOSIT -->
      <q-card
        bordered
        class="col-auto card-border q-mr-md"
        style="max-width: 400px"
        @click="navigateToPage('deposit')"
      >
        <q-card-section>
          <div class="text-h6">
            Deposit MKR
          </div>
          <div class="text-subtitle2">
            Got MKR you're not using? Auction it off and make some money
          </div>
        </q-card-section>
        <q-separator inset />
        <q-card-section>
          You have {{ userMkrBalance }} MKR to deposit
        </q-card-section>
      </q-card>

      <!-- BID -->
      <q-card
        bordered
        class="col-auto card-border q-ml-md"
        style="max-width: 400px"
        @click="navigateToPage('bid')"
      >
        <q-card-section>
          <div class="text-h6">
            Bid on MKR
          </div>
          <div class="text-subtitle2">
            If you're the highest bidder, you have full control of the MKR for one week
          </div>
        </q-card-section>
        <q-separator inset />
        <q-card-section>
          {{ contractMkrBalance }} MKR available for voting
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'HomePage',

  computed: {
    ...mapState({
      userMkrBalance: (state) => state.auth.data.userMkrBalance,
      contractMkrBalance: (state) => state.auth.data.contractMkrBalance,
    }),
  },

  methods: {
    navigateToPage(name) {
      this.$router.push({ name });
    },
  },
};
</script>
