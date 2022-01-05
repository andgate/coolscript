@{%
const { VNumber, TmValue } = require("@coolscript/syntax");
const moo = require("moo");

const lexer = moo.compile({
  ws:     /[ \t]+/,
  number: /[0-9]+/,
  word: /[a-z]+/,
  times:  /\*|x/
});
%}

# Pass your lexer object using the @lexer option:
@lexer lexer

# Values
vnumber -> %number {%
  ([n]) => VNumber(n)
%}

value -> %vnumber

# Terms

tmvalue -> %value {%
  ([v]) => TmValue(v)
%}

term -> %tmvalue
