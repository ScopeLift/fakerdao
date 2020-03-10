<template>
  <q-page padding>
    <div class="text-center">
      <h1>Bid</h1>
      <h6 style="margin-top: -3em;">
        Available WETH for Bidding: {{ formattedUserWethBalance }} WETH
      </h6>
      <h6 style="margin-top: -2em;">
        Available MKR to Bid On: {{ formattedTotalMkrBalance }} MKR
      </h6>

      <!-- IF USER NEEDS TO APPROVE WETH -->
      <div
        v-if="!hasWethAllowance"
        class="row justify-center"
      >
        <div class="col-xs-12 text-center">
          Before depositing, you'll need to approve the Faker contract
          to spend your WETH. Click the button below to send this transaction.
        </div>

        <div class="q-my-xl">
          <q-btn
            color="primary"
            label="Approve!"
            style="margin: 0 auto;"
            :loading="isLoading"
            @click="approveFakerToSpendWeth()"
          />
        </div>
        <div class="col-xs-12 text-center text-italic text-caption">
          This page will automatically update when the transaction is complete.
        </div>
      </div>

      <!-- OTHERWISE SHOW BID PAGE -->
      <div v-else>
        bid now!!!
      </div>
    </div>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import { ethers } from 'ethers';

export default {
  name: 'BidPage',

  data() {
    return {
      isLoading: false,
    };
  },

  computed: {
    ...mapState({
      wethAllowance: (state) => state.auth.data.wethAllowance,
      userWethBalance: (state) => state.auth.data.userWethBalance,
      totalMaker: (state) => state.auth.faker.totalMaker,
      fakerContract: (state) => state.constants.contracts.fakerContract,
      wethContract: (state) => state.constants.contracts.wethContract,
    }),

    hasWethAllowance() {
      return this.wethAllowance.gt(ethers.constants.Zero);
    },

    formattedUserWethBalance() {
      if (this.userWethBalance === undefined) return '-';
      return ethers.utils.formatEther(this.userWethBalance);
    },

    formattedTotalMkrBalance() {
      if (this.totalMaker === undefined) return '-';
      return ethers.utils.formatEther(this.totalMaker);
    },
  },

  methods: {
    async approveFakerToSpendWeth() {
      this.isLoading = true;
      await this.wethContract.approve(this.fakerContract.address, ethers.constants.MaxUint256);
      this.isLoading = false;
    },
  },

};
</script>
