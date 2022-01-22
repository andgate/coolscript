import type * as ES from 'estree'

export function Program(
  sourceType: 'script' | 'module',
  body: ES.Statement[]
): ES.Program {
  return { type: 'Program', sourceType, body }
}

export function Script(body: Array<ES.Statement>): ES.Program {
  return Program('script', body)
}

export function Function(
  id: string | null,
  params: Array<ES.Pattern>,
  body: Array<ES.Statement>
): ES.FunctionDeclaration {
  return {
    type: 'FunctionDeclaration',
    id: id ? Identifier(id) : null,
    params,
    body: BlockStatement(body),
    generator: false,
    async: false
  }
}

export function Identifier(name: string): ES.Identifier {
  return { type: 'Identifier', name }
}

export function Id(name: string): ES.Identifier {
  return Identifier(name)
}

export function ExpressionStatement(
  expression: ES.Expression
): ES.ExpressionStatement {
  return { type: 'ExpressionStatement', expression }
}

export function FunctionCallStatement(
  funcName: string,
  args: Array<ES.Expression>
): ES.ExpressionStatement {
  return ExpressionStatement(FunctionCallExpression(funcName, args))
}

export function BlockStatement(body: Array<ES.Statement>): ES.BlockStatement {
  return { type: 'BlockStatement', body }
}

export function CallExpression(
  func: ES.Expression,
  args: Array<ES.Expression>
): ES.CallExpression {
  return {
    type: 'CallExpression',
    callee: func,
    arguments: args,
    optional: false
  }
}

export function CallStatement(
  func: ES.Expression,
  args: Array<ES.Expression>
): ES.ExpressionStatement {
  return ExpressionStatement(CallExpression(func, args))
}

export function ThrowStatement(arg: ES.Expression): ES.ThrowStatement {
  return { type: 'ThrowStatement', argument: arg }
}

export function ThrowError(msg: string): ES.ThrowStatement {
  return ThrowStatement(New('Error', [Str(msg)]))
}

export function ReturnStatement(
  value: ES.Expression | null | undefined = null
): ES.ReturnStatement {
  return {
    type: 'ReturnStatement',
    argument: value
  }
}

export function AssignmentStatement(
  operator: ES.AssignmentOperator,
  left: ES.Pattern | ES.MemberExpression,
  right: ES.Expression
): ES.ExpressionStatement {
  return ExpressionStatement(AssignmentExpression(operator, left, right))
}

export function AssignStatement(left: string, right: ES.Expression) {
  return AssignmentStatement('=', Identifier(left), right)
}

export function VariableDeclaration(
  decls: Array<ES.VariableDeclarator>,
  kind: 'var' | 'let' | 'const'
): ES.VariableDeclaration {
  return {
    type: 'VariableDeclaration',
    declarations: decls,
    kind
  }
}

export function VariableDeclarator(
  id: ES.Pattern,
  init?: ES.Expression
): ES.VariableDeclarator {
  return { type: 'VariableDeclarator', id, init }
}

export function Const(id: string, init?: ES.Expression) {
  const v = VariableDeclarator(Identifier(id), init)
  return VariableDeclaration([v], 'const')
}

export function Let(id: string, init?: ES.Expression) {
  const v = VariableDeclarator(Identifier(id), init)
  return VariableDeclaration([v], 'let')
}

export function ClosureExpression(stmts: Array<ES.Statement>): ES.Expression {
  const f = LambdaExpression([], BlockStatement(stmts))
  return CallExpression(f, [])
}

export function ArrayExpression(
  elements: Array<ES.Expression | null>
): ES.ArrayExpression {
  return { type: 'ArrayExpression', elements }
}

export function ObjectExpression(
  properties: Array<ES.Property>
): ES.ObjectExpression {
  return { type: 'ObjectExpression', properties }
}

export function Property(key: string, value: ES.Expression): ES.Property {
  return {
    type: 'Property',
    key: Identifier(key),
    value,
    kind: 'init',
    method: false,
    shorthand: false,
    computed: false
  }
}

export function FunctionExpression(
  id: ES.Identifier | null | undefined,
  params: Array<ES.Pattern>,
  body: ES.BlockStatement
): ES.FunctionExpression {
  return {
    type: 'FunctionExpression',
    id,
    params,
    body
  }
}

export function LambdaExpression(
  params: Array<ES.Pattern>,
  body: ES.BlockStatement
): ES.FunctionExpression {
  return FunctionExpression(null, params, body)
}

export function ArrowFunctionExpression(
  params: Array<ES.Pattern>,
  body: ES.BlockStatement | ES.Expression
): ES.ArrowFunctionExpression {
  return {
    type: 'ArrowFunctionExpression',
    expression: body.type != 'BlockStatement',
    params,
    body
  }
}

export function FunctionCallExpression(
  funcName: string,
  args: Array<ES.Expression>
): ES.CallExpression {
  return CallExpression(Identifier(funcName), args)
}

export function NewExpression(
  constructor: ES.Expression,
  args: Array<ES.Expression>
): ES.NewExpression {
  return { type: 'NewExpression', callee: constructor, arguments: args }
}

export function New(
  constructorName: string,
  args: Array<ES.Expression>
): ES.NewExpression {
  return NewExpression(Identifier(constructorName), args)
}

export function SimpleLiteral(
  value: string | boolean | number | null
): ES.SimpleLiteral {
  return { type: 'Literal', value }
}

export function Str(str: string): ES.SimpleLiteral {
  return SimpleLiteral(str)
}

export function Bool(bool: boolean): ES.SimpleLiteral {
  return SimpleLiteral(bool)
}

export function Number(num: number): ES.SimpleLiteral {
  return SimpleLiteral(num)
}

export function Null(): ES.SimpleLiteral {
  return SimpleLiteral(null)
}

export function AssignmentExpression(
  operator: ES.AssignmentOperator,
  left: ES.Pattern | ES.MemberExpression,
  right: ES.Expression
): ES.AssignmentExpression {
  return {
    type: 'AssignmentExpression',
    operator,
    left,
    right
  }
}

export function Assign(
  lhs: string,
  rhs: ES.Expression
): ES.AssignmentExpression {
  return AssignmentExpression('=', Identifier(lhs), rhs)
}
