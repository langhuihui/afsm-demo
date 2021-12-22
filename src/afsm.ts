import { EventEmitter } from "eventemitter3";
import { fromEvent } from "fastrx";
import { ref } from "vue";
export enum FSM_EVENT {
  start,
  stop,
  Success,
  Failed
}
export enum FSM_STATE {
  IDLE = 0b11,
  STARTING = 0b00,
  RUNNING = 0b10,
  STOPPING = 0b01
}
export interface FSMConfig {
  parent?: FSMBase;
  name?: string;
  quickStart?: boolean;
  quickStop?: boolean;
}
export class FSMBase extends EventEmitter {
  static AllFSM = new Set<FSMBase>();
  state = ref(FSM_STATE.IDLE);
  timestamps: Record<string, number> = {};
  get running() {
    return this.state.value == FSM_STATE.RUNNING;
  }
  onStart = fromEvent(this, FSM_EVENT[0]);
  onStarted = fromEvent(this, FSM_EVENT[0] + FSM_EVENT[2]);
  onStop = fromEvent<number, string>(
    this,
    FSM_EVENT[1]
  );
  onStopped = fromEvent(this, FSM_EVENT[1] + FSM_EVENT[2]);
  // 快速关闭，无需等待
  get quickStop() {
    return !(this.option?.quickStop === false);
  }
  get quickStart() {
    return !(this.option?.quickStart === false);
  }
  name: string;
  constructor(public option?: FSMConfig) {
    super();
    this.name = option?.name || this.constructor.name;
    if (option?.parent) {
      // 级联关闭
      option.parent.on("stop", () => this.stop(NaN));
    }
  }
  switch(...args: any[]) {
    if (this.running) this.stop();
    else this.start(...args);
  }
  start(...args: any[]) {
    if (this.option?.parent && !this.option.parent.running) {
      return false;
    }
    return (
      this.transition(FSM_EVENT.start, 0, ...args) &&
      (!this.quickStart || this.startSuccess(...args))
    );
  }
  startSuccess(...args: any[]) {
    return this.transition(FSM_EVENT.start, FSM_EVENT.Success, ...args);
  }
  startFailed(err: any) {
    return this.transition(FSM_EVENT.start, FSM_EVENT.Failed, err);
  }
  stop(code: number = 0) {
    return (
      this.transition(FSM_EVENT.stop, 0, code) &&
      (!this.quickStop || this.stopSuccess())
    );
  }
  stopSuccess(...args: any[]) {
    return this.transition(FSM_EVENT.stop, FSM_EVENT.Success, ...args);
  }
  stopFailed(err: any) {
    return this.transition(FSM_EVENT.stop, FSM_EVENT.Failed, err);
  }
  private transition(x: FSM_EVENT.start | FSM_EVENT.stop, y: 0 | FSM_EVENT.Success | FSM_EVENT.Failed, ...args: any[]) {
    const from = this.state.value;
    const event = FSM_EVENT[x] + (y ? FSM_EVENT[y] : "")
// const Transitions = [];
// Transitions[0b00] = {
//   [FSMEvent[0b00] + FSMEvent[0b10]]: 0b10,
//   [FSMEvent[0b00] + FSMEvent[0b11]]: 0b11,
// };
// Transitions[0b01] = {
//   [FSMEvent[0b01] + FSMEvent[0b10]]: 0b11,
//   [FSMEvent[0b01] + FSMEvent[0b11]]: 0b10,
// };
// Transitions[0b10] = {
//   [FSMEvent[0b01]]: 0b01
// };
// Transitions[0b11] = {
//   [FSMEvent[0b00]]: 0b00
// };
// if(Transitions[from][event]){ }
    if ((from ^ x) == (y ? 0 : 3)) {
      this.state.value = x ^ y;
      this.timestamps[this.state.value] = Date.now();
      console.log(this.name, event, FSM_STATE[from], "->", FSM_STATE[this.state.value], ...args);
      this.emit(event, ...args);
      return true;
    }
    return false;
  }
}
