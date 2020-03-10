<template>
  <q-page padding>
    <h1 class="text-center">
      FakerDAO
    </h1>
    <div
      class="row justify-center"
      style="max-width: 400px; margin: 0 auto; margin-top: -3em;"
    >
      <div class="col-auto q-mx-md q-my-xs">
        <span class="text-bold">Current Phase:</span> {{ currentPhase }}
      </div>
      <div class="col-auto q-mx-md q-my-xs">
        <span class="text-bold">Next Phase:</span> {{ nextPhase }}
      </div>

      <div class="col-auto q-mx-md q-my-xs">
        <span class="text-bold">Time Until Next Phase:</span> {{ timeRemaining }} TODO
      </div>
    </div>

    <div class="row justify-center q-mt-lg">
      <!-- DEPOSIT -->
      <q-card
        bordered
        class="col-auto card-border q-ma-md"
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
          You have {{ formattedUserMkrBalance }} MKR to deposit
        </q-card-section>
      </q-card>

      <!-- BID -->
      <q-card
        bordered
        class="col-auto card-border q-ma-md"
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
          You have {{ formattedUserWethBalance }} WETH to bid on {{ formattedTotalMkrBalance }} MKR
        </q-card-section>
      </q-card>

      <!-- BID -->
      <q-card
        bordered
        class="col-auto card-border q-ma-md"
        style="max-width: 400px"
        @click="navigateToPage('bid')"
      >
        <q-card-section>
          <div class="text-h6">
            Vote with MKR
          </div>
          <div class="text-subtitle2">
            When you're the winning bidder, you can click here to choose a slate to vote on
          </div>
        </q-card-section>
        <q-separator inset />
        <q-card-section>
          The current winning bidder is {{ winningBidder }}
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import { ethers } from 'ethers';

export default {
  name: 'HomePage',

  computed: {
    ...mapState({
      userMkrBalance: (state) => state.auth.data.userMkrBalance,
      userWethBalance: (state) => state.auth.data.userWethBalance,
      totalMaker: (state) => state.auth.faker.totalMaker,
      winningBidder: (state) => state.auth.faker.winningBidder,
      leadingBidder: (state) => state.auth.faker.leadingBidder,
      currentPhase: (state) => state.auth.faker.currentPhase,
      nextPhase: (state) => state.auth.faker.nextPhase,
      deploymentTime: (state) => parseFloat(state.auth.faker.deploymentTime.toString()),
      periodLength: (state) => parseFloat(state.auth.faker.periodLength.toString()),
    }),

    formattedUserMkrBalance() {
      if (this.userMkrBalance === undefined) return '-';
      return ethers.utils.formatEther(this.userMkrBalance);
    },

    formattedUserWethBalance() {
      if (this.userWethBalance === undefined) return '-';
      return ethers.utils.formatEther(this.userWethBalance);
    },

    formattedTotalMkrBalance() {
      if (this.totalMaker === undefined) return '-';
      return ethers.utils.formatEther(this.totalMaker);
    },

    timeRemaining() {
      // Get current period
      const now = (new Date()).getTime() / 1000;
      const currentPeriod = Math.floor((now - this.deploymentTime) / this.periodLength);
      return currentPeriod;
    },
  },

  methods: {
    navigateToPage(name) {
      this.$router.push({ name });
    },
  },
};
</script>
