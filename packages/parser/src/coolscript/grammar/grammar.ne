@{%
const moo = require("moo");
const {
  VNull,
  VNumber,
  VString,
  VBool,
  TermBlock,
  TmValue,
  TmVar,
  TmAssign,
  TmLam,
  TmReturn,
  TmCall,
  TmLet,
  Binding,
  TmParens,
  TmArray,
  TmObject,
  TmDo,
  TmIf,
  ElifBranch,
  ElseBranch,
  TmWhile,
  TmFor,
  AssignmentStatement,
  CallStatement,
  ReturnStatement,
  BlockStatement,
} = require("@coolscript/syntax");

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
    ".", "+", "-",
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

id -> %identifier {% ([i]) => i.value %}
varid -> id {% id %}

sign ->
    "+" {% () =>  1 %}
  | "-" {% () => -1 %}

number ->
    %number            
      {% ([n]) => n.value %}
  | %number "." %number
      {% ([n1, ,n2]) => `${n1.value}.${n2.value}` %}

string ->
    %sqstring {% ([t]) => t.value %}
  | %dqstring {% ([t]) => t.value %}

bool ->
    "true"  {% () => true %}
  | "false" {% () => false %}

# Values
value ->
    vnull   {% id %}
  | vnumber {% id %}
  | vbool   {% id %}
  | vstring {% id %}

vnull   -> "null" {% _ => VNull %}
vnumber -> number {% ([n]) => VNumber(n) %}
vstring -> string {% ([s]) => VString(s.slice(1,-1)) %}
vbool   -> bool   {% ([b]) => VBool(b) %}

# Terms
term  -> cterm {% id %}

cterm ->
    tmlet   {% id %}
  | tmlam   {% id %}
  | tmdo    {% id %}
  | tmif    {% id %}
  | tmwhile {% id %}
  | tmfor   {% id %}
  | bterm   {% id %}

bterm ->
    tmcall   {% id %}
  | tmassign {% id %}
  | aterm    {% id %}

aterm -> 
    tmvalue  {% id %}
  | tmvar    {% id %}
  | tmparens {% id %}
  | tmarray  {% id %}
  | tmobject {% id %}

tmvalue -> value {% ([v]) => TmValue(v) %}

tmvar -> id {% ([n]) => TmVar(n) %}

tmassign ->
    varid _ "=" _ term
      {% ([v,,,,t]) => TmAssign(v, t) %}

tmlam ->
    "(" _ lam_args _ ",":? _ ")" _ "=>" _ term
      {% ([,,vs,,,,,,,,t]) => TmLam(vs, t) %}

lam_args ->
    varid
      {% ([v]) => [v] %}
  | lam_args _ "," _ varid
      {% ([vs,,,,v]) => [...vs, v] %}

tmcall ->
    aterm _ "(" _ call_args _ ",":? _ ")"
      {% (d) => TmCall(d[0], d[4]) %}

call_args ->
    bterm 
      {% ([t]) => [t] %}
  | call_args _ "," _ bterm
      {% ([ts,,,,t]) => [...ts, t] %}

tmparens ->
  "(" _ term _ ")"
    {% ([,,t,,]) => TmParens(t) %}

tmarray ->
    "[" _ "]"
      {% () => TmArray() %}
  | "[" _ tmarray_list _ ",":? _  "]"
      {% (r) => TmArray(r[2]) %}

tmarray_list ->
    term
      {% ([e]) => [e] %}
  | tmarray_list _ "," _ term
      {% (r) => [...r[0], r[4]] %}

tmobject ->
    "{" _ "}"
      {% () => TmObject() %}
  | "{" _ tmobject_entries _ ",":? _ "}"
      {% (r) => TmObject(Object.fromEntries(r[2])) %}

tmobject_entries ->
    tmobject_entry
      {% ([e]) => [e] %}
  | tmobject_entries _ "," _ tmobject_entry
      {% ([es,,,,e]) => [...es, e] %}

tmobject_entry ->
    id _ ":" _ term {% ([k,,,,v]) => [k, v] %}

tmlet ->
    "let" _ let_binding_list _ ";":? _ "in" _ term
      {% ([,,bs,,,,,,t]) => TmLet(bs, t) %}

let_binding_list ->
    let_binding
      {% ([b]) => [b] %}
  | let_binding_list _ ";" _ let_binding
      {% ([bs,,,,b]) => [...bs, b] %}

let_binding ->
    varid _ "=" _ term
      {% ([v,,,,t]) => Binding(v, t) %}

tmdo ->
  "do" _ block_statement
    {% (r) => TmDo(r[2]) %}

tmif ->
  "if" _ "(" _ term _ ")" _ term _ branch:?
    {% (r) => TmIf(r[4], r[8], r[10]) %}

branch ->
    "elif" _ "(" _ term _ ")" _ term _ branch:?
    {% (r) => ElifBranch(r[4], r[8], r[10]) %}
  | "else" _ term
    {% (r) => ElseBranch(r[2]) %}

tmwhile ->
  "while" _ "(" _ term _ ")" _ term
    {% (r) => TmWhile(r[4], r[8]) %}

tmfor ->
  "for" _ "(" _ term _ ";" _ term _ ";" _ term _ ")" _ term
    {% (r) => TmWhile(r[4], r[8], r[12], r[16]) %}

statement ->
    sassign {% id %}
  | scall   {% id %}
  | sreturn {% id %}
  | block_statement  {% id %}

sassign ->
    id _ "=" _ term {% (d) => AssignmentStatement(d[0], d[4]) %}

scall ->
    aterm _ "(" _ call_args _ ",":? _ ")"
      {% (d) => CallStatement(d[0], d[4]) %}

sreturn ->
    "return" _ term
      {% ([,,t]) => ReturnStatement(t) %}

block_statement ->
    "{" _ statement_list:? _ ";":? _ "}"
      {% (r) => BlockStatement(r[2]) %}
  
statement_list -> 
    statement
      {% ([t]) => [t] %}
  | statement_list _ ";" _ statement
      {% ([blk,,,,t]) => [...blk, t] %}
