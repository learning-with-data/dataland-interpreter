class PrimTable {
  constructor() {
    //Map of opCode ➔ function
    this.event_onprojectstart = (b) => this.primEventOnProjectStart(b);
    this.control_wait = (b) => this.primControlWait(b);
    this.debug_log = (b) => this.primDebugLog(b);
    this.operator_random = (b) => this.primOperatorRandom(b);
    this.operator_equals = (b) =>
      b.thread.getBlockArg(b, 0) === b.thread.getBlockArg(b, 1);
  }

  primEventOnProjectStart() {
    return "project-started";
  }

  primControlWait(block) {
    var waitTime = block.thread.getBlockArg(block, 0);
    block.thread.setStateWaiting();
    setTimeout(() => {
      block.thread.setStateReady();
    }, waitTime * 1000);
  }

  primDebugLog(block) {
    console.log(block.thread.getBlockArg(block, 0));
  }

  primOperatorRandom(block) {
    var min = Math.ceil(block.thread.getBlockArg(block, 0));
    var max = Math.floor(block.thread.getBlockArg(block, 1));
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

exports.PrimTable = PrimTable;
