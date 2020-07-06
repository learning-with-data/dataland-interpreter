class PrimTable {
  constructor() {
    this.varTable = {};

    //Map of opCode ➔ function
    this.event_onprojectstart = (b) => this.primEventOnProjectStart(b);
    this.control_wait = (b) => this.primControlWait(b);
    this.debug_log = (b) => this.primDebugLog(b);
    this.operator_arithmetic = (b) => this.primOperatorArithmetic(b);
    this.operator_random = (b) => this.primOperatorRandom(b);
    this.operator_equals = (b) =>
      b.thread.getBlockArg(b, "OPERAND1") ===
      b.thread.getBlockArg(b, "OPERAND2");
    this.variables_set = (b) => this.primVariableSet(b);
    this.variables_get = (b) => this.primVariableGet(b);
  }

  primEventOnProjectStart() {
    return "project-started";
  }

  primControlWait(block) {
    var waitTime = block.thread.getBlockArg(block, "DURATION");
    block.thread.setStateWaiting();
    setTimeout(() => {
      block.thread.setStateReady();
    }, waitTime * 1000);
  }

  primDebugLog(block) {
    console.log(block.thread.getBlockArg(block, "STRING"));
  }

  primOperatorArithmetic(block) {
    var a = Number(block.thread.getBlockArg(block, "A"));
    var b = Number(block.thread.getBlockArg(block, "B"));
    var op = block.thread.getBlockArg(block, "OP");

    switch (op) {
    case "add":
      return a + b;
    case "subtract":
      return a - b;
    case "multiply":
      return a * b;
    case "divide":
      return a / b;
    default:
      console.warn("Got unknown arithmetic op:", op);
      return 0;
    }
  }

  primOperatorRandom(block) {
    var min = Math.ceil(block.thread.getBlockArg(block, "FROM"));
    var max = Math.floor(block.thread.getBlockArg(block, "TO"));

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  primVariableSet(block) {
    const variableName = block.thread.getBlockArg(block, "VAR");
    var variableValue = block.thread.getBlockArg(block, "VALUE");
    if (!Number.isNaN(variableValue)) variableValue = Number(variableValue);

    this.varTable[variableName] = variableValue;
  }

  primVariableGet(block) {
    const variableName = block.thread.getBlockArg(block, "VAR");
    return this.varTable[variableName];
  }
}

exports.PrimTable = PrimTable;
