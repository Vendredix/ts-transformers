import ts from "typescript";
import path from "path";

enum ApiMethod {
  isNull, isUndefined, isNullOrUndefined,
  isNumber, isBoolean, isString, isFunction, isSymbol,
  isPrimitive,
  isArray, isObject, isObjectOrArray,
  isMinLengthArray,
  isNonEmptyString, isMinLengthString,
  $LAST_TYPEOF_METHOD = isMinLengthString,

  isBitSet, setBits, unsetBits,
  $LAST_BIT_METHOD = unsetBits,

  enumValues,
}

const typeofTransformMap = {
  "isPrimitive": "isNumberOrBooleanOrString",
  "isObject": "isObjectAndNotNullAndNotArray",
  "isObjectOrArray": "isObjectAndNotNull",
  "isMinLengthArray": true, // custom
  "isNonEmptyString": true,
  "isMinLengthString": true,
};
const apiArgCountMap = {
  [ApiMethod.isMinLengthArray]: [1, 2],
  [ApiMethod.isMinLengthString]: [1, 2],
  [ApiMethod.isBitSet]: 2,
  [ApiMethod.setBits]: 2,
  [ApiMethod.unsetBits]: 2,
};

export default function transformer(programOrGetter: ts.Program | (() => ts.Program)): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => {
    const program = typeof programOrGetter === "function" ? programOrGetter() : programOrGetter;

    const typeChecker = program.getTypeChecker();

    context.enableSubstitution(ts.SyntaxKind.CallExpression);
    const prevOnSubstituteNode = context.onSubstituteNode;
    context.onSubstituteNode = onSubstituteNode;

    return visitNodeAndChildren;

    function visitNodeAndChildren(node: ts.SourceFile): ts.SourceFile;
    function visitNodeAndChildren(node: ts.Node): ts.Node;
    function visitNodeAndChildren(node: ts.Node): ts.Node | undefined {
      return ts.visitEachChild(visitNode(node), childNode => visitNodeAndChildren(childNode), context);
    }


    function visitNode(node: ts.Node): ts.Node | undefined {
      if (isApiImportExpression(node, typeChecker)) {
        return;
      }

      if (!ts.isCallExpression(node)) {
        return node;
      }

      const apiMethod = getApiExpressionName(node, typeChecker);
      if (apiMethod !== undefined) {
        let newNode: ts.Node = node;
        let addComment = true;

        if (apiMethod === ApiMethod.enumValues) {
          newNode = transformEnumValuesExpression(node, typeChecker);
        }

        if (!context.getCompilerOptions().removeComments && addComment) {
          ts.addSyntheticTrailingComment(newNode, ts.SyntaxKind.MultiLineCommentTrivia, ` ${node.getText()} `, false);
        }

        return newNode;
      }

      return node;
    }

    function onSubstituteNode(hint: ts.EmitHint, node: ts.Node): ts.Node {
      if (!ts.isCallExpression(node) && !ts.isIdentifier(node)) {
        return prevOnSubstituteNode(hint, node);
      }

      const apiMethod = getApiExpressionName(node, typeChecker);
      if (apiMethod !== undefined) {
        const methodName = ApiMethod[apiMethod];
        let newNode: ts.Expression = node;
        let addComment = true;

        const {argCount, minArgCount} = getArgumentCount(apiMethod);

        let useCallback = false;
        let identifierList: ReadonlyArray<ts.Expression>
          , paramList: ts.ParameterDeclaration[];

        if (ts.isCallExpression(node)) {
          if (node.arguments.length < minArgCount) {
            throw new Error("Not enough parameters"); // fixme: spawn TS error.
          }
          identifierList = node.arguments;
        }
        else {
          // Prepare new identifiers and arrow callback arguments such that the method can be used as an identifier.
          useCallback = true;
          const list = new Array(argCount);
          paramList = new Array(argCount);

          for (let i = 0; i < argCount; i++) {
            list[i] = ts.createTempVariable(undefined);
            paramList[i] = ts.createParameter(void 0, void 0, void 0, list[i], void 0, void 0, void 0);
          }
          identifierList = list;
        }

        if (isTypeofMethod(apiMethod)) {
          newNode = createApiTypeOfExpression(
            program,
            methodName,
            identifierList[0],
            ...identifierList.slice(1),
          )!;
          addComment = Boolean(typeofTransformMap[methodName]);
        }
        else if (isBitMethod(apiMethod)) {
          switch (apiMethod) {
            case ApiMethod.isBitSet:
              newNode = createIsBitSet(identifierList[0], identifierList[1]);
              break;
            case ApiMethod.setBits:
            case ApiMethod.unsetBits:
              newNode = createSetBits(identifierList[0], identifierList[1], apiMethod === ApiMethod.unsetBits);
              break;
          }
        }
        else {
          return newNode;
        }

        if (!useCallback && !ts.isParenthesizedExpression(newNode)) {
          newNode = ts.createParen(newNode);
        }
        else if (useCallback) {
          newNode = ts.createArrowFunction(
            void 0,
            void 0,
            paramList!,
            void 0,
            ts.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            newNode as ts.ConciseBody,
          )
        }

        // if (!context.getCompilerOptions().removeComments && addComment) {
        //   ts.addSyntheticTrailingComment(newNode, ts.SyntaxKind.MultiLineCommentTrivia, ` ${node.getText()} `, false);
        // }

        return newNode;
      }

      return prevOnSubstituteNode(hint, node);
    }
  }
}

export function createApiTypeOfExpression(program: ts.Program, methodName: string, valueExpr: ts.Expression, ...args: any[]): ts.Expression | undefined | never {
  if (!methodName.startsWith("is")) {
    throw new Error("Invalid method name: " + methodName);
  }

  const [arg0] = args;

  if (["isMinLengthArray", "isNonEmptyString", "isMinLengthString"].includes(methodName)) {
    let lengthArg: ts.Expression;

    // Determine the length argument
    if (args.length === 0 || typeof arg0 === "number") {
      const length = args.length === 0 ? 1 : arg0;
      lengthArg = ts.createLiteral(length);
    }
    else if (ts.isLiteralExpression(arg0) || ts.isIdentifier(arg0)
      || ts.isCallExpression(arg0)
      || ts.isElementAccessExpression(arg0) || ts.isPropertyAccessExpression(arg0)) {
      lengthArg = arg0;
    }
    else {
      throw new Error(`Invalid length argument for ${methodName}!`);
    }

    const type = methodName.split(/(?=[A-Z])/).pop()!;

    // Create `isArray(value) && value.length >= length` expression.
    return ts.createBinary(
      createTypeOfExpression(program, type, valueExpr),
      ts.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
      ts.createBinary(
        ts.createPropertyAccess(valueExpr, "length"),
        ts.createToken(ts.SyntaxKind.GreaterThanEqualsToken),
        lengthArg
      )
    );
  }

  // Transform the method name
  if (typeofTransformMap[methodName]) {
    methodName = typeofTransformMap[methodName];
  }

  const typeList: string[] = methodName.substring(2).split(/(?=[A-Z])/);
  let joinType: string;

  let expression: ts.Expression | undefined;
  while (typeList.length) {
    const negated = typeList[0] === "Not";
    if (negated) typeList.shift();

    const type = typeList.shift()!;
    const expr = createTypeOfExpression(program, type, valueExpr, negated);

    if (!expression) {
      expression = expr!;
    }
    else {
      const tokenType = joinType! === "Or" ? ts.SyntaxKind.BarBarToken : ts.SyntaxKind.AmpersandAmpersandToken;
      expression = ts.createBinary(expression, ts.createToken(tokenType), expr!);
    }

    joinType = typeList.shift()!;
  }

  return expression;
}

function createTypeOfExpression(program: ts.Program, type: string, valueExpr: ts.Expression, negated: boolean = false): ts.Expression {
  let expr: ts.Expression;

  const equalityTokenType = negated ? ts.SyntaxKind.ExclamationEqualsEqualsToken : ts.SyntaxKind.EqualsEqualsEqualsToken;

  // Array.isArray(value)
  if (type === "Array") {
    expr = ts.createCall(
      ts.createPropertyAccess(ts.createPropertyAccess(createGlobalIdentifier(program), ts.createIdentifier("Array")), "isArray"),
      void 0,
      [valueExpr],
    );
    if (negated) {
      expr = ts.createLogicalNot(expr);
    }
  }
  // value === null || value === undefined
  else if (type === "Null" || type === "Undefined") {
    expr = ts.createBinary(valueExpr, ts.createToken(equalityTokenType), type === "Null" ? ts.createNull() : ts.createVoidZero());
  }
  // Else: typeof value === "${type}"
  else {
    expr = ts.createBinary(ts.createTypeOf(valueExpr), ts.createToken(equalityTokenType), ts.createStringLiteral(type.toLowerCase()));
  }

  return expr;
}

function createIsBitSet(left: ts.Expression, right: ts.Expression, invert?: boolean): ts.Expression {
  // ((left & right) === right)
  return ts.createParen(ts.createBinary(
    ts.createParen(ts.createBinary(
      left,
      ts.createToken(ts.SyntaxKind.AmpersandToken),
      right,
    )),
    ts.createToken(invert ? ts.SyntaxKind.ExclamationEqualsEqualsToken : ts.SyntaxKind.EqualsEqualsEqualsToken),
    right,
  ));
}

function createSetBits(left: ts.Expression, right: ts.Expression, unset: boolean): ts.Expression {
  // (left & ~right)
  if (unset) {
    return ts.createParen(ts.createBinary(
      left,
      ts.createToken(ts.SyntaxKind.AmpersandToken),
      ts.createPrefix(ts.SyntaxKind.TildeToken, right),
    ));
  }

  // (left | right)
  return ts.createParen(ts.createBinary(
    left,
    ts.createToken(ts.SyntaxKind.BarToken),
    right,
  ));
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

function getApiExpressionName(node: ts.Node, typeChecker: ts.TypeChecker): ApiMethod | undefined {
  let declaration: ts.Declaration | undefined;

  if (ts.isIdentifier(node)) {
    const type = typeChecker.getTypeAtLocation(node);
    declaration = type && type.symbol && type.symbol.declarations && type.symbol.declarations[0];
  }
  else if (ts.isCallExpression(node)) {
    const signature = typeChecker.getResolvedSignature(node);
    if (signature === undefined) {
      return;
    }
    declaration = signature.declaration;
  }
  if (declaration && ts.isFunctionDeclaration(declaration)
    && isApiModulePath(declaration.getSourceFile().fileName) && !!declaration.name) {
    const text = declaration.name.getText();
    if (text.charAt(0) !== "$" && typeof ApiMethod[text] === "number") {
      return ApiMethod[text];
    }
  }
  return;
}

function getArgumentCount(method: ApiMethod) {
  const countDef = apiArgCountMap[method];
  let minArgCount
    , argCount;

  if (typeof countDef === "number" && countDef >= 0) {
    minArgCount = argCount = countDef;
  }
  else if (Array.isArray(countDef)) {
    [minArgCount, argCount] = countDef;
  }

  return {
    minArgCount: minArgCount !== undefined ? minArgCount : 1,
    argCount: argCount !== undefined ? argCount : 1,
  };
}

function isTypeofMethod(method: ApiMethod): boolean {
  return method <= ApiMethod.$LAST_TYPEOF_METHOD;
}
function isBitMethod(method: ApiMethod): boolean {
  return method > ApiMethod.$LAST_TYPEOF_METHOD && method <= ApiMethod.$LAST_BIT_METHOD;
}

function isApiModulePath(filePath: string): boolean {
  return path.resolve(filePath).startsWith(path.join(__dirname, "index"));
}

function createGlobalIdentifier(program: ts.Program): ts.Identifier {
  const lib = program.getCompilerOptions().lib || [];

  if (lib.includes("lib.dom.d.ts")) {
    return ts.createIdentifier("window");
  }
  else if (lib.includes("lib.webworker.d.ts")) {
    return ts.createIdentifier("self");
  }

  return ts.createIdentifier("global");
}
