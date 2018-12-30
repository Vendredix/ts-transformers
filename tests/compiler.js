const compiler = require("../compiler");
const tsTransformer = require("../transformer").default;

const result = compiler.compileByConfig(require("path").resolve(__dirname, "tsconfig.json"), {
  transformers: (program) => ({
    before: [tsTransformer(program)],
  }),
});

process.exit(result);
