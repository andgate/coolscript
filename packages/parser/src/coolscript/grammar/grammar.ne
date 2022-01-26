@{%
const moo = require("moo");
const { Token, Span, Merge } = require("@coolscript/syntax-concrete");
const {
  NullValue,
  NumberValue,
  StringValue,
  TrueValue,
  FalseValue,
  ValueTerm,
  VariableTerm,
  AssignmentTerm,
  LambdaTerm,
  CallTerm,
  LetTerm,
  VariableDeclaration,
  ParentheticalTerm,
  ArrayTerm,
  ObjectTerm,
  MemberAccessTerm,
  IndexAccessTerm,
  DoTerm,
  ConditionalTerm,
  ElifTerm,
  ElseTerm,
  AssignmentStatement,
  CallStatement,
  ReturnStatement,
  BlockStatement,
  IfStatement,
  BranchStatement,
  ElifStatement,
  ElseStatement,
  WhileStatement,
  DoWhileStatement,
  ForStatement
} = require("@coolscript/syntax-concrete");

const lexer = moo.compile({
  ws:         /[ \t\v\f]+/,
  newline:    { match: /[ \n]+/, lineBreaks: true },
  comment:    /\/\/.*?$/,
  identifier: /[a-zA-Z][a-zA-Z0-9]*/,
  number:     /[0-9]+/,
  dqstring:   { match: /"(?:\\["\\]|[^\n"\\])*"/, lineBreaks: true },
  sqstring:   { match: /'(?:\\['\\]|[^\n'\\])*'/, lineBreaks: true },
  keyword: [
    "null",
    "true", "false",
    "error", "let", "in", 
    "do", "if", "else", "elif", "while", "for",
    ".", "+", "-", "*", "/", "++", "--",
    "&&", "||", "==", "!=",
    "(", ")", "[", "]",
    "{", "}", ";", ":", ",",
    "=", "=>",
  ]
});
%}

# Pass your lexer object using the @lexer option:
@lexer lexer

main -> file {% id %}

file ->
  _ term _ {% ([,t,]) => t %}

_ -> 
    %ws:?    {% null %}
  | _ %comment _ {% null %}
  | _ %newline _ {% null %}

identifier_token -> %identifier {% ([i]) => Token(i) %}

null_token -> "null" {% ([t]) => Token(t) %}

number_token ->
    %number            
      {% ([t]) => Token(t) %}
  | %number "." %number
      {% ([t1, t2, t3]) => Token(t1, t2, t3) %}

string_token ->
    %sqstring {% ([t]) => Token(t) %}
  | %dqstring {% ([t]) => Token(t) %}

true_token ->
    "true"  {% ([t]) => Token(t) %}

false_token ->
    "false" {% ([t]) => Token(t) %}

# Values
value ->
    null_value   {% id %}
  | number_value {% id %}
  | boolean_value {% id %}
  | string_value {% id %}

null_value   -> null_token {% ([t]) => NullValue(t) %}
number_value -> number_token {% ([t]) => NumberValue(t) %}

string_value -> string_token {% ([t]) => StringValue(t) %}

boolean_value ->
    true_token  {% ([t]) => TrueValue(t) %}
  | false_token {% ([t]) => FalseValue(t) %}

# Terms
term  -> cterm {% id %}

cterm ->
    let_term            {% id %}
  | lambda_term         {% id %}
  | do_term             {% id %}
  | conditional_term    {% id %}
  | assignment_term     {% id %}
  | bterm               {% id %}

bterm ->
    call_term           {% id %}
  | member_access_term  {% id %}
  | index_access_term   {% id %}
  | aterm               {% id %}

aterm -> 
    value_term          {% id %}
  | variable_term       {% id %}
  | array_term          {% id %}
  | object_term         {% id %}
  | parenthetical_term  {% id %}

value_term -> value {% ([v]) => ValueTerm(v) %}

variable_term -> identifier_token {% ([t]) => VariableTerm(t) %}

assignment_term ->
    identifier_token _ "=" _ term
      {% ([v,,,,t]) => AssignmentTerm(v, t) %}

lambda_term ->
    "(" _ lambda_arguments _ ("," _):* ")" _ "=>" _ term
      {% ([t1,,args,,,,,,,body]) => LambdaTerm(args, body, Merge(Token(t1).span, body.ann.span)) %}

lambda_arguments ->
    identifier_token lambda_arguments_tail:*
      {% ([v, vs]) => [v.text, ...vs] %}

lambda_arguments_tail ->
    _ "," _ identifier_token
      {% ([,,,v]) => v.text %}

call_term ->
    bterm _ "(" _ call_arguments _ ("," _):* ")"
      {% (d) => CallTerm(d[0], d[4], Merge(d[0].ann.span, Token(d[7]).span)) %}

call_arguments ->
    bterm call_arguments_tail:*
      {% ([t, ts]) => [t, ...ts] %}

call_arguments_tail ->
    _ "," _ bterm
      {% ([,,,t]) => t %}

parenthetical_term ->
  "(" _ term _ ")"
    {% ([t1,,term,,t2]) => ParentheticalTerm(term, Merge(Token(t1).span, Token(t2).span)) %}

array_term ->
    "[" _ "]"
      {% ([t1,,t2]) => ArrayTerm([], Merge(Token(t1).span, Token(t2).span)) %}
  | "[" _ array_term_elements _ ("," _):*  "]"
      {% ([t1,,r,,,t2]) => ArrayTerm(r, Merge(Token(t1).span, Token(t2).span)) %}

array_term_elements ->
    term array_term_elements_tail:*
      {% ([t,ts]) => [t, ...ts] %}

array_term_elements_tail -> 
    _ "," _ term
      {% ([,,,t]) => t %}

object_term ->
    "{" _ "}"
      {% () => ObjectTerm({}, Merge(Token(t1).span, Token(t2).span)) %}
  | "{" _ object_term_entries _ ("," _):* "}"
      {% ([t1,,es,,,t2]) => ObjectTerm(Object.fromEntries(es), Merge(Token(t1).span, Token(t2).span)) %}

object_term_entries ->
    object_term_entry object_term_entries_tail:*
      {% ([e, es]) => [e, ...es] %}

object_term_entries_tail ->
    _ "," _ object_term_entry
      {% ([,,,e]) => e %}

object_term_entry ->
    identifier_token _ ":" _ term {% ([k,,,,t]) => [k.text, t] %}

member_access_term ->
    bterm _ "." _ identifier_token
      {% (d) => MemberAccessTerm(d[0], d[4]) %}

index_access_term ->
    bterm _ "[" _ bterm _ "]"
      {% ([a,,,,i,,t]) => IndexAccessTerm(a, i, Merge(a.ann.span, Token(t).span)) %}

let_term ->
    "let" _ let_declarations _ (";" _):* "in" _ term
      {% ([t1,,ds,,,,,body]) => LetTerm(ds, body, Merge(Token(t1).span, body.ann.span)) %}

let_declarations ->
    declaration let_declarations_tail:*
      {% ([d, ds]) => [d, ...ds] %}

let_declarations_tail ->
    _ ";" _ declaration
      {% ([,,,d]) => d %}

declaration ->
    variable_declaration {% id %}

variable_declaration ->
    identifier_token _ "=" _ term
      {% ([v,,,,body]) => VariableDeclaration(v, body) %}

do_term ->
    "do" _ block_statement
      {% ([t1,,block]) => DoTerm(block, Merge(Token(t1).span, block.ann.span)) %}

conditional_term ->
    "if" _ "(" _ term _ ")" _ term _ branch_term
      {% ([t1,,,,condition,,,,body,,branch]) => ConditionalTerm(condition, body, branch, Merge(Token(t1).span, branch.ann.span)) %}

branch_term ->
    "elif" _ "(" _ term _ ")" _ term _ branch_term
      {% ([t1,,,,condition,,,,body,,branch]) => ElifTerm(condition, body, branch, Merge(Token(t1).span, branch.ann.span)) %}
  | "else" _ term
      {% ([t,,body]) => ElseTerm(body, Merge(Token(t).span, body.ann.span)) %}

statement ->
    assignment_statement  {% id %}
  | call_statement        {% id %}
  | return_statement      {% id %}
  | block_statement       {% id %}
  | if_statement          {% id %}
  | while_statement       {% id %}
  | do_while_statement    {% id %}
  | for_statement         {% id %}

assignment_statement ->
    identifier_token _ "=" _ term
      {% ([lhs,,,,rhs]) => AssignmentStatement(lhs, rhs) %}

call_statement ->
    aterm _ "(" _ call_arguments _ ("," _):* ")"
      {% ([f,,,,args,,,t]) => CallStatement(f, args, Merge(f.ann.span, Token(t).span)) %}

return_statement ->
    "return" _ term
      {% ([t,,result]) => ReturnStatement(result, Merge(Token(t).span, result.ann.span)) %}

block_statement ->
    "{" _ statement_list:? _ (";" _):* "}"
      {% ([t1,,s,,,t2]) => BlockStatement(s, Merge(Token(t1).span, Token(t2).span)) %}
  
statement_list -> 
    statement statement_list_tail:*
      {% ([stmt, stmts]) => [stmt, ...stmts] %}

statement_list_tail ->
    _ ";" _ statement
      {% ([,,,s]) => s %}

if_statement ->
    "if" _ "(" _ term _ ")" _ statement _ branch_statement:?
      {% (r) => IfStatement(r[4], r[8], r[10], Merge(Token(r[0]).span, r[10] ? r[10].ann.span : r[8].ann.span)) %}

branch_statement ->
    "elif" _ "(" _ term _ ")" _ statement _ branch_statement:?
    {% (r) => ElifStatement(r[4], r[8], r[10], Merge(Token(r[0]).span, r[10] ? r[10].ann.span : r[8].ann.span)) %}
  | "else" _ term
    {% (r) => ElseStatement(r[2], Merge(Token(r[0]).span, r[2].ann.span)) %}

while_statement ->
  "while" _ "(" _ term _ ")" _ statement
    {% (r) => WhileStatement(r[4], r[8], Merge(Token(r[0]).span, r[8].ann.span)) %}

do_while_statement ->
   "do" _ statement _ "while" _ "(" _ term _ ")"
    {% (r) => DoWhileStatement(r[2], r[8], Merge(Token(r[0]).span, Token(r[10]).span)) %}

for_statement ->
  "for" _ "(" _ term _ ";" _ term _ ";" _ term _ ")" _ statement
    {% (r) => ForStatement(r[4], r[8], r[12], r[16], Merge(Token(r[0]).span, r[16].ann.span)) %}
