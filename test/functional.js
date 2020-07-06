const fs = require("fs");
const parseString = require("xml2js").parseString;
const stdout = require("test-console").stdout;
const tap = require("tap");

const Interpreter = require("../src/interpreter").Interpreter;
const PrimTable = require("./primtable").PrimTable;

function testFunction(testName, inputCodeFile, testFunction) {
  tap.test(testName, function (t) {
    const code = fs.readFileSync(inputCodeFile);
    const parseParams = { explicitArray: false, mergeAttrs: true };

    parseString(code, parseParams, function (err, result) {
      if (err) {
        throw err;
      }

      var inspect = stdout.inspect();
      var i = new Interpreter(result.xml, new PrimTable(), function () {
        return testFunction(t, inspect);
      });
      i.start("project-started");
    });
  });
}

testFunction("Simple Reporter", "./test/fixtures/reporter.xml", function (
  t,
  inspect
) {
  inspect.restore();
  t.true((inspect.output[0] >= 0) & (inspect.output[0] <= 20));
  t.end();
});

testFunction("Two Stacks", "./test/fixtures/two-stacks.xml", function (
  t,
  inspect
) {
  inspect.restore();
  t.same(inspect.output, [
    "Hello Data Blocks from stack 1\n",
    "Hello Data Blocks from stack 2\n",
    "Hello Data Blocks from stack 1\n",
    "Hello Data Blocks from stack 2\n",
    "Hello Data Blocks from stack 1\n",
    "Hello Data Blocks from stack 2\n",
    "Hello Data Blocks from stack 1\n",
    "Hello Data Blocks from stack 2\n",
    "Hello Data Blocks from stack 1\n",
    "Hello Data Blocks from stack 1\n",
    "Hello Data Blocks from stack 1\n",
    "Hello Data Blocks from stack 1\n",
    "Hello Data Blocks from stack 1\n",
    "Hello Data Blocks from stack 1\n",
  ]);
  t.end();
});

testFunction(
  "Two Stacks, One w/o Hat",
  "./test/fixtures/two-stacks-one-without-hat.xml",
  function (t, inspect) {
    inspect.restore();
    t.same(inspect.output, [
      "Hello Data Blocks from stack 1\n",
      "Hello Data Blocks from stack 1\n",
      "Hello Data Blocks from stack 1\n",
      "Hello Data Blocks from stack 1\n",
      "Hello Data Blocks from stack 1\n",
      "Hello Data Blocks from stack 1\n",
      "Hello Data Blocks from stack 1\n",
      "Hello Data Blocks from stack 1\n",
      "Hello Data Blocks from stack 1\n",
      "Hello Data Blocks from stack 1\n",
    ]);
    t.end();
  }
);

testFunction("Nested Repeat", "./test/fixtures/nested-repeat.xml", function (
  t,
  inspect
) {
  inspect.restore();
  t.same(inspect.output, [
    "Hi\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hi\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hi\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hi\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hi\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hi\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hi\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hi\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hi\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hi\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
    "Hello\n",
  ]);
  t.end();
});

testFunction("If", "./test/fixtures/if.xml", function (t, inspect) {
  inspect.restore();
  t.same(inspect.output, ["42 = 42\n"]);
  t.end();
});

testFunction("If Else", "./test/fixtures/ifelse.xml", function (t, inspect) {
  inspect.restore();
  t.same(inspect.output, ["42 != 24\n", "42 = 42\n"]);
  t.end();
});

testFunction(
  "Two stacks w/ Wait",
  "./test/fixtures/two-stacks-with-wait.xml",
  function (t, inspect) {
    inspect.restore();
    t.same(inspect.output, [
      "Hello 1\n",
      "Hello 1\n",
      "Hello 1\n",
      "Hello 1\n",
      "Hello 1\n",
      "Hello 2\n",
      "Hello 2\n",
      "Hello 2\n",
      "Hello 2\n",
      "Hello 2\n",
      "Hello 3\n",
      "Hello 3\n",
      "Hello 3\n",
      "Hello 3\n",
      "Hello 3\n",
    ]);
    t.end();
  }
);

testFunction("Fields and values", "./test/fixtures/fields-and-values.xml", function (
  t,
  inspect
) {
  inspect.restore();
  t.true((inspect.output[0] >= 10) & (inspect.output[0] <= 150));
  t.end();
});

testFunction(
  "Variable set/get",
  "./test/fixtures/variable-set-get.xml",
  function (t, inspect) {
    inspect.restore();
    t.same(inspect.output, ["10\n"]);
    t.end();
  }
);

testFunction(
  "Variable addition",
  "./test/fixtures/variable-add.xml",
  function (t, inspect) {
    inspect.restore();
    t.same(inspect.output, ["15\n"]);
    t.end();
  }
);

testFunction(
  "Block with serialized dropdown field",
  "./test/fixtures/block-with-serialized-field-dropdown.xml",
  function (t, inspect) {
    inspect.restore();
    t.same(inspect.output, ["450\n"]);
    t.end();
  }
);