<template>
  <q-page padding>
    <div class="text-center">
      <h2>
        Vote
      </h2>
      <div class="text-h6 q-my-md">
        Voting is live for the current winning bidder!
      </div>
      <div>
        The current winning bidder is {{ currentWinner }}
      </div>
      <div class="q-my-lg">
        <span class="text-bold">Available MKR for Voting:</span> {{ formattedTotalMkrBalance }} MKR
      </div>
      <div
        class="text-caption text-italic"
        style="max-width: 550px; margin: 0 auto;"
      >
        Note: The amount of MKR you have control over is only constant for the first
        5 days of the voting period. Afterwards, users can deposit and withdraw MKR so
        the amount may change.
      </div>

      <hr class="q-my-xl">

      <div class="row justify-center">
        <!-- Vote By Slate -->
        <div
          class="col-auto q-mx-md q-my-xl"
          style="max-width: 300px"
        >
          <div class="text-h6">
            Vote By Slate
          </div>
          <div>
            Enter the Slate ID that you'd like to vote on
            <br><br>
          </div>
          <q-input
            v-model="voteSlate"
            class="q-py-lg"
            filled
            label="Enter Slate ID"
            style="max-width:200px; margin: 0 auto;"
          />
          <q-btn
            color="primary"
            label="Vote by Slate!"
            style="margin: 0 auto;"
            :loading="isLoading"
            :disabled="!canUserVote"
            @click="voteBySlate()"
          />
        </div>
        <!-- Vote By Addresses -->
        <div
          class="col-auto q-mx-md q-my-xl"
          style="max-width: 300px"
        >
          <div class="text-h6">
            Vote By Addresses
          </div>
          <div>Enter a comma separated list of addresses that you'd like to vote on</div>
          <q-input
            v-model="voteAddresses"
            class="q-py-lg"
            filled
            label="Enter Addresses"
            style="max-width:200px; margin: 0 auto;"
          />
          <q-btn
            color="primary"
            label="Vote by Addresses!"
            style="margin: 0 auto;"
            :loading="isLoading"
            :disabled="!canUserVote"
            @click="voteByAddresses()"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import { ethers } from 'ethers';

export default {
  name: 'VotePage',

  data() {
    return {
      isLoading: false,
      voteAddresses: undefined,
      voteSlate: undefined,
    };
  },

  computed: {
    ...mapState({
      totalMaker: (state) => state.auth.faker.totalMaker,
      currentWinner: (state) => state.auth.faker.currentWinner,
      userAddress: (state) => state.auth.userAddress,
    }),

    formattedTotalMkrBalance() {
      if (this.totalMaker === undefined) return '-';
      return ethers.utils.formatEther(this.totalMaker);
    },

    canUserVote() {
      return this.currentWinner === this.userAddress;
    },
  },

  methods: {

    async voteBySlate() {
      this.isLoading = true;
      this.isLoading = false;
    },

    async voteByAddresses() {
      this.isLoading = true;
      this.isLoading = false;
    },
  },

};
</script>
