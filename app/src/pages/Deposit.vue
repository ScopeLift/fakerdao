<template>
  <q-page padding>
    <div class="text-center">
      <h2>
        Deposit or Withdraw
      </h2>
      <div
        v-if="isShift"
        class="text-h6 q-my-md"
      >
        Deposits and withdraws are currently active!
      </div>
      <div
        v-else
        class="text-h6 q-my-md"
      >
        Deposits and withdraws will open up during the next Shift Phase
      </div>
      <div>
        <span class="text-bold">Your Available MKR to Deposit: </span>{{ formattedUserMkrBalance }} MKR
      </div>
      <div>
        <span class="text-bold">Your Available MKR to Withdraw: </span>{{ formattedUserMkrDepositAmount }} MKR
      </div>
    </div>

    <hr class="q-my-xl">

    <div>
      <!-- IF USER NEEDS TO APPROVE MAKER -->
      <div
        v-if="!hasMakerAllowance"
        class="row justify-center"
      >
        <div style="max-width:400px; margin: 0 auto;">
          <div class="col-xs-12 text-center">
            Before depositing, you'll need to approve the Faker contract
            to spend your MKR. Click the button below to send this transaction.
          </div>

          <div class="row justify-center q-my-xl">
            <q-btn
              color="primary"
              label="Approve!"
              style="margin: 0 auto;"
              :loading="isLoading"
              @click="approveFakerToSpendMaker()"
            />
          </div>

          <div class="col-xs-12 text-center text-italic text-caption">
            This page will automatically update when the transaction is complete.
          </div>
        </div>
      </div>

      <!-- DEPOSIT FUNCTIONALITY -->
      <div
        v-else
        class="text-center"
      >
        <div style="max-width:400px; margin: 0 auto;">
          <div>
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
              :loading="isLoading"
              label="Deposit!"
              style="min-width: 150px;"
              @click="deposit()"
            />
          </div>
        </div>
        <div v-if="hasMkrDeposits">
          <hr class="q-my-xl">
          <div style="max-width:450px; margin: 0 auto;">
            <div>
              <div>
                This version of FakerDAO requires all MKR to be withdrawn. If you'd like to withdraw just a portion,
                withdraw all of it then make a new deposit.
              </div>
              <q-btn
                class="q-mt-xl"
                color="primary"
                label="Withdraw!"
                style="min-width: 150px;"
                @click="withdraw()"
              />
            </div>
          </div>
        </div>
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
      isLoading: false,
      mkrDepositAmount: undefined,
    };
  },

  computed: {
    ...mapState({
      mkrAllowance: (state) => state.auth.data.mkrAllowance,
      userMkrBalance: (state) => state.auth.data.userMkrBalance,
      userMkrDepositAmount: (state) => state.auth.data.userMkrDepositAmount,
      fakerContract: (state) => state.constants.contracts.fakerContract,
      makerContract: (state) => state.constants.contracts.makerContract,
      isShift: (state) => state.auth.faker.isShift,
    }),

    hasMakerAllowance() {
      return this.mkrAllowance.gt(ethers.constants.Zero);
    },

    hasMkrDeposits() {
      return Number(this.formattedUserMkrDepositAmount) > 0;
    },

    formattedUserMkrBalance() {
      if (this.userMkrBalance === undefined) return '-';
      return ethers.utils.formatEther(this.userMkrBalance);
    },
    formattedUserMkrDepositAmount() {
      if (this.userMkrDepositAmount === undefined) return '-';
      return ethers.utils.formatEther(this.userMkrDepositAmount);
    },
  },

  methods: {
    async approveFakerToSpendMaker() {
      this.isLoading = true;
      await this.makerContract.approve(this.fakerContract.address, ethers.constants.MaxUint256);
      this.isLoading = false;
    },

    isValidAmount(amount) {
      return amount > 0 && amount <= parseFloat(this.formattedUserMkrBalance);
    },

    setMakerAmount(fraction) {
      this.mkrDepositAmount = parseFloat(this.formattedUserMkrBalance) * fraction;
    },


    async deposit() {
      this.isLoading = true;
      const amount = ethers.utils.parseEther(String(this.mkrDepositAmount));
      await this.fakerContract.deposit(amount);
      this.isLoading = false;
    },

    async withdraw() {
      this.isLoading = true;
      await this.fakerContract.withdrawMaker();
      this.isLoading = false;
    },
  },
};
</script>
