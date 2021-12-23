
<template>
  <n-card :title="fsm.name" size="small">
    <template v-if="fsm.children.length" #header-extra>
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
    <n-switch v-if="fsm.children.length==0" :loading="fsm.state.value < 2" v-model:value="currentValue">
      <template #checked>
        <span v-if="fsm.running">running</span>
        <span v-else>stopping</span>
      </template>
      <template #unchecked>
        <span v-if="fsm.state.value == FSM_STATE.STARTING">starting</span>
        <span v-else>idle</span>
      </template>
    </n-switch>
    <n-space :wrap="false">
      <lite :fsm="child" v-for="child in fsm.children" />
    </n-space>
  </n-card>
</template>
<script setup lang="ts">
import { NSwitch, NCard, NSpace } from 'naive-ui';
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
if (!fsm.quickStart) fsm.on("start", () => setTimeout(() => fsm.startSuccess(), 1000));
if (!fsm.quickStop) fsm.on("stop", () => setTimeout(() => fsm.stopSuccess(), 1000));
defineExpose({
  name: "lite",
});
</script>