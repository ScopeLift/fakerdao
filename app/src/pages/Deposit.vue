<template>
  <q-page padding>
    <h1 class="text-center">
      Deposit
    </h1>

    <div v-if="!hasMakerAllowance" class="row justify-center">
      <div class="col-xs-12 text-center q-mb-xl">
        Before depositing, you'll need to approve the Faker contract
        to spend your MKR. Click the button below to send this transaction.
      </div>

      <q-btn
        color="primary"
        label="Approve!"
        style="margin: 0 auto;"
        @click="approveFakerToSpendMaker()"
      />
    </div>

    <div v-else>
      Enter deposit amount
    </div>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import { ethers } from 'ethers';

export default {
  name: 'DepositPage',

  computed: {
    ...mapState({
      mkrAllowance: (state) => state.auth.data.mkrAllowance,
      fakerContract: (state) => state.constants.contracts.fakerContract,
      makerContract: (state) => state.constants.contracts.makerContract,
    }),

    hasMakerAllowance() {
      return this.mkrAllowance.gt(ethers.constants.Zero);
    },
  },

  methods: {
    async approveFakerToSpendMaker() {
      console.log('asdfasdf');
      await this.makerContract.approve(this.fakerContract.address, ethers.constants.MaxUint256);
    },
  },
};
</script>
