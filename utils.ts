import * as ts from "typescript";

export function createLiteral(factory: ts.NodeFactory, value: string | number | bigint | ts.PseudoBigInt | boolean | ts.StringLiteral | ts.NoSubstitutionTemplateLiteral | ts.NumericLiteral | ts.Identifier): ts.PrimaryExpression {
  if (typeof value === "number") {
    return factory.createNumericLiteral(value);
  }
  if (typeof value === "bigint" || (typeof value === "object" && "base10Value" in value)) {
    return factory.createBigIntLiteral(<ts.PseudoBigInt> value);
  }
  if (typeof value === "boolean") {
    return value ? factory.createTrue() : factory.createFalse();
  }
  if (typeof value === "string") {
    return factory.createStringLiteral(value, undefined);
  }
  return factory.createStringLiteralFromNode(value);
}


export function createGlobalIdentifier(program: ts.Program, factory: ts.NodeFactory): ts.Identifier {
  const target = program.getCompilerOptions().target;

  if (target && target >= ts.ScriptTarget.ES2019) {
    return factory.createIdentifier("globalThis");
  }

  const lib = program.getCompilerOptions().lib || [];

  if (lib.includes("lib.dom.d.ts")) {
    return factory.createIdentifier("window");
  }
  else if (lib.includes("lib.webworker.d.ts")) {
    return factory.createIdentifier("self");
  }

  return factory.createIdentifier("global");
}
