import ts from "typescript";
import path from "path";

export default function transformer(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => (file: ts.SourceFile) => visitNodeAndChildren(file, program, context);
}

function visitNodeAndChildren(node: ts.SourceFile, program: ts.Program, context: ts.TransformationContext): ts.SourceFile;
function visitNodeAndChildren(node: ts.Node, program: ts.Program, context: ts.TransformationContext): ts.Node;
function visitNodeAndChildren(node: ts.Node, program: ts.Program, context: ts.TransformationContext): ts.Node | undefined {
  return ts.visitEachChild(visitNode(node, program), childNode => visitNodeAndChildren(childNode, program, context), context);
}

function visitNode(node: ts.Node, program: ts.Program): ts.Node | undefined {
  const typeChecker = program.getTypeChecker();
  const type = ts.SyntaxKind[node.kind];

  if (isApiImportExpression(node, typeChecker)) {
    return;
  }

  if (isApiExpression(node, typeChecker, "enumValues")) {
    return transformEnumValuesExpression(node, typeChecker);
  }

  return node;
}

function transformEnumValuesExpression(node: ts.CallExpression, typeChecker: ts.TypeChecker): ts.Node {
  if (!node.typeArguments) {
    return ts.createArrayLiteral([]);
  }
  const valueList = [];

  const type = typeChecker.getTypeFromTypeNode(node.typeArguments[0]);
  const entries = type.symbol && type.symbol.getDeclarations();
  const enumDeclaration = entries && entries[0];

  if (enumDeclaration && ts.isEnumDeclaration(enumDeclaration)) {
    for (const member of enumDeclaration.members) {
      const value = typeChecker.getConstantValue(member);
      if (value !== undefined) {
        valueList.push(ts.createLiteral(value));
      }
    }
  }

  return ts.createArrayLiteral(valueList);
}

function isApiImportExpression(node: ts.Node, typeChecker: ts.TypeChecker): node is ts.ImportDeclaration {
  if (!ts.isImportDeclaration(node)) {
    return false;
  }
  const moduleType = typeChecker.getSymbolAtLocation(node.moduleSpecifier);
  if (!moduleType) {
    return false;
  }
  const declarations = moduleType.getDeclarations();
  return !!declarations && !!declarations[0]
    && isApiModulePath(declarations[0].getSourceFile().fileName);
}

function isApiExpression(node: ts.Node, typeChecker: ts.TypeChecker, apiMethod: string): node is ts.CallExpression {
  if (!ts.isCallExpression(node)) {
    return false;
  }
  const signature = typeChecker.getResolvedSignature(node);
  if (signature === undefined) {
    return false;
  }
  const { declaration } = signature;
  if (declaration && ts.isFunctionDeclaration(declaration)) {
    return isApiModulePath(declaration.getSourceFile().fileName)
      && !!declaration.name && declaration.name.getText() === apiMethod;
  }
  return false;

}

function isApiModulePath(filePath: string): boolean {
  return path.resolve(filePath).startsWith(path.join(__dirname, "index"));
}
