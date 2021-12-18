<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import State from './components/State.vue';
import { NMessageProvider, darkTheme, NConfigProvider } from 'naive-ui';

</script>

<template>
  <n-config-provider :theme="darkTheme">
    <n-message-provider>
      <State></State>
    </n-message-provider>
  </n-config-provider>
</template>

<style>
body {
  background-color: gray;
}
</style>
