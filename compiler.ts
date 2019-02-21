#!/usr/bin/env node
import * as ts from "typescript";
import * as path from "path";

export declare type CompilerOptions = {
  transformers?: (program: ts.Program) => ts.CustomTransformers | ts.CustomTransformers,
  processDiagnostics?: (program: ts.Program, diagnostics: ts.Diagnostic[]) => void;
};

export function compileByConfig(configFile: string, compilerOptions: CompilerOptions = {}): number {
  try {
    // Load and parse tsconfig json
    const tsConfigJson = readConfigFileSync(configFile);
    const tsConfig = parseJsonConfigFileContent(tsConfigJson, configFile);

    // Create host
    const host = ts.createCompilerHost(tsConfig.options);

    // Create program
    const program = ts.createProgram(tsConfig.fileNames, tsConfig.options, host);

    // Create custom transformers config
    const transformers = (typeof compilerOptions.transformers === "function") ? compilerOptions.transformers(program) : compilerOptions.transformers || {};

    // Begin transformation
    const emitResult = program.emit(void 0, void 0, void 0, false, transformers);

    // Report diagnostics
    const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

    // Process the diagnostics
    if (typeof compilerOptions.processDiagnostics === "function") {
      compilerOptions.processDiagnostics(program, allDiagnostics);
    }

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
    if (err.stack !== undefined) {
      console.warn(err.stack);
    }
    else if (err.message !== undefined) {
      console.warn(err.message);
    }
    else if (err.messageText !== undefined) {
      console.warn(err.messageText);
    }
    else {
      console.warn(err);
    }
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

if (process.mainModule === module) {
  const configPath = process.argv[2];
  if (!configPath) {
    throw new Error("Invalid tsconfig.json path");
  }
  compileByConfig(configPath);
}
