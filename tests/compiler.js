const ts = require("typescript");
const keysTransformer = require("../transformer").default;

const program = ts.createProgram([require("path").resolve(__dirname, "index.ts")], {
  strict: true,
  noEmitOnError: true,
  target: ts.ScriptTarget.ESNext
});

const transformers = {
  before: [keysTransformer(program)],
  after: []
};
const { emitSkipped, diagnostics } = program.emit(undefined, undefined, undefined, false, transformers);

if (emitSkipped) {
  throw new Error(diagnostics.map(diagnostic => diagnostic.messageText).join("\n"));
}

