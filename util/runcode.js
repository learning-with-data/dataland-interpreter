const fs = require("fs");
const parseString = require("xml2js").parseString;

const Interpreter = require("../src/interpreter").Interpreter;
const PrimTable = require("../test/primtable").PrimTable;

const codeFile = process.argv.slice(2)[0];

if (codeFile == undefined) {
  console.error("Error: No filename specified. Exiting.");
  process.exit(1);
}

const code = fs.readFileSync(codeFile);
const parseParams = { explicitArray: false, mergeAttrs: true };

parseString(code, parseParams, function (err, result) {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  var i = new Interpreter(result.xml, new PrimTable(), function () {
    return;
  });
  i.start("project-started");
});
