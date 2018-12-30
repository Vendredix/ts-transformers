const compiler = require("../compiler");
const tsTransformer = require("../transformer").default;

compiler.compileByConfig(require("path").resolve(__dirname, "tsconfig.json"), (program) => ({
  before: [tsTransformer(program)],
}));
