<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import State from './components/State.vue';
import { NMessageProvider, darkTheme, NConfigProvider, NCard, NSpace, NAlert } from 'naive-ui';
import Lite from './components/Lite.vue';
import { FSMBase, FSMConfig } from './afsm';
import { of, pipe, startWith, subscribe, switchMap, takeUntil } from 'fastrx';
const fsm1 = new FSMBase({ name: "父级", quickStart: false, quickStop: false });
const fsm2 = new FSMBase({ parent: fsm1, name: "子级", quickStart: false, quickStop: false });
const room = new FSMBase({ name: '进房', quickStart: false });
const push = new FSMBase({ parent: room, name: '发布流', quickStart: false });
class Capture extends FSMBase {
  constructor(options: FSMConfig, public pusher: FSMBase) {
    super(options);
    this.on("stop", () => pusher.stop());
    pipe(
      this.onStarted,
      switchMap(() => {
        const result = takeUntil(this.onStop)(push.onStarted);
        if (!push.running) {
          push.start();
        } else {
          return startWith(null)(result);
        }
        return result
      }),
      subscribe(() => {
        this.pusher.start();
      })
    );
  }
}
const videoCapture = new Capture({ name: '视频预览', quickStart: false }, new FSMBase({ name: "推视频", parent: push }));
const audioCapture = new Capture({ name: '音频采集', quickStart: false }, new FSMBase({ parent: push, name: '推音频' }));
const pushSmall = new FSMBase({ parent: videoCapture.pusher, name: '推小流' });
const localMedias = [videoCapture, audioCapture];
localMedias.forEach(l => {
  l.on("stop", () => {
    if (localMedias.every(ll => !ll.running)) push.stop();
  });
});
room.on("startSuccess", () => {
  if (localMedias.some(l => l.running)) push.start();
});
</script>

<template>
  <n-config-provider :theme="darkTheme">
    <n-message-provider>
      <n-space justify="center">
        <n-space vertical style="width: 750px;">
          <n-alert
            title="单个原子状态机说明"
            type="info"
          >单个原子状态机，代表这个AFSM类的功能，包括状态属性、方法、事件。分别用step、button、message来表示。您可以点击button来交互，状态机可以自动处理状态变化。button点击顺序不受限制，错误的点击不会破坏状态。quickStart选项可以跳过starting状态，同理quickStop选项可以跳过stopping状态</n-alert>
          <State></State>
          <n-alert
            title="AFSM级联说明"
            type="info"
          >级联代表两个状态机可以有父子关系，子状态机必须在父状态机running状态下才可以start，并且在父状态机stop时也自动stop。为了演示方便，start后1秒自动startSuccess。点击下面的开关自动调用start和stop。</n-alert>
          <n-card title="AFSM级联">
            <n-space>
              <Lite :fsm="fsm1"></Lite>
            </n-space>
          </n-card>
          <n-alert title="复杂案例说明" type="info">
            下面的例子表示了进房推流的状态变化，如果进房前打开了音频或者视频预览，进房后需要自动推流，进房后再打开预览，也需要自动推流。如果推流过程中音频和视频的预览都关闭，则需要停止推流。
          </n-alert>
          <n-card title="复杂案例">
            <n-space>
              <Lite :fsm="room"></Lite>
              <Lite :fsm="videoCapture"></Lite>
              <Lite :fsm="audioCapture"></Lite>
            </n-space>
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