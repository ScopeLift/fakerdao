<template>
  <q-page padding>
    <!-- GET MKR DIALOG -->
    <q-dialog v-model="showMkrDialog">
      <q-card class="q-pa-md">
        <q-card-section>
          <div class="text-h6">
            To Get MKR on Kovan
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <ol>
            <li>
              Click
              <a
                target="_blank"
                class="hyperlink"
                href="https://kovan.etherscan.io/address/0xcbd3e165ce589657fefd2d38ad6b6596a1f734f6#writeContract"
              >here</a>
              to view the <i>Write Contract</i> tab of a Kovan faucet
            </li>
            <li>
              Click <i>Connect to Web3</i> to connect your wallet
            </li>
            <li>
              In the <span class="code">gulp</span> method,
              enter <span class="code">0xAaF64BFCC32d0F15873a02163e7E500671a4ffcD</span>
              for the <span class="code">gem</span> input
              and put in your own address for the <span class="code">addrs</span> input
            </li>
            <li>This page will automatically update to show your MKR balance once received</li>
          </ol>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            v-close-popup
            flat
            label="OK"
            color="primary"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- GET WETH DIALOG -->
    <q-dialog v-model="showWethDialog">
      <q-card class="q-pa-md">
        <q-card-section>
          <div class="text-h6">
            To Get WETH on Kovan
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <ol>
            <li>
              Click
              <a
                class="hyperlink"
                href="https://faucet.kovan.network/"
                target="_blank"
              >here</a>
              to access a Kovan ETH faucet
            </li>
            <li>
              Follow the instructions to connect your GitHub account and receive 1 Kovan Ether
            </li>
            <li>
              Click
              <a
                class="hyperlink"
                href="https://kovan.etherscan.io/address/0xd0a1e359811322d97991e03f863a0c30c2cf029c#writeContract"
                target="_blank"
              >here</a>
              to go to the <i>Write Contract</i> tab of the Kovan WETH contract
            </li>
            <li>
              Click <i>Connect to Web3</i> to connect your wallet
            </li>
            <li>
              Scroll down to the <span class="code">deposit</span> method, enter an amount
              of ETH to deposit, and click <i>Write</i> to complete the transaction. Remember
              to save some ETH to pay for gas later!
            </li>
            <li>This page will automatically update to show your WETH balance once received</li>
          </ol>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            v-close-popup
            flat
            label="OK"
            color="primary"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- MAIN CONTENT -->
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
      <div class="col-auto">
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
            <div>
              You have {{ formattedUserMkrBalance }} MKR to deposit
            </div>
          </q-card-section>
        </q-card>
        <div
          class="hyperlink text-caption need-help q-ml-md "
          @click="showMkrDialog=true"
        >
          Need MKR?
        </div>
      </div>

      <!-- BID -->
      <div class="col-auto">
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
            <div>
              You have {{ formattedUserWethBalance }} WETH to bid on {{ formattedTotalMkrBalance }} MKR
            </div>
          </q-card-section>
        </q-card>
        <div
          class="hyperlink text-caption need-help q-ml-md"
          @click="showWethDialog=true"
        >
          Need WETH?
        </div>
      </div>
      <!-- VOTING -->
      <div class="col-auto">
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
            <div style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">
              Current winner: {{ currentWinner }}
            </div>
          </q-card-section>
        </q-card>
      </div>
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
      showMkrDialog: false,
      showWethDialog: false,
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
      const now = (new Date()).getTime();
      const nextPhase = (date.addToDate(new Date(), { seconds: this.timeToNextPhase })).getTime();
      const secondsRemaining = Math.floor((nextPhase - now) / 1000);

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

<style lang="stylus" scoped>
.code {
  font-family: monospace;
}

.need-help {
  position: relative;
  top: -10px;
}
</style>
