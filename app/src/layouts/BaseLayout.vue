<template>
  <q-layout view="hhh Lpr fff">
    <!-- HEADER -->
    <q-header
      class="q-mx-md q-mt-md"
      style="color: #000000; background-color: rgba(0,0,0,0)"
    >
      <div class="row justify-between items-center">
        <div class="col">
          <div
            class="row justify-start items-center"
            style="cursor: pointer;"
            @click="$router.push({ name: 'home' });"
          >
            <img
              alt="FakerDAO logo"
              class="q-mx-md"
              src="statics/app-logo-128x128.png"
              style="max-width: 50px;"
            >
            <div class="text-h5">
              FakerDAO
            </div>
          </div>
        </div>
        <div class="col-auto">
          <div class="text-caption q-mr-md">
            Account: {{ userAddress }}
          </div>
          <div
            v-if="networkId !== '42'"
            class="text-bold"
            style="color:red"
          >
            Connect to the Kovan network to use this app!
          </div>
        </div>
      </div>
    </q-header>
    <!-- MAIN CONTENT -->
    <q-page-container>
      <router-view />
    </q-page-container>
    <!-- FOOTER -->
    <q-footer
      bordered
      class="q-mt-xl"
      style="color: #000000; background-color: rgba(0,0,0,0)"
    >
      <div class="row justify-center items-center q-my-xl">
        <div
          class="text-caption"
          style="max-width: 800px;"
        >
          This website, the corresponding
          <a
            href="https://www.scopelift.co/blog/fakerdao"
            target="_blank"
            class="hyperlink"
          >article</a>,
          and the FakerDAO contract
          <a
            href="https://github.com/scopelift/fakerdao"
            target="_blank"
            class="hyperlink"
          >source code</a>
          were co-authored by

          <a
            href="https://twitter.com/BenDiFrancesco"
            target="_blank"
            class="hyperlink"
          >Ben DiFrancesco</a>
          of
          <a
            href="https://www.scopelift.co/home"
            target="_blank"
            class="hyperlink"
          >ScopeLift</a>
          and
          <a
            href="https://twitter.com/msolomon44"
            target="_blank"
            class="hyperlink"
          >Matt Solomon</a>
          of
          <a
            href="https://floatify.net"
            target="_blank"
            class="hyperlink"
          >Floatify</a>.

          <br><br>
          Icon made by <a
            href="https://www.flaticon.com/authors/freepik"
            target="_blank"
            class="hyperlink"
          >Freepik</a> from <a
            href="http://www.flaticon.com/"
            target="_blank"
            class="hyperlink"
          >https://www.flaticon.com/</a>.
        </div>
      </div>
    </q-footer>
  </q-layout>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'BaseLayout',

  computed: {
    ...mapState({
      userAddress: (state) => {
        if (state.auth.userAddress === state.constants.AddressZero) {
          return 'Not connected';
        }
        return state.auth.userAddress;
      },
      networkId: (state) => {
        if (state.auth && state.auth.provider && state.auth.provider.provider) {
          return state.auth.provider.provider.networkVersion;
        }
        return undefined;
      },
    }),
  },
};
</script>
