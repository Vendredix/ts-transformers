import * as ts from "typescript";
import * as path from "path";

export function compileByConfig(configFile: string, createTransformers?: (program: ts.Program) => ts.CustomTransformers | ts.CustomTransformers): number {
  try {
    // Load and parse tsconfig json
    const tsConfigJson = readConfigFileSync(configFile);
    const tsConfig = parseJsonConfigFileContent(tsConfigJson, configFile);

    // Create host
    const host = ts.createCompilerHost(tsConfig.options);

    // Create program
    const program = ts.createProgram(tsConfig.fileNames, tsConfig.options, host);

    // Create custom transformers config
    const transformers = (typeof createTransformers === "function") ? createTransformers(program) : createTransformers || {};

    // Begin transformation
    const emitResult = program.emit(void 0, void 0, void 0, false, transformers);

    // Report diagnostics
    const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

    allDiagnostics.forEach(diagnostic => {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");

      if (!diagnostic.file) {
        console.warn(message);
        return;
      }

      const diagFileName = diagnostic.file.fileName.replace(/\//g, path.sep);

      if (diagnostic.start !== undefined) {
        const {line, character} = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        console.log(`${diagFileName}(${line + 1},${character + 1}): ${message}`);
      }
      else {
        console.log(`${diagFileName}: ${message}`);
      }
    });

    if (allDiagnostics.length > 0) {
      console.log();
      console.log(`Finished with ${allDiagnostics.length} TypeScript errors.`);
    }

    // Done!
    const exitCode = emitResult.emitSkipped ? 1 : 0;
    // console.log(`Process exiting with code '${exitCode}'.`);

    return exitCode;
  }
  catch (err) {
    console.warn(err.stack);
    return 1;
  }
}

function readConfigFileSync(fileName: string): any|never {
  const tsRead = ts.readConfigFile(fileName, ts.sys.readFile);
  if (tsRead.error) {
    throw tsRead.error;
  }

  return tsRead.config;
}

function parseJsonConfigFileContent(tsConfigJson: any, configFile: string): ts.ParsedCommandLine|never {
  const tsParse = ts.parseJsonConfigFileContent(tsConfigJson, ts.sys, path.resolve(path.dirname(configFile)), void 0, path.basename(configFile), void 0, void 0);

  if (tsParse.errors && tsParse.errors.length > 0) {
    tsParse.errors.forEach(error => console.warn(`TS Error: ${error.messageText}`));
    throw new Error(`Failed to parse TS Config file`);
  }

  return tsParse;
}
