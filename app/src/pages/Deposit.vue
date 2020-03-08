<template>
  <q-page padding>
    <div class="text-center">
      <h1>Deposit</h1>
      <h6>Avaialble Balance: {{ formattedUserMkrBalance }} MKR</h6>
    </div>

    <div style="max-width:400px; margin: 0 auto;">
      <!-- IF USER NEEDS TO APPROVE MAKER -->
      <div
        v-if="!hasMakerAllowance"
        class="row justify-center"
      >
        <div class="col-xs-12 text-center q-mb-xl">
          Before depositing, you'll need to approve the Faker contract
          to spend your MKR. Click the button below to send this transaction.
        </div>
        <div class="col-xs-12 text-center text-italic text-caption">
          This page will automatically update when the transactionis complete.
        </div>

        <q-btn
          color="primary"
          label="Approve!"
          style="margin: 0 auto;"
          @click="approveFakerToSpendMaker()"
        />
      </div>

      <!-- DEPOSIT FUNCTIONALITY -->
      <div
        v-else
        class="text-center"
      >
        <div>
          Enter the amount of MKR to deposit
        </div>
        <div class="col-xs-12 row justify-center">
          <q-btn
            color="primary"
            flat
            label="25%"
            @click="setMakerAmount(0.25)"
          />
          <q-btn
            color="primary"
            flat
            label="50%"
            @click="setMakerAmount(0.50)"
          />
          <q-btn
            color="primary"
            flat
            label="75%"
            @click="setMakerAmount(0.75)"
          />
          <q-btn
            color="primary"
            flat
            label="100%"
            @click="setMakerAmount(1)"
          />
        </div>
        <q-input
          v-model.number="mkrDepositAmount"
          class="q-py-lg"
          filled
          label="MKR Amount"
          style="max-width:200px; margin: 0 auto;"
          :rules="[ val => isValidAmount(val)
            || `Enter a value between 0 and ${parseFloat(formattedUserMkrBalance).toPrecision(4)}`]"
        />
        <q-btn
          class="q-mt-md"
          color="primary"
          label="Deposit!"
          style="min-width: 150px;"
          @click="deposit()"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import { ethers } from 'ethers';

export default {
  name: 'DepositPage',

  data() {
    return {
      mkrDepositAmount: undefined,
    };
  },

  computed: {
    ...mapState({
      mkrAllowance: (state) => state.auth.data.mkrAllowance,
      userMkrBalance: (state) => state.auth.data.userMkrBalance,
      fakerContract: (state) => state.constants.contracts.fakerContract,
      makerContract: (state) => state.constants.contracts.makerContract,
    }),

    hasMakerAllowance() {
      return this.mkrAllowance.gt(ethers.constants.Zero);
    },

    formattedUserMkrBalance() {
      if (this.userMkrBalance === undefined) return '-';
      return ethers.utils.formatEther(this.userMkrBalance);
    },
  },

  methods: {
    async approveFakerToSpendMaker() {
      await this.makerContract.approve(this.fakerContract.address, ethers.constants.MaxUint256);
    },

    isValidAmount(amount) {
      return amount > 0 && amount <= parseFloat(this.formattedUserMkrBalance);
    },

    setMakerAmount(fraction) {
      this.mkrDepositAmount = parseFloat(this.formattedUserMkrBalance) * fraction;
    },

    async deposit() {
      const amount = ethers.utils.parseEther(String(this.mkrDepositAmount));
      await this.fakerContract.deposit(amount);
    },
  },
};
</script>
