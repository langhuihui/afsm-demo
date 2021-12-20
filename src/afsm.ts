import { EventEmitter } from "eventemitter3";
import { fromEvent } from "fastrx";
import { ref } from "vue";
export const enum FSM_EVENT {
  START = "start",
  START_SUCCESS = "startSuccess",
  START_FAILED = "startFailed",
  STOP = "stop",
  STOP_SUCCESS = "stopSuccess",
  STOP_FAILED = "stopFailed"
}
export const enum FSM_STATE {
  IDLE,
  STARTING,
  RUNNING,
  STOPING
}
// 四冲程序状态机
const Transitions = [
  {
    [FSM_EVENT.START]: FSM_STATE.STARTING
  },
  {
    [FSM_EVENT.START_SUCCESS]: FSM_STATE.RUNNING,
    [FSM_EVENT.START_FAILED]: FSM_STATE.IDLE,
    [FSM_EVENT.STOP]: FSM_STATE.STOPING
  },
  {
    [FSM_EVENT.STOP]: FSM_STATE.STOPING
  },
  {
    [FSM_EVENT.STOP_SUCCESS]: FSM_STATE.IDLE,
    [FSM_EVENT.STOP_FAILED]: FSM_STATE.RUNNING
  }
] as const;
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
  onStart = fromEvent(this, FSM_EVENT.START);
  onStarted = fromEvent(this, FSM_EVENT.START_SUCCESS);
  onStop = fromEvent<{ from: FSM_STATE; code: number; }, FSM_EVENT>(
    this,
    FSM_EVENT.STOP
  );
  onStopped = fromEvent(this, FSM_EVENT.STOP_SUCCESS);
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
      option.parent.on(FSM_EVENT.STOP, () => this.stop(NaN));
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
      this.transition(FSM_EVENT.START, ...args) &&
      (!this.quickStart || this.startSuccess(...args))
    );
  }
  startSuccess(...args: any[]) {
    return this.transition(FSM_EVENT.START_SUCCESS, ...args);
  }
  startFailed(err: any) {
    return this.transition(FSM_EVENT.START_FAILED, err);
  }
  stop(code: number = 0) {
    return (
      this.transition(FSM_EVENT.STOP, code) &&
      (!this.quickStop || this.stopSuccess())
    );
  }
  stopSuccess(...args: any[]) {
    return this.transition(FSM_EVENT.STOP_SUCCESS, ...args);
  }
  stopFailed(err: any) {
    return this.transition(FSM_EVENT.STOP_FAILED, err);
  }
  private transition(event: FSM_EVENT, ...args: any[]) {
    const list = Transitions[this.state.value];
    if (list.hasOwnProperty(event)) {
      // @ts-ignore
      const to = list[event];
      const from = this.state.value;
      this.state.value = to;
      this.timestamps[this.state.value] = Date.now();
      console.log(this.name, event, from, "->", to, ...args);
      switch (event) {
        case FSM_EVENT.STOP:
          this.emit(event, { from, code: args[0] });
          break;
        default:
          this.emit(event, ...args);
      }
      return true;
    }
    return false;
  }
}
