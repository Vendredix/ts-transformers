#!/usr/bin/env node
import * as ts from "typescript";
import * as path from "path";
import { createRequire } from "module";

export interface CompilerConfig {
  sourceMapSupport?: boolean;
  plugins?: PluginConfig[];
}

export const enum PluginType {
  ProgramBuilder = "builder",
  Program = "program",
}

export const enum TransformerKind {
  Before = "before",
  After = "after",
  AfterDeclaration = "afterDeclaration",
}

export interface PluginConfig {
  transform: string;
  import?: string;
  kind?: TransformerKind[];
  type?: PluginType;

  [options: string]: unknown;
}

interface LoadedPlugins {
  transformers: ts.CustomTransformers;
}

class Builder {
  #diagnosticCount: number = 0;
  readonly #builder: ts.SolutionBuilder<any>;

  #currentProject: ts.InvalidatedProject<any> | undefined;
  #currentPlugins: LoadedPlugins | undefined;

  constructor(public readonly projectDir: string) {
    const solutionHost = ts.createSolutionBuilderHost(ts.sys, void 0, this._reportDiagnostic.bind(this), this._reportDiagnostic.bind(this));
    this.#builder = ts.createSolutionBuilder(solutionHost, [projectDir], {});
  }

  public build(): ts.ExitStatus {
    let exitStatus: ts.ExitStatus = ts.ExitStatus.Success;

    // eslint-disable-next-line no-cond-assign
    while (this.#currentProject = this.#builder.getNextInvalidatedProject()) {
      const project = this.#currentProject;
      const projectDir = path.dirname(project.project);

      const tsConfig = ts.getParsedCommandLineOfConfigFile(project.project, {}, ts.sys as any);
      if (!tsConfig) throw new Error("Not loaded");

      const config: CompilerConfig = tsConfig.raw.vendredix?.["ts-transformers"] ?? {};
      if (config.sourceMapSupport) loadSourceMapSupport();

      // Load transformers from ts config
      const plugins = this._loadPlugins(config, (project as any).getBuilderProgram() as ts.BuilderProgram, projectDir);
      this.#currentPlugins = plugins;

      exitStatus = project.done(void 0, void 0, plugins.transformers);
      this.#currentPlugins = undefined;

      if (![ts.ExitStatus.Success, ts.ExitStatus.DiagnosticsPresent_OutputsGenerated].includes(exitStatus)) {
        break;
      }
    }
    this._reportErrorCount();

    return exitStatus;
  }

  private _loadPlugins(config: CompilerConfig, program: ts.BuilderProgram, projectDir: string): LoadedPlugins {
    const plugins: LoadedPlugins = {
      transformers: {},
    };
    if (!config.plugins) return plugins;

    const requireModule = createRequire(`${projectDir}/tsconfig.json`);

    for (const plugin of config.plugins) {
      const { transform: pluginName, import: importName, type = PluginType.Program, kind = ["after"], ...options } = plugin;

      let pluginPath = pluginName;
      if (pluginPath.startsWith(".")) {
        pluginPath = path.resolve(projectDir, pluginPath);
      }


      let factory = requireModule(pluginPath);
      if (importName) factory = factory[importName];
      else if (factory.default) factory = factory.default;

      this._updateOptions(options, {
        projectDir,
      });

      let transformer: ts.CustomTransformerFactory;
      if (type === PluginType.ProgramBuilder) {
        transformer = factory(program, options);
      }
      else {
        transformer = factory(program.getProgram(), options);
      }


      for (const target of kind) {
        if (!plugins.transformers[target]) plugins.transformers[target] = [];
        plugins.transformers[target].push(transformer);
      }
    }


    return plugins;
  }

  private _updateOptions(options: object, context: object): void {
    for (const [key, value] of Object.entries(options)) {
      if (typeof value !== "string") {
        continue;
      }
      const newValue = value.replace(/\$(\w+)/g, (value, match) => {
        if (context[match]) {
          return context[match];
        }
        return value;
      });

      options[key] = newValue;
    }
  }

  private _reportDiagnostic(diagnostic: ts.Diagnostic): void {
    this.#diagnosticCount++;

    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");

    if (!diagnostic.file) {
      console.warn(message);
      return;
    }

    const diagFileName = diagnostic.file.fileName.replace(/\//g, path.sep);

    if (diagnostic.start !== undefined) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
      console.log(`${diagFileName}:${line + 1}:${character + 1}: ${message}`);
    }
    else {
      console.log(`${diagFileName}: ${message}`);
    }
  }

  private _reportErrorCount() {
    console.log();
    console.log(`Finished with ${this.#diagnosticCount} TypeScript errors.`);
  }
}

export function compileByConfig(projectConfigFile: string): number {
  try {
    const projectDir = path.dirname(path.resolve(projectConfigFile));
    const builder = new Builder(projectDir);

    const buildStatus = builder.build();

    // Done!
    const exitCode = buildStatus !== ts.ExitStatus.Success ? 1 : 0;
    console.log(`Process exiting with code '${exitCode}'.`);

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

let mapSupportLoaded = false;

function loadSourceMapSupport(): void {
  if (mapSupportLoaded) return;
  mapSupportLoaded = true;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const sourceMapSupport = require("source-map-support");
  sourceMapSupport.install({
    environment: "node",
  });
}


if (require.main === module) {
  const configPath = process.argv[2];
  if (!configPath) {
    throw new Error("Invalid tsconfig.json path");
  }
  const code = compileByConfig(configPath);
  process.exit(code);
}
