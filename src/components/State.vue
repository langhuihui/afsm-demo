<script setup lang="ts">
import { NCard, NStep, NSteps, NButton, NButtonGroup, NCheckbox, useMessage } from 'naive-ui';
import { computed, reactive, ref } from 'vue';
import { FSMBase, FSM_EVENT } from '../afsm';
const message = useMessage();
const config = reactive({ name: "afsm", quickStart: false, quickStop: false });
const fsm = new FSMBase(config);
fsm.on(FSM_EVENT.START, () => message.info(FSM_EVENT.START));
fsm.on(FSM_EVENT.STOP, () => message.info(FSM_EVENT.STOP));
fsm.on(FSM_EVENT.START_SUCCESS, () => message.success(FSM_EVENT.START_SUCCESS));
fsm.on(FSM_EVENT.START_FAILED, () => message.error(FSM_EVENT.START_FAILED));
fsm.on(FSM_EVENT.STOP_SUCCESS, () => message.success(FSM_EVENT.STOP_SUCCESS));
fsm.on(FSM_EVENT.STOP_FAILED, () => message.error(FSM_EVENT.STOP_FAILED));
const current = computed(() => fsm.state.value + 1);
</script>

<template>
  <n-card title="单个原子状态机" style="width: 600px;">
    <template #header-extra>
      <n-checkbox v-model:checked="config.quickStart">quickStart</n-checkbox>
      <n-checkbox v-model:checked="config.quickStop">quickStop</n-checkbox>
    </template>
    <n-steps :current="current" status="process">
      <n-step title="Idle" :status="current == 1 ? 'process' : 'wait'" />
      <n-step title="Starting" :status="current == 2 ? 'process' : 'wait'" />
      <n-step title="Running" :status="current == 3 ? 'process' : 'wait'" />
      <n-step title="Stopping" :status="current == 4 ? 'process' : 'wait'" />
    </n-steps>
    <template #action>
      <n-button-group>
        <n-button @click="fsm.start()">start</n-button>
        <n-button @click="fsm.startSuccess()">startSuccess</n-button>
        <n-button @click="fsm.startFailed(0)">startFailed</n-button>
        <n-button @click="fsm.stop()">stop</n-button>
        <n-button @click="fsm.stopSuccess()">stopSuccess</n-button>
        <n-button @click="fsm.stopFailed(0)">stopFailed</n-button>
      </n-button-group>
    </template>
  </n-card>
</template>

<style scoped>
a {
  color: #42b983;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}
</style>
