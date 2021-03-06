const EventEmitter = require("events");

class Thread extends EventEmitter {
  constructor(codeStack, customPrimTable) {
    super();

    this.currentStack = codeStack;

    this.primTable = {
      // These are really primitive primitives.
      // Other primitives are defined elsewhere, and then
      // assigned to this primTable.
      // Control
      control_repeat: (b) => this.primRepeat(b),
      control_if: (b) => this.primIf(b),
      control_if_else: (b) => this.primIfElse(b),
    };

    if (customPrimTable) {
      this.primTable = Object.assign(this.primTable, customPrimTable);
    }

    this.lastBlock = null;
    this.stack = [];

    this._state = "READY";
  }

  getState() {
    return this._state;
  }

  setStateReady() {
    this._state = "READY";
  }

  setStateStopped() {
    this._state = "STOPPED";
  }

  setStateWaiting() {
    this._state = "WAITING";
  }

  run() {
    // Warning: HBD...

    if (this._state === "WAITING") {
      return; // Yield
    }

    if (
      this.currentStack === undefined ||
      this.currentStack.block === undefined
    ) {
      // No more blocks
      if (this.stack.length > 0) {
        // Pop up a level
        this.currentStack = this.stack.pop();
        this.run(); // Try again
      } else {
        // No level to pop to, stopping.
        this.setStateStopped();
      }
    } else {
      var blockToRun = this.currentStack.block;
      this.currentStack = blockToRun.next;

      if (this.lastBlock !== null) {
        this.emit("block-deactivated", this.lastBlock.id);
      }
      this.emit("block-activated", blockToRun.id);

      this.evalBlock(blockToRun);

      this.lastBlock = blockToRun;
    }
  }

  evalBlock(block) {
    if (block === undefined) {
      console.warn("Got undefined block");
      return;
    }

    var opCode = block.type;
    var blockPrim = this.primTable[opCode];

    if (blockPrim === undefined) {
      console.warn("Got unknown block opCode: " + opCode);
      return;
    }

    // Sometimes primitives may need to access the thread
    block.thread = this;

    // Run the block
    return blockPrim(block);
  }

  getBlockArg(block, name) {
    if (block.field !== undefined) {
      if (block.field instanceof Array) {
        const blockField = block.field.find((field) => field.name === name);
        if (blockField !== undefined) {
          return blockField._;
        }
      } else if (block.field) {
        if (block.field.name === name) {
          return block.field._;
        }
      }
    }
    
    if (block.value !== undefined) {
      var blockValue = null;

      if (block.value instanceof Array) {
        blockValue = block.value.find((value) => value.name === name);
        if (blockValue === undefined) {
          console.warn(
            `Got unknown argument name ${name} for blocktype ${block.type}`
          );
          return;
        }
      } else {
        if (block.value.name === name) {
          blockValue = block.value;
        } else {
          console.warn(
            `Got unknown argument name ${name} for blocktype ${block.type}`
          );
          return;
        }
      }
      if (blockValue.block === undefined) {
        return blockValue.shadow.field._;
      } else {
        return this.evalBlock(blockValue.block);
      }
    }

    return;
  }

  // Core primitives defined below

  primRepeat(block) {
    var repeatCount = parseInt(this.getBlockArg(block, "TIMES"));
    this.stack.push(this.currentStack);
    this.currentStack = undefined; // Clear out the next block

    for (let i = 0; i < repeatCount; i++) {
      this.stack.push(block.statement);
    }

    // this.run(); //Start immediately, don't skip a tick.
  }

  primIf(block) {
    var condition = this.getBlockArg(block, "CONDITION");

    if (condition) {
      this.stack.push(this.currentStack);
      this.currentStack = undefined; // Clear out the next block
      this.stack.push(block.statement);
    }

    // this.run(); //Start immediately, don't skip a tick.
  }

  primIfElse(block) {
    var condition = this.getBlockArg(block, "CONDITION");

    if (condition) {
      this.stack.push(this.currentStack);
      this.currentStack = undefined; // Clear out the next block
      this.stack.push(block.statement[0]);
    } else {
      this.stack.push(this.currentStack);
      this.currentStack = undefined; // Clear out the next block
      this.stack.push(block.statement[1]);
    }

    // this.run(); //Start immediately, don't skip a tick.
  }
}

exports.Thread = Thread;
