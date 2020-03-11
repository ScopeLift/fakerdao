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
              :loading="isApprovalLoading"
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
            <h6 style="margin:0 0 1em;">
              Deposit MKR
            </h6>
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
              :loading="isDepositLoading"
              @click="deposit()"
            />
          </div>
        </div>
        <div v-if="hasMkrDeposits">
          <hr class="q-my-xl">
          <div style="max-width:900px; margin: 0 auto;">
            <div class="q-mb-xl row justify-center">
              <!-- WITHDRAW MAKER -->
              <div
                class="col-auto q-mr-md"
                style="max-width: 325px;"
              >
                <h6 style="margin: 0">
                  Withdraw Maker
                </h6>
                <div
                  class="q-mt-md text-justify"
                  style="min-height:75px;"
                >
                  This version of FakerDAO requires all MKR to be withdrawn.
                  If you'd like to withdraw just a portion,
                  withdraw all of it then make a new deposit.
                </div>
                <q-btn
                  class="q-mt-xl"
                  color="primary"
                  label="Withdraw MKR!"
                  style="min-width: 150px;"
                  :loading="isWithdrawMkrLoading"
                  @click="withdrawMkr()"
                />
              </div>
              <!-- WITHDRAW EARNINGS -->
              <div
                class="col-auto q-ml-md"
                style="max-width: 325px;"
              >
                <h6 style="margin: 0">
                  Withdraw Earnings
                </h6>
                <div
                  class="q-mt-md text-justify"
                  style="min-height:75px;"
                >
                  This version of FakerDAO requires all earnings to be withdrawn.
                </div>
                <q-btn
                  class="q-mt-xl"
                  color="primary"
                  label="Withdraw Earnings!"
                  style="min-width: 150px;"
                  :loading="isWithdrawEarningsLoading"
                  @click="withdrawEarnings()"
                />
              </div>
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
      isApprovalLoading: false,
      isDepositLoading: false,
      isWithdrawMkrLoading: false,
      isWithdrawEarningsLoading: false,
      mkrDepositAmount: undefined,
    };
  },

  computed: {
    ...mapState({
      mkrAllowance: (state) => state.auth.data.mkrAllowance,
      userMkrBalance: (state) => state.auth.data.userMkrBalance,
      userMkrDepositAmount: (state) => state.auth.data.userMkrDepositAmount,
      userMkrDepositPhase: (state) => state.auth.data.userMkrDepositPhase,
      fakerContract: (state) => state.constants.contracts.fakerContract,
      makerContract: (state) => state.constants.contracts.makerContract,
      isShift: (state) => state.auth.faker.isShift,
      isAuction: (state) => state.auth.faker.isAuction,
      currentPhase: (state) => state.auth.faker.currentPhase,
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
      this.isApprovalLoading = true;
      await this.makerContract.approve(this.fakerContract.address, ethers.constants.MaxUint256);
      this.isApprovalLoading = false;
    },

    isValidAmount(amount) {
      return amount > 0 && amount <= parseFloat(this.formattedUserMkrBalance);
    },

    setMakerAmount(fraction) {
      this.mkrDepositAmount = parseFloat(this.formattedUserMkrBalance) * fraction;
    },


    async deposit() {
      this.isDepositLoading = true;
      const amount = ethers.utils.parseEther(String(this.mkrDepositAmount));
      await this.fakerContract.deposit(amount);
      this.isDepositLoading = false;
    },

    async withdrawMkr() {
      this.isWithdrawMkrLoading = true;
      await this.fakerContract.withdrawMaker();
      this.isWithdrawMkrLoading = false;
    },

    async withdrawEarnings() {
      this.isWithdrawEarningsLoading = true;
      const startPhase = this.userMkrDepositPhase;
      const endPhase = !this.isShift && !this.isAuction ? this.currentPhase : this.currentPhase - 1;
      const phases = [];
      for (let i = startPhase; i < endPhase; i += 1) { phases.push(i); }
      if (phases.length === 0) {
        // eslint-disable-next-line no-alert
        alert('Nothing to withdraw!');
      } else {
        await this.fakerContract.withdrawEarnings(phases);
      }
      this.isWithdrawEarningsLoading = false;
    },
  },
};
</script>
