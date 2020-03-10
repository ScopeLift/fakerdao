<template>
  <q-page padding>
    <div class="text-center">
      <div class="text-h1">
        Bid
      </div>
      <div
        v-if="!isAuction"
        class="text-h6 q-my-md"
      >
        Bidding will open up during the next auction phase
      </div>
      <div>
        <span class="text-bold">Available WETH for Bidding:</span> {{ formattedUserWethBalance }} WETH
      </div>
      <div>
        <span class="text-bold">Available MKR to Bid On:</span> {{ formattedTotalMkrBalance }} MKR
      </div>

      <hr class="q-my-xl">

      <div style="max-width:400px; margin: 0 auto;">
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
        <div
          v-else
          class="text-center"
        >
          <div>
            Enter the amount of WETH to bid
          </div>
          <div class="col-xs-12 row justify-center">
            <q-btn
              color="primary"
              flat
              label="25%"
              @click="setWethAmount(0.25)"
            />
            <q-btn
              color="primary"
              flat
              label="50%"
              @click="setWethAmount(0.50)"
            />
            <q-btn
              color="primary"
              flat
              label="75%"
              @click="setWethAmount(0.75)"
            />
            <q-btn
              color="primary"
              flat
              label="100%"
              @click="setWethAmount(1)"
            />
          </div>
          <q-input
            v-model.number="wethBidAmount"
            class="q-py-lg"
            filled
            label="WETH Amount"
            style="max-width:200px; margin: 0 auto;"
            :rules="[ val => isValidAmount(val)
              || `Enter a value between 0 and ${parseFloat(formattedUserWethBalance).toPrecision(4)}`]"
          />
          <q-btn
            :disabled="!isAuction"
            class="q-mt-md"
            color="primary"
            label="Bid!"
            style="min-width: 150px;"
            @click="bid()"
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
  name: 'BidPage',

  data() {
    return {
      isLoading: false,
      wethBidAmount: undefined,
    };
  },

  computed: {
    ...mapState({
      wethAllowance: (state) => state.auth.data.wethAllowance,
      userWethBalance: (state) => state.auth.data.userWethBalance,
      totalMaker: (state) => state.auth.faker.totalMaker,
      isAuction: (state) => state.auth.faker.isAuction,
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

    isValidAmount(amount) {
      return amount > 0 && amount <= parseFloat(this.formattedUserWethBalance);
    },

    setWethAmount(fraction) {
      this.wethBidAmount = parseFloat(this.formattedUserWethBalance) * fraction;
    },

    async bid() {
      const amount = ethers.utils.parseEther(String(this.wethBidAmount));
      console.log('amount: ', amount);
      await this.fakerContract.submitBid(amount);
    },
  },

};
</script>
