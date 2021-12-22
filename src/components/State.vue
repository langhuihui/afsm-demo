<script setup lang="ts">
import { NCard, NStep, NSteps, NButton, NButtonGroup, NCheckbox, useMessage } from 'naive-ui';
import { reactive } from 'vue';
import { FSMBase, FSM_EVENT ,FSM_STATE} from '../afsm';
const message = useMessage();
const config = reactive({ name: "afsm", quickStart: false, quickStop: false });
const fsm = new FSMBase(config);
for (let i = 0; i < 2; i++) {
  fsm.on(FSM_EVENT[i], () => message.info(FSM_EVENT[i]));
  fsm.on(FSM_EVENT[i] + FSM_EVENT[2], () => message.success(FSM_EVENT[i] + FSM_EVENT[2]));
  fsm.on(FSM_EVENT[i] + FSM_EVENT[3], () => message.error(FSM_EVENT[i] + FSM_EVENT[3]));
}
</script>

<template>
  <n-card title="单个原子状态机" style="width: 600px;">
    <template #header-extra>
      <n-checkbox v-model:checked="config.quickStart">quickStart</n-checkbox>
      <n-checkbox v-model:checked="config.quickStop">quickStop</n-checkbox>
    </template>
    <n-steps :current="fsm.state.value" status="process">
      <n-step title="Idle" :status="fsm.state.value == FSM_STATE.IDLE ? 'process' : 'wait'" />
      <n-step title="Starting" :status="fsm.state.value == FSM_STATE.STARTING ? 'process' : 'wait'" />
      <n-step title="Running" :status="fsm.state.value == FSM_STATE.RUNNING ? 'process' : 'wait'" />
      <n-step title="Stopping" :status="fsm.state.value == FSM_STATE.STOPPING ? 'process' : 'wait'" />
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
