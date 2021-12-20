<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import State from './components/State.vue';
import { NMessageProvider, darkTheme, NConfigProvider, NCard, NSpace, NAlert } from 'naive-ui';
import Lite from './components/Lite.vue';
import { FSMBase } from './afsm';
const fsm1 = new FSMBase({ name: "afsm1", quickStart: false, quickStop: false });
const fsm2 = new FSMBase({ parent: fsm1, name: "afsm2", quickStart: false, quickStop: false });
</script>

<template>
  <n-config-provider :theme="darkTheme">
    <n-message-provider>
      <n-space justify="center">
        <n-space vertical style="width: 600px;">
          <n-alert title="说明" type="info">
            单个原子状态机，代表这个AFSM类的功能，包括状态属性、方法、事件。分别用step、button、message来表示。您可以点击button来交互，状态机可以自动处理状态变化，button可以任意点击。
          </n-alert>
          <State></State>
          <n-alert title="说明" type="info">
            级联代表两个状态机可以有父子关系，子状态机必须在父状态机running状态下才可以start，并且在父状态机stop时也自动stop。
          </n-alert>
          <n-card title="级联">
            <Lite :fsm="fsm1"></Lite>
            <Lite :fsm="fsm2"></Lite>
          </n-card>
        </n-space>
      </n-space>
    </n-message-provider>
  </n-config-provider>
</template>

<style>
body {
  background-color: rgb(59, 59, 59);
}
</style>