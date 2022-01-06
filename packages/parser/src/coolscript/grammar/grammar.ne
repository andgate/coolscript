@{%
const { Binding, VBool, VNumber, VString, VObject, TmLet, TmValue, TmVar, TmCall, TmLam } = require("@coolscript/syntax");
const moo = require("moo");

const lexer = moo.compile({
  ws:     /[ \t]+/,
  comment: /\/\/.*?$/,
  identifier:  /[a-zA-Z][a-zA-Z0-9]*/,
  number:    /[0-9]+/,
  dqstring:  /"(?:\\["\\]|[^\n"\\])*"/,
  sqstring:  /'(?:\\['\\]|[^\n'\\])*'/,
  keyword: [ "true", "false", ".", "+", "-", "(", ")", "{", "}", ":", ",", "=>", "error", "let", "in", ";", "=" ]
});
%}

# Pass your lexer object using the @lexer option:
@lexer lexer

main -> term {% id %}

file ->
  _ term _ {% ([,t,]) => t %}

_ -> %ws:? {% null %}

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

object ->
    "{" "}" {% () => ({}) %}
  | "{" _ object_entries _ ",":? _ "}" {% ([,,es,,,,]) => Object.fromEntries(es) %}

object_entries ->
    object_entry                        {% ([e]) => [e] %}
  | object_entries _ "," _ object_entry {% ([es,,,,e]) => [...es, e] %}

object_entry ->
    id _ ":" _ value {% ([k,,,,v]) => [k, v] %}

# Values
value -> vnumber {% id %} | vbool {% id %} | vobject {% id %} | vstring {% id %}
vnumber -> number {% ([n]) => VNumber(n) %}
vstring -> string {% ([s]) => VString(s.slice(1,-1)) %}
vbool -> bool {% ([b]) => VBool(b) %}
vobject -> object {% ([o]) => VObject(o) %}

# Terms
term  -> cterm {% id %}
cterm -> tmlam {% id %} | bterm {% id %}
bterm -> tmcall {% id %} | aterm {% id %}
aterm -> 
    tmvar {% id %}
  | tmvalue {% id %}
  | "(" _ term _ ")" {% ([,,t,,]) => t %}

tmvar ->
    id
      {% ([n]) => TmVar(n) %}
tmvalue ->
    value
      {% ([v]) => TmValue(v) %}

tmlet ->
    "let" _ let_binding_list _ "in" _ term
      {% ([,,bs,,,,t]) => TmLet(bs, t) %}

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
