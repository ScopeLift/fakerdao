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
        <span class="text-bold">Date Next Phase Stars:</span> {{ dateNextPhaseStarts }}
      </div>

      <div class="col-auto q-mx-md q-my-xs">
        <span class="text-bold">Time Until Next Phase:</span> {{ timeUntilNextPhase }}
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
            Got MKR you're not using for voting? Auction its voting power and make some money
          </div>
        </q-card-section>
        <q-separator
          inset
          color="primary"
        />
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
        <q-separator
          inset
          color="primary"
        />
        <q-card-section>
          You have {{ formattedUserWethBalance }} WETH to bid on {{ formattedTotalMkrBalance }} MKR
        </q-card-section>
      </q-card>

      <!-- VOTING -->
      <q-card
        bordered
        class="col-auto card-border q-ma-md"
        style="max-width: 400px"
        @click="navigateToPage('vote')"
      >
        <q-card-section>
          <div class="text-h6">
            Vote with MKR
          </div>
          <div class="text-subtitle2">
            When you're the winning bidder, you can click here to choose a slate to vote on
          </div>
        </q-card-section>
        <q-separator
          inset
          color="primary"
        />
        <q-card-section>
          The current winning bidder is {{ currentWinner }}
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import { ethers } from 'ethers';
import { date } from 'quasar';

export default {
  name: 'HomePage',

  data() {
    return {
      now: undefined,
    };
  },

  computed: {
    ...mapState({
      userMkrBalance: (state) => state.auth.data.userMkrBalance,
      userWethBalance: (state) => state.auth.data.userWethBalance,
      isShift: (state) => state.auth.faker.isShift,
      isAuction: (state) => state.auth.faker.isAuction,
      totalMaker: (state) => state.auth.faker.totalMaker,
      currentWinner: (state) => state.auth.faker.currentWinner,
      leadingBidder: (state) => state.auth.faker.leadingBidder,
      currentPhase: (state) => state.auth.faker.currentPhase,
      currentPeriod: (state) => state.auth.faker.currentPeriod,
      nextPhase: (state) => state.auth.faker.nextPhase,
      deploymentTime: (state) => parseFloat(state.auth.faker.deploymentTime.toString()),
      periodLength: (state) => parseFloat(state.auth.faker.periodLength.toString()),
      phaseLength: (state) => parseFloat(state.auth.faker.periodLength.toString()),
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

    timeToNextPhase() {
      if (this.isShift) {
        return this.timeToPeriodOffset(1);
      }

      if (this.isAuction) {
        return this.timeToPeriodOffset(1);
      }

      const currentPeriod = parseInt(this.currentPeriod, 10);
      const periodsToNextPhase = this.phaseLength - (currentPeriod % this.phaseLength);

      return this.timeToPeriodOffset(periodsToNextPhase);
    },

    dateNextPhaseStarts() {
      const today = new Date();
      const theDate = date.addToDate(today, { seconds: this.timeToNextPhase });
      return date.formatDate(theDate, 'YYYY-MM-DD HH:mm');
    },

    timeUntilNextPhase() {
      const secondsRemaining = date.getDateDiff(this.dateNextPhaseStarts, new Date(), 'seconds');
      const hours = Math.floor(secondsRemaining / 3600);
      const secondsLeft = secondsRemaining % 3600;
      const minutes = Math.floor(secondsLeft / 60);
      // const seconds = secondsLeft % 60;
      return `${hours} hours ${minutes} minutes`;
    },
  },

  created() {
    // eslint-disable-next-line
    setInterval(() => this.now = new Date(), 10000);
  },

  methods: {
    navigateToPage(name) {
      this.$router.push({ name });
    },

    timeToPeriodOffset(periodOffset) {
      const periodLength = parseInt(this.periodLength, 10);
      const deploymentTime = parseInt(this.deploymentTime, 10);
      const currentPeriod = parseInt(this.currentPeriod, 10);
      const nextPeriodTime = deploymentTime + (currentPeriod + periodOffset) * periodLength;
      const secondsToNextPeriod = nextPeriodTime - (Date.now() / 1000); // assumes local clock is correct
      return secondsToNextPeriod;
    },
  },
};
</script>
