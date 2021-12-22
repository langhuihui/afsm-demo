
<template>
  <n-switch :loading="fsm.state.value < 2" v-model:value="currentValue">
    <template #checked>
      <span v-if="fsm.running">running</span>
      <span v-else>stopping</span>
    </template>
    <template #unchecked>
      <span v-if="fsm.state.value == FSM_STATE.STARTING">starting</span>
      <span v-else>idle</span>
    </template>
  </n-switch>
</template>
<script setup lang="ts">
import { NSwitch } from 'naive-ui';
import { FSMBase, FSM_STATE } from '../afsm';
import { computed } from 'vue';
const { fsm } = defineProps<{
  fsm: FSMBase;
}>();
const currentValue = computed<boolean>({
  get() {
    return fsm.running || fsm.state.value == FSM_STATE.STOPPING;
  },
  set(value) {
    fsm.switch(value);
  },
});
fsm.on("start", () => setTimeout(() => fsm.startSuccess(), 1000));
fsm.on("stop", () => setTimeout(() => fsm.stopSuccess(), 1000));
</script>