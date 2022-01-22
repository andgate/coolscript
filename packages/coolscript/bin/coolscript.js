// ../parser/lib/index.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module, copyDefault, desc) => {
  if (module && typeof module === "object" || typeof module === "function") {
    for (let key of __getOwnPropNames(module))
      if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
        __defProp(target, key, { get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable });
  }
  return target;
};
var __toESM = (module, isNodeMode) => {
  return __reExport(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", !isNodeMode && module && module.__esModule ? { get: () => module.default, enumerable: true } : { value: module, enumerable: true })), module);
};
var __toCommonJS = /* @__PURE__ */ ((cache) => {
  return (module, temp) => {
    return cache && cache.get(module) || (temp = __reExport(__markAsModule({}), module, 1), cache && cache.set(module, temp), temp);
  };
})(typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : 0);
var require_nearley = __commonJS({
  "node_modules/.pnpm/nearley@2.20.1/node_modules/nearley/lib/nearley.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory();
      } else {
        root.nearley = factory();
      }
    })(exports, function() {
      function Rule(name, symbols, postprocess) {
        this.id = ++Rule.highestId;
        this.name = name;
        this.symbols = symbols;
        this.postprocess = postprocess;
        return this;
      }
      Rule.highestId = 0;
      Rule.prototype.toString = function(withCursorAt) {
        var symbolSequence = typeof withCursorAt === "undefined" ? this.symbols.map(getSymbolShortDisplay).join(" ") : this.symbols.slice(0, withCursorAt).map(getSymbolShortDisplay).join(" ") + " \u25CF " + this.symbols.slice(withCursorAt).map(getSymbolShortDisplay).join(" ");
        return this.name + " \u2192 " + symbolSequence;
      };
      function State(rule, dot, reference, wantedBy) {
        this.rule = rule;
        this.dot = dot;
        this.reference = reference;
        this.data = [];
        this.wantedBy = wantedBy;
        this.isComplete = this.dot === rule.symbols.length;
      }
      State.prototype.toString = function() {
        return "{" + this.rule.toString(this.dot) + "}, from: " + (this.reference || 0);
      };
      State.prototype.nextState = function(child) {
        var state = new State(this.rule, this.dot + 1, this.reference, this.wantedBy);
        state.left = this;
        state.right = child;
        if (state.isComplete) {
          state.data = state.build();
          state.right = void 0;
        }
        return state;
      };
      State.prototype.build = function() {
        var children = [];
        var node = this;
        do {
          children.push(node.right.data);
          node = node.left;
        } while (node.left);
        children.reverse();
        return children;
      };
      State.prototype.finish = function() {
        if (this.rule.postprocess) {
          this.data = this.rule.postprocess(this.data, this.reference, Parser2.fail);
        }
      };
      function Column(grammar, index) {
        this.grammar = grammar;
        this.index = index;
        this.states = [];
        this.wants = {};
        this.scannable = [];
        this.completed = {};
      }
      Column.prototype.process = function(nextColumn) {
        var states = this.states;
        var wants = this.wants;
        var completed = this.completed;
        for (var w = 0; w < states.length; w++) {
          var state = states[w];
          if (state.isComplete) {
            state.finish();
            if (state.data !== Parser2.fail) {
              var wantedBy = state.wantedBy;
              for (var i = wantedBy.length; i--; ) {
                var left = wantedBy[i];
                this.complete(left, state);
              }
              if (state.reference === this.index) {
                var exp = state.rule.name;
                (this.completed[exp] = this.completed[exp] || []).push(state);
              }
            }
          } else {
            var exp = state.rule.symbols[state.dot];
            if (typeof exp !== "string") {
              this.scannable.push(state);
              continue;
            }
            if (wants[exp]) {
              wants[exp].push(state);
              if (completed.hasOwnProperty(exp)) {
                var nulls = completed[exp];
                for (var i = 0; i < nulls.length; i++) {
                  var right = nulls[i];
                  this.complete(state, right);
                }
              }
            } else {
              wants[exp] = [state];
              this.predict(exp);
            }
          }
        }
      };
      Column.prototype.predict = function(exp) {
        var rules = this.grammar.byName[exp] || [];
        for (var i = 0; i < rules.length; i++) {
          var r = rules[i];
          var wantedBy = this.wants[exp];
          var s = new State(r, 0, this.index, wantedBy);
          this.states.push(s);
        }
      };
      Column.prototype.complete = function(left, right) {
        var copy = left.nextState(right);
        this.states.push(copy);
      };
      function Grammar2(rules, start) {
        this.rules = rules;
        this.start = start || this.rules[0].name;
        var byName = this.byName = {};
        this.rules.forEach(function(rule) {
          if (!byName.hasOwnProperty(rule.name)) {
            byName[rule.name] = [];
          }
          byName[rule.name].push(rule);
        });
      }
      Grammar2.fromCompiled = function(rules, start) {
        var lexer = rules.Lexer;
        if (rules.ParserStart) {
          start = rules.ParserStart;
          rules = rules.ParserRules;
        }
        var rules = rules.map(function(r) {
          return new Rule(r.name, r.symbols, r.postprocess);
        });
        var g = new Grammar2(rules, start);
        g.lexer = lexer;
        return g;
      };
      function StreamLexer() {
        this.reset("");
      }
      StreamLexer.prototype.reset = function(data, state) {
        this.buffer = data;
        this.index = 0;
        this.line = state ? state.line : 1;
        this.lastLineBreak = state ? -state.col : 0;
      };
      StreamLexer.prototype.next = function() {
        if (this.index < this.buffer.length) {
          var ch = this.buffer[this.index++];
          if (ch === "\n") {
            this.line += 1;
            this.lastLineBreak = this.index;
          }
          return { value: ch };
        }
      };
      StreamLexer.prototype.save = function() {
        return {
          line: this.line,
          col: this.index - this.lastLineBreak
        };
      };
      StreamLexer.prototype.formatError = function(token, message) {
        var buffer = this.buffer;
        if (typeof buffer === "string") {
          var lines = buffer.split("\n").slice(Math.max(0, this.line - 5), this.line);
          var nextLineBreak = buffer.indexOf("\n", this.index);
          if (nextLineBreak === -1)
            nextLineBreak = buffer.length;
          var col = this.index - this.lastLineBreak;
          var lastLineDigits = String(this.line).length;
          message += " at line " + this.line + " col " + col + ":\n\n";
          message += lines.map(function(line, i) {
            return pad(this.line - lines.length + i + 1, lastLineDigits) + " " + line;
          }, this).join("\n");
          message += "\n" + pad("", lastLineDigits + col) + "^\n";
          return message;
        } else {
          return message + " at index " + (this.index - 1);
        }
        function pad(n, length) {
          var s = String(n);
          return Array(length - s.length + 1).join(" ") + s;
        }
      };
      function Parser2(rules, start, options) {
        if (rules instanceof Grammar2) {
          var grammar = rules;
          var options = start;
        } else {
          var grammar = Grammar2.fromCompiled(rules, start);
        }
        this.grammar = grammar;
        this.options = {
          keepHistory: false,
          lexer: grammar.lexer || new StreamLexer()
        };
        for (var key in options || {}) {
          this.options[key] = options[key];
        }
        this.lexer = this.options.lexer;
        this.lexerState = void 0;
        var column = new Column(grammar, 0);
        var table = this.table = [column];
        column.wants[grammar.start] = [];
        column.predict(grammar.start);
        column.process();
        this.current = 0;
      }
      Parser2.fail = {};
      Parser2.prototype.feed = function(chunk) {
        var lexer = this.lexer;
        lexer.reset(chunk, this.lexerState);
        var token;
        while (true) {
          try {
            token = lexer.next();
            if (!token) {
              break;
            }
          } catch (e) {
            var nextColumn = new Column(this.grammar, this.current + 1);
            this.table.push(nextColumn);
            var err = new Error(this.reportLexerError(e));
            err.offset = this.current;
            err.token = e.token;
            throw err;
          }
          var column = this.table[this.current];
          if (!this.options.keepHistory) {
            delete this.table[this.current - 1];
          }
          var n = this.current + 1;
          var nextColumn = new Column(this.grammar, n);
          this.table.push(nextColumn);
          var literal = token.text !== void 0 ? token.text : token.value;
          var value = lexer.constructor === StreamLexer ? token.value : token;
          var scannable = column.scannable;
          for (var w = scannable.length; w--; ) {
            var state = scannable[w];
            var expect = state.rule.symbols[state.dot];
            if (expect.test ? expect.test(value) : expect.type ? expect.type === token.type : expect.literal === literal) {
              var next = state.nextState({ data: value, token, isToken: true, reference: n - 1 });
              nextColumn.states.push(next);
            }
          }
          nextColumn.process();
          if (nextColumn.states.length === 0) {
            var err = new Error(this.reportError(token));
            err.offset = this.current;
            err.token = token;
            throw err;
          }
          if (this.options.keepHistory) {
            column.lexerState = lexer.save();
          }
          this.current++;
        }
        if (column) {
          this.lexerState = lexer.save();
        }
        this.results = this.finish();
        return this;
      };
      Parser2.prototype.reportLexerError = function(lexerError) {
        var tokenDisplay, lexerMessage;
        var token = lexerError.token;
        if (token) {
          tokenDisplay = "input " + JSON.stringify(token.text[0]) + " (lexer error)";
          lexerMessage = this.lexer.formatError(token, "Syntax error");
        } else {
          tokenDisplay = "input (lexer error)";
          lexerMessage = lexerError.message;
        }
        return this.reportErrorCommon(lexerMessage, tokenDisplay);
      };
      Parser2.prototype.reportError = function(token) {
        var tokenDisplay = (token.type ? token.type + " token: " : "") + JSON.stringify(token.value !== void 0 ? token.value : token);
        var lexerMessage = this.lexer.formatError(token, "Syntax error");
        return this.reportErrorCommon(lexerMessage, tokenDisplay);
      };
      Parser2.prototype.reportErrorCommon = function(lexerMessage, tokenDisplay) {
        var lines = [];
        lines.push(lexerMessage);
        var lastColumnIndex = this.table.length - 2;
        var lastColumn = this.table[lastColumnIndex];
        var expectantStates = lastColumn.states.filter(function(state) {
          var nextSymbol = state.rule.symbols[state.dot];
          return nextSymbol && typeof nextSymbol !== "string";
        });
        if (expectantStates.length === 0) {
          lines.push("Unexpected " + tokenDisplay + ". I did not expect any more input. Here is the state of my parse table:\n");
          this.displayStateStack(lastColumn.states, lines);
        } else {
          lines.push("Unexpected " + tokenDisplay + ". Instead, I was expecting to see one of the following:\n");
          var stateStacks = expectantStates.map(function(state) {
            return this.buildFirstStateStack(state, []) || [state];
          }, this);
          stateStacks.forEach(function(stateStack) {
            var state = stateStack[0];
            var nextSymbol = state.rule.symbols[state.dot];
            var symbolDisplay = this.getSymbolDisplay(nextSymbol);
            lines.push("A " + symbolDisplay + " based on:");
            this.displayStateStack(stateStack, lines);
          }, this);
        }
        lines.push("");
        return lines.join("\n");
      };
      Parser2.prototype.displayStateStack = function(stateStack, lines) {
        var lastDisplay;
        var sameDisplayCount = 0;
        for (var j = 0; j < stateStack.length; j++) {
          var state = stateStack[j];
          var display = state.rule.toString(state.dot);
          if (display === lastDisplay) {
            sameDisplayCount++;
          } else {
            if (sameDisplayCount > 0) {
              lines.push("    ^ " + sameDisplayCount + " more lines identical to this");
            }
            sameDisplayCount = 0;
            lines.push("    " + display);
          }
          lastDisplay = display;
        }
      };
      Parser2.prototype.getSymbolDisplay = function(symbol) {
        return getSymbolLongDisplay(symbol);
      };
      Parser2.prototype.buildFirstStateStack = function(state, visited) {
        if (visited.indexOf(state) !== -1) {
          return null;
        }
        if (state.wantedBy.length === 0) {
          return [state];
        }
        var prevState = state.wantedBy[0];
        var childVisited = [state].concat(visited);
        var childResult = this.buildFirstStateStack(prevState, childVisited);
        if (childResult === null) {
          return null;
        }
        return [state].concat(childResult);
      };
      Parser2.prototype.save = function() {
        var column = this.table[this.current];
        column.lexerState = this.lexerState;
        return column;
      };
      Parser2.prototype.restore = function(column) {
        var index = column.index;
        this.current = index;
        this.table[index] = column;
        this.table.splice(index + 1);
        this.lexerState = column.lexerState;
        this.results = this.finish();
      };
      Parser2.prototype.rewind = function(index) {
        if (!this.options.keepHistory) {
          throw new Error("set option `keepHistory` to enable rewinding");
        }
        this.restore(this.table[index]);
      };
      Parser2.prototype.finish = function() {
        var considerations = [];
        var start = this.grammar.start;
        var column = this.table[this.table.length - 1];
        column.states.forEach(function(t) {
          if (t.rule.name === start && t.dot === t.rule.symbols.length && t.reference === 0 && t.data !== Parser2.fail) {
            considerations.push(t);
          }
        });
        return considerations.map(function(c) {
          return c.data;
        });
      };
      function getSymbolLongDisplay(symbol) {
        var type = typeof symbol;
        if (type === "string") {
          return symbol;
        } else if (type === "object") {
          if (symbol.literal) {
            return JSON.stringify(symbol.literal);
          } else if (symbol instanceof RegExp) {
            return "character matching " + symbol;
          } else if (symbol.type) {
            return symbol.type + " token";
          } else if (symbol.test) {
            return "token matching " + String(symbol.test);
          } else {
            throw new Error("Unknown symbol type: " + symbol);
          }
        }
      }
      function getSymbolShortDisplay(symbol) {
        var type = typeof symbol;
        if (type === "string") {
          return symbol;
        } else if (type === "object") {
          if (symbol.literal) {
            return JSON.stringify(symbol.literal);
          } else if (symbol instanceof RegExp) {
            return symbol.toString();
          } else if (symbol.type) {
            return "%" + symbol.type;
          } else if (symbol.test) {
            return "<" + String(symbol.test) + ">";
          } else {
            throw new Error("Unknown symbol type: " + symbol);
          }
        }
      }
      return {
        Parser: Parser2,
        Grammar: Grammar2,
        Rule
      };
    });
  }
});
var require_moo = __commonJS({
  "node_modules/.pnpm/moo@0.5.1/node_modules/moo/moo.js"(exports, module) {
    (function(root, factory) {
      if (typeof define === "function" && define.amd) {
        define([], factory);
      } else if (typeof module === "object" && module.exports) {
        module.exports = factory();
      } else {
        root.moo = factory();
      }
    })(exports, function() {
      "use strict";
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      var toString = Object.prototype.toString;
      var hasSticky = typeof new RegExp().sticky === "boolean";
      function isRegExp(o) {
        return o && toString.call(o) === "[object RegExp]";
      }
      function isObject(o) {
        return o && typeof o === "object" && !isRegExp(o) && !Array.isArray(o);
      }
      function reEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      }
      function reGroups(s) {
        var re = new RegExp("|" + s);
        return re.exec("").length - 1;
      }
      function reCapture(s) {
        return "(" + s + ")";
      }
      function reUnion(regexps) {
        if (!regexps.length)
          return "(?!)";
        var source = regexps.map(function(s) {
          return "(?:" + s + ")";
        }).join("|");
        return "(?:" + source + ")";
      }
      function regexpOrLiteral(obj) {
        if (typeof obj === "string") {
          return "(?:" + reEscape(obj) + ")";
        } else if (isRegExp(obj)) {
          if (obj.ignoreCase)
            throw new Error("RegExp /i flag not allowed");
          if (obj.global)
            throw new Error("RegExp /g flag is implied");
          if (obj.sticky)
            throw new Error("RegExp /y flag is implied");
          if (obj.multiline)
            throw new Error("RegExp /m flag is implied");
          return obj.source;
        } else {
          throw new Error("Not a pattern: " + obj);
        }
      }
      function objectToRules(object) {
        var keys = Object.getOwnPropertyNames(object);
        var result = [];
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          var thing = object[key];
          var rules = [].concat(thing);
          if (key === "include") {
            for (var j = 0; j < rules.length; j++) {
              result.push({ include: rules[j] });
            }
            continue;
          }
          var match = [];
          rules.forEach(function(rule) {
            if (isObject(rule)) {
              if (match.length)
                result.push(ruleOptions(key, match));
              result.push(ruleOptions(key, rule));
              match = [];
            } else {
              match.push(rule);
            }
          });
          if (match.length)
            result.push(ruleOptions(key, match));
        }
        return result;
      }
      function arrayToRules(array) {
        var result = [];
        for (var i = 0; i < array.length; i++) {
          var obj = array[i];
          if (obj.include) {
            var include = [].concat(obj.include);
            for (var j = 0; j < include.length; j++) {
              result.push({ include: include[j] });
            }
            continue;
          }
          if (!obj.type) {
            throw new Error("Rule has no type: " + JSON.stringify(obj));
          }
          result.push(ruleOptions(obj.type, obj));
        }
        return result;
      }
      function ruleOptions(type, obj) {
        if (!isObject(obj)) {
          obj = { match: obj };
        }
        if (obj.include) {
          throw new Error("Matching rules cannot also include states");
        }
        var options = {
          defaultType: type,
          lineBreaks: !!obj.error || !!obj.fallback,
          pop: false,
          next: null,
          push: null,
          error: false,
          fallback: false,
          value: null,
          type: null,
          shouldThrow: false
        };
        for (var key in obj) {
          if (hasOwnProperty.call(obj, key)) {
            options[key] = obj[key];
          }
        }
        if (typeof options.type === "string" && type !== options.type) {
          throw new Error("Type transform cannot be a string (type '" + options.type + "' for token '" + type + "')");
        }
        var match = options.match;
        options.match = Array.isArray(match) ? match : match ? [match] : [];
        options.match.sort(function(a, b) {
          return isRegExp(a) && isRegExp(b) ? 0 : isRegExp(b) ? -1 : isRegExp(a) ? 1 : b.length - a.length;
        });
        return options;
      }
      function toRules(spec) {
        return Array.isArray(spec) ? arrayToRules(spec) : objectToRules(spec);
      }
      var defaultErrorRule = ruleOptions("error", { lineBreaks: true, shouldThrow: true });
      function compileRules(rules, hasStates) {
        var errorRule = null;
        var fast = /* @__PURE__ */ Object.create(null);
        var fastAllowed = true;
        var unicodeFlag = null;
        var groups = [];
        var parts = [];
        for (var i = 0; i < rules.length; i++) {
          if (rules[i].fallback) {
            fastAllowed = false;
          }
        }
        for (var i = 0; i < rules.length; i++) {
          var options = rules[i];
          if (options.include) {
            throw new Error("Inheritance is not allowed in stateless lexers");
          }
          if (options.error || options.fallback) {
            if (errorRule) {
              if (!options.fallback === !errorRule.fallback) {
                throw new Error("Multiple " + (options.fallback ? "fallback" : "error") + " rules not allowed (for token '" + options.defaultType + "')");
              } else {
                throw new Error("fallback and error are mutually exclusive (for token '" + options.defaultType + "')");
              }
            }
            errorRule = options;
          }
          var match = options.match.slice();
          if (fastAllowed) {
            while (match.length && typeof match[0] === "string" && match[0].length === 1) {
              var word = match.shift();
              fast[word.charCodeAt(0)] = options;
            }
          }
          if (options.pop || options.push || options.next) {
            if (!hasStates) {
              throw new Error("State-switching options are not allowed in stateless lexers (for token '" + options.defaultType + "')");
            }
            if (options.fallback) {
              throw new Error("State-switching options are not allowed on fallback tokens (for token '" + options.defaultType + "')");
            }
          }
          if (match.length === 0) {
            continue;
          }
          fastAllowed = false;
          groups.push(options);
          for (var j = 0; j < match.length; j++) {
            var obj = match[j];
            if (!isRegExp(obj)) {
              continue;
            }
            if (unicodeFlag === null) {
              unicodeFlag = obj.unicode;
            } else if (unicodeFlag !== obj.unicode && options.fallback === false) {
              throw new Error("If one rule is /u then all must be");
            }
          }
          var pat = reUnion(match.map(regexpOrLiteral));
          var regexp = new RegExp(pat);
          if (regexp.test("")) {
            throw new Error("RegExp matches empty string: " + regexp);
          }
          var groupCount = reGroups(pat);
          if (groupCount > 0) {
            throw new Error("RegExp has capture groups: " + regexp + "\nUse (?: \u2026 ) instead");
          }
          if (!options.lineBreaks && regexp.test("\n")) {
            throw new Error("Rule should declare lineBreaks: " + regexp);
          }
          parts.push(reCapture(pat));
        }
        var fallbackRule = errorRule && errorRule.fallback;
        var flags = hasSticky && !fallbackRule ? "ym" : "gm";
        var suffix = hasSticky || fallbackRule ? "" : "|";
        if (unicodeFlag === true)
          flags += "u";
        var combined = new RegExp(reUnion(parts) + suffix, flags);
        return { regexp: combined, groups, fast, error: errorRule || defaultErrorRule };
      }
      function compile(rules) {
        var result = compileRules(toRules(rules));
        return new Lexer({ start: result }, "start");
      }
      function checkStateGroup(g, name, map) {
        var state = g && (g.push || g.next);
        if (state && !map[state]) {
          throw new Error("Missing state '" + state + "' (in token '" + g.defaultType + "' of state '" + name + "')");
        }
        if (g && g.pop && +g.pop !== 1) {
          throw new Error("pop must be 1 (in token '" + g.defaultType + "' of state '" + name + "')");
        }
      }
      function compileStates(states, start) {
        var all = states.$all ? toRules(states.$all) : [];
        delete states.$all;
        var keys = Object.getOwnPropertyNames(states);
        if (!start)
          start = keys[0];
        var ruleMap = /* @__PURE__ */ Object.create(null);
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          ruleMap[key] = toRules(states[key]).concat(all);
        }
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          var rules = ruleMap[key];
          var included = /* @__PURE__ */ Object.create(null);
          for (var j = 0; j < rules.length; j++) {
            var rule = rules[j];
            if (!rule.include)
              continue;
            var splice = [j, 1];
            if (rule.include !== key && !included[rule.include]) {
              included[rule.include] = true;
              var newRules = ruleMap[rule.include];
              if (!newRules) {
                throw new Error("Cannot include nonexistent state '" + rule.include + "' (in state '" + key + "')");
              }
              for (var k = 0; k < newRules.length; k++) {
                var newRule = newRules[k];
                if (rules.indexOf(newRule) !== -1)
                  continue;
                splice.push(newRule);
              }
            }
            rules.splice.apply(rules, splice);
            j--;
          }
        }
        var map = /* @__PURE__ */ Object.create(null);
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          map[key] = compileRules(ruleMap[key], true);
        }
        for (var i = 0; i < keys.length; i++) {
          var name = keys[i];
          var state = map[name];
          var groups = state.groups;
          for (var j = 0; j < groups.length; j++) {
            checkStateGroup(groups[j], name, map);
          }
          var fastKeys = Object.getOwnPropertyNames(state.fast);
          for (var j = 0; j < fastKeys.length; j++) {
            checkStateGroup(state.fast[fastKeys[j]], name, map);
          }
        }
        return new Lexer(map, start);
      }
      function keywordTransform(map) {
        var reverseMap = /* @__PURE__ */ Object.create(null);
        var byLength = /* @__PURE__ */ Object.create(null);
        var types = Object.getOwnPropertyNames(map);
        for (var i = 0; i < types.length; i++) {
          var tokenType = types[i];
          var item = map[tokenType];
          var keywordList = Array.isArray(item) ? item : [item];
          keywordList.forEach(function(keyword) {
            (byLength[keyword.length] = byLength[keyword.length] || []).push(keyword);
            if (typeof keyword !== "string") {
              throw new Error("keyword must be string (in keyword '" + tokenType + "')");
            }
            reverseMap[keyword] = tokenType;
          });
        }
        function str(x) {
          return JSON.stringify(x);
        }
        var source = "";
        source += "switch (value.length) {\n";
        for (var length in byLength) {
          var keywords = byLength[length];
          source += "case " + length + ":\n";
          source += "switch (value) {\n";
          keywords.forEach(function(keyword) {
            var tokenType2 = reverseMap[keyword];
            source += "case " + str(keyword) + ": return " + str(tokenType2) + "\n";
          });
          source += "}\n";
        }
        source += "}\n";
        return Function("value", source);
      }
      var Lexer = function(states, state) {
        this.startState = state;
        this.states = states;
        this.buffer = "";
        this.stack = [];
        this.reset();
      };
      Lexer.prototype.reset = function(data, info) {
        this.buffer = data || "";
        this.index = 0;
        this.line = info ? info.line : 1;
        this.col = info ? info.col : 1;
        this.queuedToken = info ? info.queuedToken : null;
        this.queuedThrow = info ? info.queuedThrow : null;
        this.setState(info ? info.state : this.startState);
        this.stack = info && info.stack ? info.stack.slice() : [];
        return this;
      };
      Lexer.prototype.save = function() {
        return {
          line: this.line,
          col: this.col,
          state: this.state,
          stack: this.stack.slice(),
          queuedToken: this.queuedToken,
          queuedThrow: this.queuedThrow
        };
      };
      Lexer.prototype.setState = function(state) {
        if (!state || this.state === state)
          return;
        this.state = state;
        var info = this.states[state];
        this.groups = info.groups;
        this.error = info.error;
        this.re = info.regexp;
        this.fast = info.fast;
      };
      Lexer.prototype.popState = function() {
        this.setState(this.stack.pop());
      };
      Lexer.prototype.pushState = function(state) {
        this.stack.push(this.state);
        this.setState(state);
      };
      var eat = hasSticky ? function(re, buffer) {
        return re.exec(buffer);
      } : function(re, buffer) {
        var match = re.exec(buffer);
        if (match[0].length === 0) {
          return null;
        }
        return match;
      };
      Lexer.prototype._getGroup = function(match) {
        var groupCount = this.groups.length;
        for (var i = 0; i < groupCount; i++) {
          if (match[i + 1] !== void 0) {
            return this.groups[i];
          }
        }
        throw new Error("Cannot find token type for matched text");
      };
      function tokenToString() {
        return this.value;
      }
      Lexer.prototype.next = function() {
        var index = this.index;
        if (this.queuedGroup) {
          var token = this._token(this.queuedGroup, this.queuedText, index);
          this.queuedGroup = null;
          this.queuedText = "";
          return token;
        }
        var buffer = this.buffer;
        if (index === buffer.length) {
          return;
        }
        var group = this.fast[buffer.charCodeAt(index)];
        if (group) {
          return this._token(group, buffer.charAt(index), index);
        }
        var re = this.re;
        re.lastIndex = index;
        var match = eat(re, buffer);
        var error = this.error;
        if (match == null) {
          return this._token(error, buffer.slice(index, buffer.length), index);
        }
        var group = this._getGroup(match);
        var text = match[0];
        if (error.fallback && match.index !== index) {
          this.queuedGroup = group;
          this.queuedText = text;
          return this._token(error, buffer.slice(index, match.index), index);
        }
        return this._token(group, text, index);
      };
      Lexer.prototype._token = function(group, text, offset) {
        var lineBreaks = 0;
        if (group.lineBreaks) {
          var matchNL = /\n/g;
          var nl = 1;
          if (text === "\n") {
            lineBreaks = 1;
          } else {
            while (matchNL.exec(text)) {
              lineBreaks++;
              nl = matchNL.lastIndex;
            }
          }
        }
        var token = {
          type: typeof group.type === "function" && group.type(text) || group.defaultType,
          value: typeof group.value === "function" ? group.value(text) : text,
          text,
          toString: tokenToString,
          offset,
          lineBreaks,
          line: this.line,
          col: this.col
        };
        var size = text.length;
        this.index += size;
        this.line += lineBreaks;
        if (lineBreaks !== 0) {
          this.col = size - nl + 1;
        } else {
          this.col += size;
        }
        if (group.shouldThrow) {
          throw new Error(this.formatError(token, "invalid syntax"));
        }
        if (group.pop)
          this.popState();
        else if (group.push)
          this.pushState(group.push);
        else if (group.next)
          this.setState(group.next);
        return token;
      };
      if (typeof Symbol !== "undefined" && Symbol.iterator) {
        var LexerIterator = function(lexer) {
          this.lexer = lexer;
        };
        LexerIterator.prototype.next = function() {
          var token = this.lexer.next();
          return { value: token, done: !token };
        };
        LexerIterator.prototype[Symbol.iterator] = function() {
          return this;
        };
        Lexer.prototype[Symbol.iterator] = function() {
          return new LexerIterator(this);
        };
      }
      Lexer.prototype.formatError = function(token, message) {
        if (token == null) {
          var text = this.buffer.slice(this.index);
          var token = {
            text,
            offset: this.index,
            lineBreaks: text.indexOf("\n") === -1 ? 0 : 1,
            line: this.line,
            col: this.col
          };
        }
        var start = Math.max(0, token.offset - token.col + 1);
        var eol = token.lineBreaks ? token.text.indexOf("\n") : token.text.length;
        var firstLine = this.buffer.substring(start, token.offset + eol);
        message += " at line " + token.line + " col " + token.col + ":\n\n";
        message += "  " + firstLine + "\n";
        message += "  " + Array(token.col).join(" ") + "^";
        return message;
      };
      Lexer.prototype.clone = function() {
        return new Lexer(this.states, this.state);
      };
      Lexer.prototype.has = function(tokenType) {
        return true;
      };
      return {
        compile,
        states: compileStates,
        error: Object.freeze({ error: true }),
        fallback: Object.freeze({ fallback: true }),
        keywords: keywordTransform
      };
    });
  }
});
var lib_exports = {};
__export(lib_exports, {
  AssignmentStatement: () => AssignmentStatement,
  Binding: () => Binding,
  BlockStatement: () => BlockStatement,
  CallStatement: () => CallStatement,
  ElifBranch: () => ElifBranch,
  ElseBranch: () => ElseBranch,
  ReturnStatement: () => ReturnStatement,
  TmArray: () => TmArray,
  TmAssign: () => TmAssign,
  TmCall: () => TmCall,
  TmDo: () => TmDo,
  TmError: () => TmError,
  TmFor: () => TmFor,
  TmIf: () => TmIf,
  TmLam: () => TmLam,
  TmLet: () => TmLet,
  TmObject: () => TmObject,
  TmParens: () => TmParens,
  TmValue: () => TmValue,
  TmVar: () => TmVar,
  TmWhile: () => TmWhile,
  VArray: () => VArray,
  VBool: () => VBool,
  VError: () => VError,
  VLam: () => VLam,
  VNull: () => VNull,
  VNumber: () => VNumber,
  VObject: () => VObject,
  VString: () => VString
});
function VNumber(num) {
  return { tag: "VNumber", num };
}
function VString(str) {
  return { tag: "VString", str };
}
function VBool(bool) {
  return { tag: "VBool", bool };
}
function VLam(args, body) {
  return { tag: "VLam", args, body };
}
function VArray(elements) {
  return { tag: "VArray", elements };
}
function VObject(obj) {
  return { tag: "VObject", obj };
}
function VError(err) {
  return { tag: "VError", err };
}
function TmError(msg, ann) {
  return { tag: "TmError", ann, msg };
}
function TmValue(value, ann) {
  return { tag: "TmValue", ann, value };
}
function TmVar(variable, ann) {
  return { tag: "TmVar", ann, variable };
}
function TmAssign(lhs, rhs, ann) {
  return { tag: "TmAssign", ann, lhs, rhs };
}
function TmLam(args, body, ann) {
  return { tag: "TmLam", ann, args, body };
}
function TmCall(caller, args, ann) {
  return { tag: "TmCall", ann, caller, args };
}
function TmLet(binders, body, ann) {
  return { tag: "TmLet", ann, binders, body };
}
function Binding(variable, body) {
  return { variable, body };
}
function TmParens(term, ann) {
  return { tag: "TmParens", ann, term };
}
function TmArray(elements = [], ann) {
  return { tag: "TmArray", ann, elements };
}
function TmObject(obj = {}, ann) {
  return { tag: "TmObject", ann, obj };
}
function TmDo(block, ann) {
  return { tag: "TmDo", ann, block };
}
function TmIf(pred, body, branch = null, ann) {
  return { tag: "TmIf", ann, pred, body, branch };
}
function ElifBranch(pred, body, branch = null) {
  return { tag: "Elif", pred, body, branch };
}
function ElseBranch(body) {
  return { tag: "Else", body };
}
function TmWhile(pred, body, ann) {
  return { tag: "TmWhile", ann, pred, body };
}
function TmFor(init, pred, iter, body, ann) {
  return { tag: "TmFor", ann, init, pred, iter, body };
}
function AssignmentStatement(lhs, rhs, ann) {
  return { tag: "AssignmentStatement", lhs, rhs, ann };
}
function CallStatement(fn, args, ann) {
  return { tag: "CallStatement", fn, args, ann };
}
function BlockStatement(statements, ann) {
  return { tag: "BlockStatement", statements, ann };
}
function ReturnStatement(result, ann) {
  return { tag: "ReturnStatement", result, ann };
}
var VNull;
var init_lib = __esm({
  "../syntax/lib/index.js"() {
    VNull = { tag: "VNull" };
  }
});
var require_grammar = __commonJS({
  "nearley:C:\\Users\\zetta\\code\\coolscript\\packages\\parser\\src\\coolscript\\grammar\\grammar.ne"(exports, module) {
    (function() {
      function id(x) {
        return x[0];
      }
      const moo = require_moo();
      const {
        VNull: VNull2,
        VNumber: VNumber2,
        VString: VString2,
        VBool: VBool2,
        TermBlock,
        TmValue: TmValue2,
        TmVar: TmVar2,
        TmAssign: TmAssign2,
        TmLam: TmLam2,
        TmReturn,
        TmCall: TmCall2,
        TmLet: TmLet2,
        Binding: Binding2,
        TmParens: TmParens2,
        TmArray: TmArray2,
        TmObject: TmObject2,
        TmDo: TmDo2,
        TmIf: TmIf2,
        ElifBranch: ElifBranch2,
        ElseBranch: ElseBranch2,
        TmWhile: TmWhile2,
        TmFor: TmFor2,
        AssignmentStatement: AssignmentStatement2,
        CallStatement: CallStatement2,
        ReturnStatement: ReturnStatement2,
        BlockStatement: BlockStatement2
      } = (init_lib(), __toCommonJS(lib_exports));
      const lexer = moo.compile({
        ws: /[ \t\v\f]+/,
        newline: { match: /[ \n]+/, lineBreaks: true },
        comment: /\/\/.*?$/,
        identifier: /[a-zA-Z][a-zA-Z0-9]*/,
        number: /[0-9]+/,
        dqstring: { match: /"(?:\\["\\]|[^\n"\\])*"/, lineBreaks: true },
        sqstring: { match: /'(?:\\['\\]|[^\n'\\])*'/, lineBreaks: true },
        keyword: [
          "null",
          "true",
          "false",
          "error",
          "let",
          "in",
          "do",
          "if",
          "else",
          "elif",
          "while",
          "for",
          ".",
          "+",
          "-",
          "(",
          ")",
          "[",
          "]",
          "{",
          "}",
          ";",
          ":",
          ",",
          "=",
          "=>"
        ]
      });
      var grammar = {
        Lexer: lexer,
        ParserRules: [
          { "name": "main", "symbols": ["file"], "postprocess": id },
          { "name": "file", "symbols": ["_", "term", "_"], "postprocess": ([, t]) => t },
          { "name": "_$ebnf$1", "symbols": [lexer.has("ws") ? { type: "ws" } : ws], "postprocess": id },
          { "name": "_$ebnf$1", "symbols": [], "postprocess": function(d) {
            return null;
          } },
          { "name": "_", "symbols": ["_$ebnf$1"], "postprocess": null },
          { "name": "_", "symbols": ["_", lexer.has("comment") ? { type: "comment" } : comment, "_"], "postprocess": null },
          { "name": "_", "symbols": ["_", lexer.has("newline") ? { type: "newline" } : newline, "_"], "postprocess": null },
          { "name": "id", "symbols": [lexer.has("identifier") ? { type: "identifier" } : identifier], "postprocess": ([i]) => i.value },
          { "name": "varid", "symbols": ["id"], "postprocess": id },
          { "name": "sign", "symbols": [{ "literal": "+" }], "postprocess": () => 1 },
          { "name": "sign", "symbols": [{ "literal": "-" }], "postprocess": () => -1 },
          { "name": "number", "symbols": [lexer.has("number") ? { type: "number" } : number], "postprocess": ([n]) => n.value },
          { "name": "number", "symbols": [lexer.has("number") ? { type: "number" } : number, { "literal": "." }, lexer.has("number") ? { type: "number" } : number], "postprocess": ([n1, , n2]) => `${n1.value}.${n2.value}` },
          { "name": "string", "symbols": [lexer.has("sqstring") ? { type: "sqstring" } : sqstring], "postprocess": ([t]) => t.value },
          { "name": "string", "symbols": [lexer.has("dqstring") ? { type: "dqstring" } : dqstring], "postprocess": ([t]) => t.value },
          { "name": "bool", "symbols": [{ "literal": "true" }], "postprocess": () => true },
          { "name": "bool", "symbols": [{ "literal": "false" }], "postprocess": () => false },
          { "name": "value", "symbols": ["vnull"], "postprocess": id },
          { "name": "value", "symbols": ["vnumber"], "postprocess": id },
          { "name": "value", "symbols": ["vbool"], "postprocess": id },
          { "name": "value", "symbols": ["vstring"], "postprocess": id },
          { "name": "vnull", "symbols": [{ "literal": "null" }], "postprocess": (_) => VNull2 },
          { "name": "vnumber", "symbols": ["number"], "postprocess": ([n]) => VNumber2(n) },
          { "name": "vstring", "symbols": ["string"], "postprocess": ([s]) => VString2(s.slice(1, -1)) },
          { "name": "vbool", "symbols": ["bool"], "postprocess": ([b]) => VBool2(b) },
          { "name": "term", "symbols": ["cterm"], "postprocess": id },
          { "name": "cterm", "symbols": ["tmlet"], "postprocess": id },
          { "name": "cterm", "symbols": ["tmlam"], "postprocess": id },
          { "name": "cterm", "symbols": ["tmdo"], "postprocess": id },
          { "name": "cterm", "symbols": ["tmif"], "postprocess": id },
          { "name": "cterm", "symbols": ["tmwhile"], "postprocess": id },
          { "name": "cterm", "symbols": ["tmfor"], "postprocess": id },
          { "name": "cterm", "symbols": ["bterm"], "postprocess": id },
          { "name": "bterm", "symbols": ["tmcall"], "postprocess": id },
          { "name": "bterm", "symbols": ["tmassign"], "postprocess": id },
          { "name": "bterm", "symbols": ["aterm"], "postprocess": id },
          { "name": "aterm", "symbols": ["tmvalue"], "postprocess": id },
          { "name": "aterm", "symbols": ["tmvar"], "postprocess": id },
          { "name": "aterm", "symbols": ["tmparens"], "postprocess": id },
          { "name": "aterm", "symbols": ["tmarray"], "postprocess": id },
          { "name": "aterm", "symbols": ["tmobject"], "postprocess": id },
          { "name": "tmvalue", "symbols": ["value"], "postprocess": ([v]) => TmValue2(v) },
          { "name": "tmvar", "symbols": ["id"], "postprocess": ([n]) => TmVar2(n) },
          { "name": "tmassign", "symbols": ["varid", "_", { "literal": "=" }, "_", "term"], "postprocess": ([v, , , , t]) => TmAssign2(v, t) },
          { "name": "tmlam$ebnf$1", "symbols": [{ "literal": "," }], "postprocess": id },
          { "name": "tmlam$ebnf$1", "symbols": [], "postprocess": function(d) {
            return null;
          } },
          { "name": "tmlam", "symbols": [{ "literal": "(" }, "_", "lam_args", "_", "tmlam$ebnf$1", "_", { "literal": ")" }, "_", { "literal": "=>" }, "_", "term"], "postprocess": ([, , vs, , , , , , , , t]) => TmLam2(vs, t) },
          { "name": "lam_args", "symbols": ["varid"], "postprocess": ([v]) => [v] },
          { "name": "lam_args", "symbols": ["lam_args", "_", { "literal": "," }, "_", "varid"], "postprocess": ([vs, , , , v]) => [...vs, v] },
          { "name": "tmcall$ebnf$1", "symbols": [{ "literal": "," }], "postprocess": id },
          { "name": "tmcall$ebnf$1", "symbols": [], "postprocess": function(d) {
            return null;
          } },
          { "name": "tmcall", "symbols": ["aterm", "_", { "literal": "(" }, "_", "call_args", "_", "tmcall$ebnf$1", "_", { "literal": ")" }], "postprocess": (d) => TmCall2(d[0], d[4]) },
          { "name": "call_args", "symbols": ["bterm"], "postprocess": ([t]) => [t] },
          { "name": "call_args", "symbols": ["call_args", "_", { "literal": "," }, "_", "bterm"], "postprocess": ([ts, , , , t]) => [...ts, t] },
          { "name": "tmparens", "symbols": [{ "literal": "(" }, "_", "term", "_", { "literal": ")" }], "postprocess": ([, , t, ,]) => TmParens2(t) },
          { "name": "tmarray", "symbols": [{ "literal": "[" }, "_", { "literal": "]" }], "postprocess": () => TmArray2() },
          { "name": "tmarray$ebnf$1", "symbols": [{ "literal": "," }], "postprocess": id },
          { "name": "tmarray$ebnf$1", "symbols": [], "postprocess": function(d) {
            return null;
          } },
          { "name": "tmarray", "symbols": [{ "literal": "[" }, "_", "tmarray_list", "_", "tmarray$ebnf$1", "_", { "literal": "]" }], "postprocess": (r) => TmArray2(r[2]) },
          { "name": "tmarray_list", "symbols": ["term"], "postprocess": ([e]) => [e] },
          { "name": "tmarray_list", "symbols": ["tmarray_list", "_", { "literal": "," }, "_", "term"], "postprocess": (r) => [...r[0], r[4]] },
          { "name": "tmobject", "symbols": [{ "literal": "{" }, "_", { "literal": "}" }], "postprocess": () => TmObject2() },
          { "name": "tmobject$ebnf$1", "symbols": [{ "literal": "," }], "postprocess": id },
          { "name": "tmobject$ebnf$1", "symbols": [], "postprocess": function(d) {
            return null;
          } },
          { "name": "tmobject", "symbols": [{ "literal": "{" }, "_", "tmobject_entries", "_", "tmobject$ebnf$1", "_", { "literal": "}" }], "postprocess": (r) => TmObject2(Object.fromEntries(r[2])) },
          { "name": "tmobject_entries", "symbols": ["tmobject_entry"], "postprocess": ([e]) => [e] },
          { "name": "tmobject_entries", "symbols": ["tmobject_entries", "_", { "literal": "," }, "_", "tmobject_entry"], "postprocess": ([es, , , , e]) => [...es, e] },
          { "name": "tmobject_entry", "symbols": ["id", "_", { "literal": ":" }, "_", "term"], "postprocess": ([k, , , , v]) => [k, v] },
          { "name": "tmlet$ebnf$1", "symbols": [{ "literal": ";" }], "postprocess": id },
          { "name": "tmlet$ebnf$1", "symbols": [], "postprocess": function(d) {
            return null;
          } },
          { "name": "tmlet", "symbols": [{ "literal": "let" }, "_", "let_binding_list", "_", "tmlet$ebnf$1", "_", { "literal": "in" }, "_", "term"], "postprocess": ([, , bs, , , , , , t]) => TmLet2(bs, t) },
          { "name": "let_binding_list", "symbols": ["let_binding"], "postprocess": ([b]) => [b] },
          { "name": "let_binding_list", "symbols": ["let_binding_list", "_", { "literal": ";" }, "_", "let_binding"], "postprocess": ([bs, , , , b]) => [...bs, b] },
          { "name": "let_binding", "symbols": ["varid", "_", { "literal": "=" }, "_", "term"], "postprocess": ([v, , , , t]) => Binding2(v, t) },
          { "name": "tmdo", "symbols": [{ "literal": "do" }, "_", "block_statement"], "postprocess": (r) => TmDo2(r[2]) },
          { "name": "tmif$ebnf$1", "symbols": ["branch"], "postprocess": id },
          { "name": "tmif$ebnf$1", "symbols": [], "postprocess": function(d) {
            return null;
          } },
          { "name": "tmif", "symbols": [{ "literal": "if" }, "_", { "literal": "(" }, "_", "term", "_", { "literal": ")" }, "_", "term", "_", "tmif$ebnf$1"], "postprocess": (r) => TmIf2(r[4], r[8], r[10]) },
          { "name": "branch$ebnf$1", "symbols": ["branch"], "postprocess": id },
          { "name": "branch$ebnf$1", "symbols": [], "postprocess": function(d) {
            return null;
          } },
          { "name": "branch", "symbols": [{ "literal": "elif" }, "_", { "literal": "(" }, "_", "term", "_", { "literal": ")" }, "_", "term", "_", "branch$ebnf$1"], "postprocess": (r) => ElifBranch2(r[4], r[8], r[10]) },
          { "name": "branch", "symbols": [{ "literal": "else" }, "_", "term"], "postprocess": (r) => ElseBranch2(r[2]) },
          { "name": "tmwhile", "symbols": [{ "literal": "while" }, "_", { "literal": "(" }, "_", "term", "_", { "literal": ")" }, "_", "term"], "postprocess": (r) => TmWhile2(r[4], r[8]) },
          { "name": "tmfor", "symbols": [{ "literal": "for" }, "_", { "literal": "(" }, "_", "term", "_", { "literal": ";" }, "_", "term", "_", { "literal": ";" }, "_", "term", "_", { "literal": ")" }, "_", "term"], "postprocess": (r) => TmWhile2(r[4], r[8], r[12], r[16]) },
          { "name": "statement", "symbols": ["sassign"], "postprocess": id },
          { "name": "statement", "symbols": ["scall"], "postprocess": id },
          { "name": "statement", "symbols": ["sreturn"], "postprocess": id },
          { "name": "statement", "symbols": ["block_statement"], "postprocess": id },
          { "name": "sassign", "symbols": ["id", "_", { "literal": "=" }, "_", "term"], "postprocess": (d) => AssignmentStatement2(d[0], d[4]) },
          { "name": "scall$ebnf$1", "symbols": [{ "literal": "," }], "postprocess": id },
          { "name": "scall$ebnf$1", "symbols": [], "postprocess": function(d) {
            return null;
          } },
          { "name": "scall", "symbols": ["aterm", "_", { "literal": "(" }, "_", "call_args", "_", "scall$ebnf$1", "_", { "literal": ")" }], "postprocess": (d) => CallStatement2(d[0], d[4]) },
          { "name": "sreturn", "symbols": [{ "literal": "return" }, "_", "term"], "postprocess": ([, , t]) => ReturnStatement2(t) },
          { "name": "block_statement$ebnf$1", "symbols": ["statement_list"], "postprocess": id },
          { "name": "block_statement$ebnf$1", "symbols": [], "postprocess": function(d) {
            return null;
          } },
          { "name": "block_statement$ebnf$2", "symbols": [{ "literal": ";" }], "postprocess": id },
          { "name": "block_statement$ebnf$2", "symbols": [], "postprocess": function(d) {
            return null;
          } },
          { "name": "block_statement", "symbols": [{ "literal": "{" }, "_", "block_statement$ebnf$1", "_", "block_statement$ebnf$2", "_", { "literal": "}" }], "postprocess": (r) => BlockStatement2(r[2]) },
          { "name": "statement_list", "symbols": ["statement"], "postprocess": ([t]) => [t] },
          { "name": "statement_list", "symbols": ["statement_list", "_", { "literal": ";" }, "_", "statement"], "postprocess": ([blk, , , , t]) => [...blk, t] }
        ],
        ParserStart: "main"
      };
      if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
        module.exports = grammar;
      } else {
        window.grammar = grammar;
      }
    })();
  }
});
var nearley = __toESM(require_nearley());
var import_nearley = __toESM(require_nearley());
var import_grammar = __toESM(require_grammar());
var coolscriptGrammar = import_nearley.Grammar.fromCompiled(import_grammar.default);
function parse(src) {
  const parser = new nearley.Parser(coolscriptGrammar);
  try {
    parser.feed(src);
  } catch (e) {
    console.error(e);
    return null;
  }
  if (parser.results.length > 1) {
    console.error("Ambiguous grammar encountered! Resolving first result.");
    return parser.results[1];
  }
  return parser.results[0];
}

// ../cli/lib/index.js
function cli(args) {
  console.log(parse(args));
}

// src/index.ts
cli("hello world");
