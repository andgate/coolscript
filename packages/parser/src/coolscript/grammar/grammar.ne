@{%
const { Binding, VNull, VBool, VNumber, VString, TmNull, TmObject, TmLet, TmValue, TmVar, TmCall, TmLam, TmDo, DoBind, DoCommand, DoReturn } = require("@coolscript/syntax");
const moo = require("moo");

const lexer = moo.compile({
  ws:         /[ \t\v\f]+/,
  newline:    { match: /[ \n]+/, lineBreaks: true },
  comment:    /\/\/.*?$/,
  identifier: /[a-zA-Z][a-zA-Z0-9]*/,
  number:     /[0-9]+/,
  dqstring:   { match: /"(?:\\["\\]|[^\n"\\])*"/, lineBreaks: true },
  sqstring:   { match: /'(?:\\['\\]|[^\n'\\])*'/, lineBreaks: true },
  keyword: [ "true", "false", ".", "+", "-", "(", ")", "{", "}", ":", ",", "=>", "error", "let", "in", ";", "=", "do", "null" ]
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
value -> vnull {% id %} | vnumber {% id %} | vbool {% id %} | vstring {% id %}
vnull -> "null" {% _ => VNull %}
vnumber -> number {% ([n]) => VNumber(n) %}
vstring -> string {% ([s]) => VString(s.slice(1,-1)) %}
vbool -> bool {% ([b]) => VBool(b) %}

# Terms
term  -> cterm {% id %}
cterm -> tmlet {% id %} | tmlam {% id %} | bterm {% id %}
bterm -> tmcall {% id %} | aterm {% id %}
aterm -> 
    tmnull   {% id %}
  | tmvar   {% id %}
  | tmvalue {% id %}
  | object  {% ([o]) => TmObject(o) %}
  | "(" _ term _ ")" {% ([,,t,,]) => t %}
  | tmdo {% ([d]) => d %}

tmnull -> vnull {% _ => TmNull %}

tmvar ->
    id
      {% ([n]) => TmVar(n) %}
tmvalue ->
    value
      {% ([v]) => TmValue(v) %}

object ->
    "{" _ "}" {% () => ({}) %}
  | "{" _ object_entries _ ",":? _ "}" {% ([,,es,,,,]) => Object.fromEntries(es) %}

object_entries ->
    object_entry
      {% ([e]) => [e] %}
  | object_entries _ "," _ object_entry
      {% ([es,,,,e]) => [...es, e] %}

object_entry ->
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
    {% ([f,,,,xs,,,,]) => TmCall(f, xs) %}

call_args ->
    bterm 
      {% ([t]) => [t] %}
  | call_args _ "," _ bterm
      {% ([ts,,,,t]) => [...ts, t] %}

tmdo ->
  "do" _ "{" _ do_stmts _ ";":? _ "}"
    {% ([,,,,stmts,,,,]) => TmDo(stmts) %}

do_stmts ->
    do_stmt
      {% ([stmt]) => [stmt] %}
  | do_stmts _ ";" _ do_stmt
      {% ([stmts,,,,s]) => [...stmts, s] %}

do_stmt ->
    do_bind     {% id %}
  | do_command  {% id %}
  | do_return   {% id %}

do_bind ->
    varid _ "=" _ term
      {% ([v,,,,t]) => DoBind(v, t) %}

do_command ->
    term
      {% ([t]) => DoCommand(t) %}

do_return ->
    "return" _ term
      {% ([,,t]) => DoReturn(t) %}
