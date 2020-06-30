const EventEmitter = require("events");

const Thread = require("./thread").Thread;

const TICK = 100; // Scheduler ticks every 100 ms

class Interpreter extends EventEmitter {
  constructor(codeToRun, customPrimTable, whenDone) {
    super();

    this.state = "STOPPED"; // RUNNING, STOPPED, STEPPING

    this.code = codeToRun;
    this.customPrimTable = customPrimTable;
    this.whenDone = whenDone;

    this.eventMap = {}; // Map of events to stacks;

    this.activeThreads = [];
    this.activeThreadIndex = 0;
    this.intervalId = null;

    if (this.code.block instanceof Array) {
      this.code.block.forEach((codeStack) => {
        var code = { block: codeStack };
        var triggerEvent = this.getTriggerForStack(code);

        if (this.eventMap[triggerEvent] === undefined) {
          this.eventMap[triggerEvent] = [];
        }
        this.eventMap[triggerEvent].push(code);
      });
    } else {
      var triggerEvent = this.getTriggerForStack(this.code);

      if (this.eventMap[triggerEvent] === undefined) {
        this.eventMap[triggerEvent] = [];
      }
      this.eventMap[triggerEvent].push(this.code);
    }
  }

  createThread(code) {
    var t = new Thread(code, this.customPrimTable);
    t.on("block-activated", (blockId) => {
      this.emit("block-activated", blockId);
    });
    t.on("block-deactivated", (blockId) => {
      this.emit("block-deactivated", blockId);
    });
    return t;
  }

  start(event) {
    if (event) {
      this.handleEvent(event);
    }

    this.state = "RUNNING";
    this.intervalId = setInterval(() => {
      if (this.activeThreads.length == 0) {
        // We are done. Stahp.
        this.stop();
        this.whenDone();
        return;
      }

      var threadToRun = this.activeThreads[this.activeThreadIndex];
      if (threadToRun.getState() === "STOPPED") {
        // Remove from threadPool
        this.activeThreads.splice(this.activeThreadIndex, 1);
      } else {
        threadToRun.run();
      }

      this.activeThreadIndex += 1;
      if (this.activeThreadIndex >= this.activeThreads.length) {
        // Go around
        this.activeThreadIndex = 0;
      }
    }, TICK);
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.activeThreads.forEach((t) => {
      t.setStateStopped();
    });
    this.state = "STOPPED";
  }

  step() {
    this.state = "STEPPING";

    if (this.activeThreads.length == 0) {
      // We are done. Stahp.
      this.stop();
      this.whenDone();
      return;
    }

    var threadToRun = this.activeThreads[this.activeThreadIndex];
    if (threadToRun.getState() === "STOPPED") {
      // Remove from threadPool
      this.activeThreads.splice(this.activeThreadIndex, 1);
    } else {
      threadToRun.run();
    }

    this.activeThreadIndex += 1;
    if (this.activeThreadIndex >= this.activeThreads.length) {
      // Go around
      this.activeThreadIndex = 0;
    }

    this.stop();
    this.whenDone();
  }

  handleEvent(event) {
    if (
      this.eventMap[event] === undefined ||
      this.eventMap[event].length === 0
    ) {
      return;
    }

    this.eventMap[event].forEach((codeStack) => {
      this.activeThreads.push(this.createThread(codeStack));
    });
  }

  getTriggerForStack(stack) {
    var block = stack.block;
    if (block === undefined || !block.type.startsWith("event_")) {
      // Return undefined if no hat
      return;
    }

    var opCode = block.type;
    var blockPrim = this.customPrimTable[opCode];

    if (blockPrim === undefined) {
      console.warn("Got unknown block opCode: " + opCode);
      return;
    }

    return blockPrim(block);
  }
}

exports.Interpreter = Interpreter;
