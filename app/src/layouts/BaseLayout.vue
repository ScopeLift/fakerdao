<template>
  <q-layout view="hhh Lpr fff">
    <!-- HEADER -->
    <q-header
      class="q-mx-md q-mt-md"
      style="color: #000000; background-color: rgba(0,0,0,0)"
    >
      <div class="row justify-between items-center">
        <div
          class="text-h5"
          style="cursor: pointer;"
          @click="$router.push({ name: 'home' });"
        >
          FakerDAO
        </div>
        <div class="text-caption">
          Account: {{ userAddress }}
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
        <div class="text-caption">
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
            href="https://twitter.com/msolomon44"
            target="_blank"
            class="hyperlink"
          >Matt Solomon</a>
          of
          <a
            href="https://floatify.net"
            target="_blank"
            class="hyperlink"
          >Floatify</a>
          and
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
          >ScopeLift</a>.
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
      userAddress: (state) => state.auth.userAddress,
    }),
  },
};
</script>
