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
  ArrayTerm: () => ArrayTerm2,
  AssignmentStatement: () => AssignmentStatement2,
  AssignmentTerm: () => AssignmentTerm2,
  BlockStatement: () => BlockStatement2,
  CallStatement: () => CallStatement2,
  CallTerm: () => CallTerm2,
  ConditionalTerm: () => ConditionalTerm2,
  DoTerm: () => DoTerm2,
  DoWhileStatement: () => DoWhileStatement2,
  ElifStatement: () => ElifStatement2,
  ElifTerm: () => ElifTerm2,
  ElseStatement: () => ElseStatement2,
  ElseTerm: () => ElseTerm2,
  ErrorTerm: () => ErrorTerm2,
  FalseValue: () => FalseValue,
  ForStatement: () => ForStatement2,
  IfStatement: () => IfStatement2,
  IndexAccessTerm: () => IndexAccessTerm2,
  LambdaTerm: () => LambdaTerm2,
  LetTerm: () => LetTerm2,
  MemberAccessTerm: () => MemberAccessTerm2,
  Merge: () => Merge,
  NullValue: () => NullValue2,
  NumberValue: () => NumberValue2,
  ObjectTerm: () => ObjectTerm2,
  ParentheticalTerm: () => ParentheticalTerm2,
  ReturnStatement: () => ReturnStatement2,
  SourceToken: () => SourceToken,
  Span: () => Span,
  StringValue: () => StringValue2,
  Token: () => Token,
  TrueValue: () => TrueValue,
  ValueTerm: () => ValueTerm2,
  VariableDeclaration: () => VariableDeclaration2,
  VariableTerm: () => VariableTerm2,
  WhileStatement: () => WhileStatement2
});
function Span(lineStart, lineEnd, columnStart, columnEnd) {
  return {
    type: "Span",
    line: {
      start: lineStart,
      end: lineEnd
    },
    column: {
      start: columnStart,
      end: columnEnd
    }
  };
}
function Merge(spanLeft, spanRight) {
  return {
    type: "Span",
    line: {
      start: spanLeft.line.start,
      end: spanRight.line.end
    },
    column: {
      start: spanLeft.column.start,
      end: spanRight.column.end
    }
  };
}
function SourceToken(source) {
  const text = source.text;
  if (text.length == 0) {
    const l = source.line;
    const c = source.col;
    return {
      type: "Token",
      text: "",
      span: Span(l, l, c, c)
    };
  }
  const n = text.length - 1;
  const lineStart = source.line;
  const columnStart = source.col;
  let lineEnd = lineStart;
  let columnEnd = columnStart;
  for (let i = 0; i < n; i++) {
    if (text.charAt(i) == "\n") {
      columnEnd = 1;
      ++lineEnd;
      continue;
    }
    ++columnEnd;
  }
  return {
    type: "Token",
    text: source.text,
    span: Span(lineStart, lineEnd, columnStart, columnEnd)
  };
}
function Token(firstSource, ...otherSources) {
  let token = SourceToken(firstSource);
  const n = otherSources.length;
  if (otherSources && otherSources.length <= 0) {
    return token;
  }
  token.text += otherSources.map((s) => s.text).join("");
  const lastSource = otherSources[n - 1];
  const lastToken = SourceToken(lastSource);
  const span = Merge(token.span, lastToken.span);
  token.span = span;
  return token;
}
function NullValue(ann) {
  return { tag: "NullValue", ann };
}
function NumberValue(num, ann) {
  return { tag: "NumberValue", num, ann };
}
function StringValue(str, ann) {
  return { tag: "StringValue", str, ann };
}
function BooleanValue(bool, ann) {
  return { tag: "BooleanValue", bool, ann };
}
function ErrorTerm(msg, ann) {
  return { tag: "ErrorTerm", msg, ann };
}
function ValueTerm(value, ann) {
  return { tag: "ValueTerm", value, ann };
}
function VariableTerm(variable, ann) {
  return { tag: "VariableTerm", variable, ann };
}
function AssignmentTerm(lhs, rhs, ann) {
  return { tag: "AssignmentTerm", lhs, rhs, ann };
}
function LambdaTerm(args, body, ann) {
  return { tag: "LambdaTerm", args, body, ann };
}
function CallTerm(func, args, ann) {
  return { tag: "CallTerm", func, args, ann };
}
function LetTerm(declarations, body, ann) {
  return { tag: "LetTerm", declarations, body, ann };
}
function VariableDeclaration(variable, body, ann) {
  return { tag: "VariableDeclaration", variable, body, ann };
}
function ParentheticalTerm(term, ann) {
  return { tag: "ParentheticalTerm", term, ann };
}
function ArrayTerm(elements, ann) {
  return { tag: "ArrayTerm", elements, ann };
}
function ObjectTerm(entries, ann) {
  return { tag: "ObjectTerm", entries, ann };
}
function MemberAccessTerm(object, member, ann) {
  return {
    tag: "MemberAccessTerm",
    object,
    member,
    ann
  };
}
function IndexAccessTerm(array, index, ann) {
  return { tag: "IndexAccessTerm", array, index, ann };
}
function DoTerm(block, ann) {
  return { tag: "DoTerm", block, ann };
}
function ConditionalTerm(condition, body, branch, ann) {
  return { tag: "ConditionalTerm", condition, body, branch, ann };
}
function ElifTerm(condition, body, branch, ann) {
  return { tag: "ElifTerm", condition, body, branch, ann };
}
function ElseTerm(body, ann) {
  return { tag: "ElseTerm", body, ann };
}
function AssignmentStatement(lhs, rhs, ann) {
  return { tag: "AssignmentStatement", lhs, rhs, ann };
}
function CallStatement(func, args, ann) {
  return { tag: "CallStatement", func, args, ann };
}
function ReturnStatement(result, ann) {
  return { tag: "ReturnStatement", result, ann };
}
function BlockStatement(statements, ann) {
  return { tag: "BlockStatement", statements, ann };
}
function IfStatement(condition, body, branch, ann) {
  return { tag: "IfStatement", condition, body, branch, ann };
}
function ElifStatement(condition, body, branch, ann) {
  return { tag: "ElifStatement", condition, body, branch, ann };
}
function ElseStatement(body, ann) {
  return { tag: "ElseStatement", body, ann };
}
function WhileStatement(condition, body, ann) {
  return { tag: "WhileStatement", condition, body, ann };
}
function DoWhileStatement(body, condition, ann) {
  return { tag: "DoWhileStatement", body, condition, ann };
}
function ForStatement(declarations, condition, update, body, ann) {
  return { tag: "ForStatement", declarations, condition, update, body, ann };
}
function VariableDeclaration2(lhs, rhs) {
  return VariableDeclaration(lhs.text, rhs, {
    span: Merge(lhs.span, rhs.ann.span)
  });
}
function NullValue2(t) {
  return NullValue({ span: t.span });
}
function NumberValue2(t) {
  const num = parseFloat(t.text);
  return NumberValue(num, { span: t.span });
}
function StringValue2(t) {
  const sourceText = t.text;
  const text = sourceText.substring(1, sourceText.length - 1);
  return StringValue(text, { span: t.span });
}
function TrueValue(t) {
  return BooleanValue(true, { span: t.span });
}
function FalseValue(t) {
  return BooleanValue(false, { span: t.span });
}
function ErrorTerm2(msg, span) {
  return ErrorTerm(msg, { span });
}
function ValueTerm2(value) {
  return ValueTerm(value, { span: value.ann.span });
}
function VariableTerm2(variableToken) {
  return VariableTerm(variableToken.text, { span: variableToken.span });
}
function AssignmentTerm2(lhs, rhs) {
  return AssignmentTerm(lhs.text, rhs, {
    span: Merge(lhs.span, rhs.ann.span)
  });
}
function LambdaTerm2(args, body, span) {
  return LambdaTerm(args, body, { span });
}
function CallTerm2(func, args, span) {
  return CallTerm(func, args, { span });
}
function LetTerm2(declarations, body, span) {
  return LetTerm(declarations, body, { span });
}
function ParentheticalTerm2(term, span) {
  return ParentheticalTerm(term, { span });
}
function ArrayTerm2(elements, span) {
  return ArrayTerm(elements, { span });
}
function ObjectTerm2(entries, span) {
  return ObjectTerm(entries, { span });
}
function MemberAccessTerm2(object, memberToken) {
  return MemberAccessTerm(object, memberToken.text, {
    span: Merge(object.ann.span, memberToken.span)
  });
}
function IndexAccessTerm2(array, index, span) {
  return IndexAccessTerm(array, index, { span });
}
function DoTerm2(block, span) {
  return DoTerm(block, { span });
}
function ConditionalTerm2(condition, body, branch, span) {
  return ConditionalTerm(condition, body, branch, { span });
}
function ElifTerm2(condition, body, branch, span) {
  return ElifTerm(condition, body, branch, { span });
}
function ElseTerm2(body, span) {
  return ElseTerm(body, { span });
}
function AssignmentStatement2(lhs, rhs) {
  return AssignmentStatement(lhs.text, rhs, {
    span: Merge(lhs.span, rhs.ann.span)
  });
}
function CallStatement2(func, args, span) {
  return CallStatement(func, args, { span });
}
function ReturnStatement2(result, span) {
  return ReturnStatement(result, { span });
}
function BlockStatement2(statements, span) {
  return BlockStatement(statements, { span });
}
function IfStatement2(condition, body, branch, span) {
  return IfStatement(condition, body, branch, { span });
}
function ElifStatement2(condition, body, branch, span) {
  return ElifStatement(condition, body, branch, { span });
}
function ElseStatement2(body, span) {
  return ElseStatement(body, { span });
}
function WhileStatement2(condition, body, span) {
  return WhileStatement(condition, body, { span });
}
function DoWhileStatement2(body, condition, span) {
  return DoWhileStatement(body, condition, { span });
}
function ForStatement2(declarations, condition, update, body, span) {
  return ForStatement(declarations, condition, update, body, { span });
}
var init_lib = __esm({
  "../syntax-concrete/lib/index.js"() {
  }
});
var require_grammar = __commonJS({
  "nearley:C:\\Users\\zetta\\code\\coolscript\\packages\\parser\\src\\coolscript\\grammar\\grammar.ne"(exports, module) {
    (function() {
      function id(x) {
        return x[0];
      }
      const moo = require_moo();
      const { Token: Token2, Span: Span2, Merge: Merge2 } = (init_lib(), __toCommonJS(lib_exports));
      const {
        NullValue: NullValue3,
        NumberValue: NumberValue3,
        StringValue: StringValue3,
        TrueValue: TrueValue2,
        FalseValue: FalseValue2,
        ValueTerm: ValueTerm3,
        VariableTerm: VariableTerm3,
        AssignmentTerm: AssignmentTerm3,
        LambdaTerm: LambdaTerm3,
        CallTerm: CallTerm3,
        LetTerm: LetTerm3,
        VariableDeclaration: VariableDeclaration3,
        ParentheticalTerm: ParentheticalTerm3,
        ArrayTerm: ArrayTerm3,
        ObjectTerm: ObjectTerm3,
        MemberAccessTerm: MemberAccessTerm3,
        IndexAccessTerm: IndexAccessTerm3,
        DoTerm: DoTerm3,
        ConditionalTerm: ConditionalTerm3,
        ElifTerm: ElifTerm3,
        ElseTerm: ElseTerm3,
        AssignmentStatement: AssignmentStatement3,
        CallStatement: CallStatement3,
        ReturnStatement: ReturnStatement3,
        BlockStatement: BlockStatement3,
        IfStatement: IfStatement3,
        BranchStatement,
        ElifStatement: ElifStatement3,
        ElseStatement: ElseStatement3,
        WhileStatement: WhileStatement3,
        DoWhileStatement: DoWhileStatement3,
        ForStatement: ForStatement3
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
          "*",
          "/",
          "++",
          "--",
          "&&",
          "||",
          "==",
          "!=",
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
          { "name": "identifier_token", "symbols": [lexer.has("identifier") ? { type: "identifier" } : identifier], "postprocess": ([i]) => Token2(i) },
          { "name": "null_token", "symbols": [{ "literal": "null" }], "postprocess": ([t]) => Token2(t) },
          { "name": "number_token", "symbols": [lexer.has("number") ? { type: "number" } : number], "postprocess": ([t]) => Token2(t) },
          { "name": "number_token", "symbols": [lexer.has("number") ? { type: "number" } : number, { "literal": "." }, lexer.has("number") ? { type: "number" } : number], "postprocess": ([t12, t22, t3]) => Token2(t12, t22, t3) },
          { "name": "string_token", "symbols": [lexer.has("sqstring") ? { type: "sqstring" } : sqstring], "postprocess": ([t]) => Token2(t) },
          { "name": "string_token", "symbols": [lexer.has("dqstring") ? { type: "dqstring" } : dqstring], "postprocess": ([t]) => Token2(t) },
          { "name": "true_token", "symbols": [{ "literal": "true" }], "postprocess": ([t]) => Token2(t) },
          { "name": "false_token", "symbols": [{ "literal": "false" }], "postprocess": ([t]) => Token2(t) },
          { "name": "value", "symbols": ["null_value"], "postprocess": id },
          { "name": "value", "symbols": ["number_value"], "postprocess": id },
          { "name": "value", "symbols": ["boolean_value"], "postprocess": id },
          { "name": "value", "symbols": ["string_value"], "postprocess": id },
          { "name": "null_value", "symbols": ["null_token"], "postprocess": ([t]) => NullValue3(t) },
          { "name": "number_value", "symbols": ["number_token"], "postprocess": ([t]) => NumberValue3(t) },
          { "name": "string_value", "symbols": ["string_token"], "postprocess": ([t]) => StringValue3(t) },
          { "name": "boolean_value", "symbols": ["true_token"], "postprocess": ([t]) => TrueValue2(t) },
          { "name": "boolean_value", "symbols": ["false_token"], "postprocess": ([t]) => FalseValue2(t) },
          { "name": "term", "symbols": ["cterm"], "postprocess": id },
          { "name": "cterm", "symbols": ["let_term"], "postprocess": id },
          { "name": "cterm", "symbols": ["lambda_term"], "postprocess": id },
          { "name": "cterm", "symbols": ["do_term"], "postprocess": id },
          { "name": "cterm", "symbols": ["conditional_term"], "postprocess": id },
          { "name": "cterm", "symbols": ["assignment_term"], "postprocess": id },
          { "name": "cterm", "symbols": ["bterm"], "postprocess": id },
          { "name": "bterm", "symbols": ["call_term"], "postprocess": id },
          { "name": "bterm", "symbols": ["member_access_term"], "postprocess": id },
          { "name": "bterm", "symbols": ["index_access_term"], "postprocess": id },
          { "name": "bterm", "symbols": ["aterm"], "postprocess": id },
          { "name": "aterm", "symbols": ["value_term"], "postprocess": id },
          { "name": "aterm", "symbols": ["variable_term"], "postprocess": id },
          { "name": "aterm", "symbols": ["array_term"], "postprocess": id },
          { "name": "aterm", "symbols": ["object_term"], "postprocess": id },
          { "name": "aterm", "symbols": ["parenthetical_term"], "postprocess": id },
          { "name": "value_term", "symbols": ["value"], "postprocess": ([v]) => ValueTerm3(v) },
          { "name": "variable_term", "symbols": ["identifier_token"], "postprocess": ([t]) => VariableTerm3(t) },
          { "name": "assignment_term", "symbols": ["identifier_token", "_", { "literal": "=" }, "_", "term"], "postprocess": ([v, , , , t]) => AssignmentTerm3(v, t) },
          { "name": "lambda_term$ebnf$1", "symbols": [] },
          { "name": "lambda_term$ebnf$1$subexpression$1", "symbols": [{ "literal": "," }, "_"] },
          { "name": "lambda_term$ebnf$1", "symbols": ["lambda_term$ebnf$1", "lambda_term$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {
            return d[0].concat([d[1]]);
          } },
          { "name": "lambda_term", "symbols": [{ "literal": "(" }, "_", "lambda_arguments", "_", "lambda_term$ebnf$1", { "literal": ")" }, "_", { "literal": "=>" }, "_", "term"], "postprocess": ([t12, , args, , , , , , , body]) => LambdaTerm3(args, body, Merge2(Token2(t12).span, body.ann.span)) },
          { "name": "lambda_arguments$ebnf$1", "symbols": [] },
          { "name": "lambda_arguments$ebnf$1", "symbols": ["lambda_arguments$ebnf$1", "lambda_arguments_tail"], "postprocess": function arrpush(d) {
            return d[0].concat([d[1]]);
          } },
          { "name": "lambda_arguments", "symbols": ["identifier_token", "lambda_arguments$ebnf$1"], "postprocess": ([v, vs]) => [v.text, ...vs] },
          { "name": "lambda_arguments_tail", "symbols": ["_", { "literal": "," }, "_", "identifier_token"], "postprocess": ([, , , v]) => v.text },
          { "name": "call_term$ebnf$1", "symbols": [] },
          { "name": "call_term$ebnf$1$subexpression$1", "symbols": [{ "literal": "," }, "_"] },
          { "name": "call_term$ebnf$1", "symbols": ["call_term$ebnf$1", "call_term$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {
            return d[0].concat([d[1]]);
          } },
          { "name": "call_term", "symbols": ["bterm", "_", { "literal": "(" }, "_", "call_arguments", "_", "call_term$ebnf$1", { "literal": ")" }], "postprocess": (d) => CallTerm3(d[0], d[4], Merge2(d[0].ann.span, Token2(d[7]).span)) },
          { "name": "call_arguments$ebnf$1", "symbols": [] },
          { "name": "call_arguments$ebnf$1", "symbols": ["call_arguments$ebnf$1", "call_arguments_tail"], "postprocess": function arrpush(d) {
            return d[0].concat([d[1]]);
          } },
          { "name": "call_arguments", "symbols": ["bterm", "call_arguments$ebnf$1"], "postprocess": ([t, ts]) => [t, ...ts] },
          { "name": "call_arguments_tail", "symbols": ["_", { "literal": "," }, "_", "bterm"], "postprocess": ([, , , t]) => t },
          { "name": "parenthetical_term", "symbols": [{ "literal": "(" }, "_", "term", "_", { "literal": ")" }], "postprocess": ([t12, , term, , t22]) => ParentheticalTerm3(term, Merge2(Token2(t12).span, Token2(t22).span)) },
          { "name": "array_term", "symbols": [{ "literal": "[" }, "_", { "literal": "]" }], "postprocess": ([t12, , t22]) => ArrayTerm3([], Merge2(Token2(t12).span, Token2(t22).span)) },
          { "name": "array_term$ebnf$1", "symbols": [] },
          { "name": "array_term$ebnf$1$subexpression$1", "symbols": [{ "literal": "," }, "_"] },
          { "name": "array_term$ebnf$1", "symbols": ["array_term$ebnf$1", "array_term$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {
            return d[0].concat([d[1]]);
          } },
          { "name": "array_term", "symbols": [{ "literal": "[" }, "_", "array_term_elements", "_", "array_term$ebnf$1", { "literal": "]" }], "postprocess": ([t12, , r, , , t22]) => ArrayTerm3(r, Merge2(Token2(t12).span, Token2(t22).span)) },
          { "name": "array_term_elements$ebnf$1", "symbols": [] },
          { "name": "array_term_elements$ebnf$1", "symbols": ["array_term_elements$ebnf$1", "array_term_elements_tail"], "postprocess": function arrpush(d) {
            return d[0].concat([d[1]]);
          } },
          { "name": "array_term_elements", "symbols": ["term", "array_term_elements$ebnf$1"], "postprocess": ([t, ts]) => [t, ...ts] },
          { "name": "array_term_elements_tail", "symbols": ["_", { "literal": "," }, "_", "term"], "postprocess": ([, , , t]) => t },
          { "name": "object_term", "symbols": [{ "literal": "{" }, "_", { "literal": "}" }], "postprocess": () => ObjectTerm3({}, Merge2(Token2(t1).span, Token2(t2).span)) },
          { "name": "object_term$ebnf$1", "symbols": [] },
          { "name": "object_term$ebnf$1$subexpression$1", "symbols": [{ "literal": "," }, "_"] },
          { "name": "object_term$ebnf$1", "symbols": ["object_term$ebnf$1", "object_term$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {
            return d[0].concat([d[1]]);
          } },
          { "name": "object_term", "symbols": [{ "literal": "{" }, "_", "object_term_entries", "_", "object_term$ebnf$1", { "literal": "}" }], "postprocess": ([t12, , es, , , t22]) => ObjectTerm3(Object.fromEntries(es), Merge2(Token2(t12).span, Token2(t22).span)) },
          { "name": "object_term_entries$ebnf$1", "symbols": [] },
          { "name": "object_term_entries$ebnf$1", "symbols": ["object_term_entries$ebnf$1", "object_term_entries_tail"], "postprocess": function arrpush(d) {
            return d[0].concat([d[1]]);
          } },
          { "name": "object_term_entries", "symbols": ["object_term_entry", "object_term_entries$ebnf$1"], "postprocess": ([e, es]) => [e, ...es] },
          { "name": "object_term_entries_tail", "symbols": ["_", { "literal": "," }, "_", "object_term_entry"], "postprocess": ([, , , e]) => e },
          { "name": "object_term_entry", "symbols": ["identifier_token", "_", { "literal": ":" }, "_", "term"], "postprocess": ([k, , , , t]) => [k.text, t] },
          { "name": "member_access_term", "symbols": ["bterm", "_", { "literal": "." }, "_", "identifier_token"], "postprocess": (d) => MemberAccessTerm3(d[0], d[4]) },
          { "name": "index_access_term", "symbols": ["bterm", "_", { "literal": "[" }, "_", "bterm", "_", { "literal": "]" }], "postprocess": ([a, , , , i, , t]) => IndexAccessTerm3(a, i, Merge2(a.ann.span, Token2(t).span)) },
          { "name": "let_term$ebnf$1", "symbols": [] },
          { "name": "let_term$ebnf$1$subexpression$1", "symbols": [{ "literal": ";" }, "_"] },
          { "name": "let_term$ebnf$1", "symbols": ["let_term$ebnf$1", "let_term$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {
            return d[0].concat([d[1]]);
          } },
          { "name": "let_term", "symbols": [{ "literal": "let" }, "_", "let_declarations", "_", "let_term$ebnf$1", { "literal": "in" }, "_", "term"], "postprocess": ([t12, , ds, , , , , body]) => LetTerm3(ds, body, Merge2(Token2(t12).span, body.ann.span)) },
          { "name": "let_declarations$ebnf$1", "symbols": [] },
          { "name": "let_declarations$ebnf$1", "symbols": ["let_declarations$ebnf$1", "let_declarations_tail"], "postprocess": function arrpush(d) {
            return d[0].concat([d[1]]);
          } },
          { "name": "let_declarations", "symbols": ["declaration", "let_declarations$ebnf$1"], "postprocess": ([d, ds]) => [d, ...ds] },
          { "name": "let_declarations_tail", "symbols": ["_", { "literal": ";" }, "_", "declaration"], "postprocess": ([, , , d]) => d },
          { "name": "declaration", "symbols": ["variable_declaration"], "postprocess": id },
          { "name": "variable_declaration", "symbols": ["identifier_token", "_", { "literal": "=" }, "_", "term"], "postprocess": ([v, , , , body]) => VariableDeclaration3(v, body) },
          { "name": "do_term", "symbols": [{ "literal": "do" }, "_", "block_statement"], "postprocess": ([t12, , block]) => DoTerm3(block, Merge2(Token2(t12).span, block.ann.span)) },
          { "name": "conditional_term", "symbols": [{ "literal": "if" }, "_", { "literal": "(" }, "_", "term", "_", { "literal": ")" }, "_", "term", "_", "branch_term"], "postprocess": ([t12, , , , condition, , , , body, , branch]) => ConditionalTerm3(condition, body, branch, Merge2(Token2(t12).span, branch.ann.span)) },
          { "name": "branch_term", "symbols": [{ "literal": "elif" }, "_", { "literal": "(" }, "_", "term", "_", { "literal": ")" }, "_", "term", "_", "branch_term"], "postprocess": ([t12, , , , condition, , , , body, , branch]) => ElifTerm3(condition, body, branch, Merge2(Token2(t12).span, branch.ann.span)) },
          { "name": "branch_term", "symbols": [{ "literal": "else" }, "_", "term"], "postprocess": ([t, , body]) => ElseTerm3(body, Merge2(Token2(t).span, body.ann.span)) },
          { "name": "statement", "symbols": ["assignment_statement"], "postprocess": id },
          { "name": "statement", "symbols": ["call_statement"], "postprocess": id },
          { "name": "statement", "symbols": ["return_statement"], "postprocess": id },
          { "name": "statement", "symbols": ["block_statement"], "postprocess": id },
          { "name": "statement", "symbols": ["if_statement"], "postprocess": id },
          { "name": "statement", "symbols": ["while_statement"], "postprocess": id },
          { "name": "statement", "symbols": ["do_while_statement"], "postprocess": id },
          { "name": "statement", "symbols": ["for_statement"], "postprocess": id },
          { "name": "assignment_statement", "symbols": ["identifier_token", "_", { "literal": "=" }, "_", "term"], "postprocess": ([lhs, , , , rhs]) => AssignmentStatement3(lhs, rhs) },
          { "name": "call_statement$ebnf$1", "symbols": [] },
          { "name": "call_statement$ebnf$1$subexpression$1", "symbols": [{ "literal": "," }, "_"] },
          { "name": "call_statement$ebnf$1", "symbols": ["call_statement$ebnf$1", "call_statement$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {
            return d[0].concat([d[1]]);
          } },
          { "name": "call_statement", "symbols": ["aterm", "_", { "literal": "(" }, "_", "call_arguments", "_", "call_statement$ebnf$1", { "literal": ")" }], "postprocess": ([f, , , , args, , , t]) => CallStatement3(f, args, Merge2(f.ann.span, Token2(t).span)) },
          { "name": "return_statement", "symbols": [{ "literal": "return" }, "_", "term"], "postprocess": ([t, , result]) => ReturnStatement3(result, Merge2(Token2(t).span, result.ann.span)) },
          { "name": "block_statement$ebnf$1", "symbols": ["statement_list"], "postprocess": id },
          { "name": "block_statement$ebnf$1", "symbols": [], "postprocess": function(d) {
            return null;
          } },
          { "name": "block_statement$ebnf$2", "symbols": [] },
          { "name": "block_statement$ebnf$2$subexpression$1", "symbols": [{ "literal": ";" }, "_"] },
          { "name": "block_statement$ebnf$2", "symbols": ["block_statement$ebnf$2", "block_statement$ebnf$2$subexpression$1"], "postprocess": function arrpush(d) {
            return d[0].concat([d[1]]);
          } },
          { "name": "block_statement", "symbols": [{ "literal": "{" }, "_", "block_statement$ebnf$1", "_", "block_statement$ebnf$2", { "literal": "}" }], "postprocess": ([t12, , s, , , t22]) => BlockStatement3(s, Merge2(Token2(t12).span, Token2(t22).span)) },
          { "name": "statement_list$ebnf$1", "symbols": [] },
          { "name": "statement_list$ebnf$1", "symbols": ["statement_list$ebnf$1", "statement_list_tail"], "postprocess": function arrpush(d) {
            return d[0].concat([d[1]]);
          } },
          { "name": "statement_list", "symbols": ["statement", "statement_list$ebnf$1"], "postprocess": ([stmt, stmts]) => [stmt, ...stmts] },
          { "name": "statement_list_tail", "symbols": ["_", { "literal": ";" }, "_", "statement"], "postprocess": ([, , , s]) => s },
          { "name": "if_statement$ebnf$1", "symbols": ["branch_statement"], "postprocess": id },
          { "name": "if_statement$ebnf$1", "symbols": [], "postprocess": function(d) {
            return null;
          } },
          { "name": "if_statement", "symbols": [{ "literal": "if" }, "_", { "literal": "(" }, "_", "term", "_", { "literal": ")" }, "_", "statement", "_", "if_statement$ebnf$1"], "postprocess": (r) => IfStatement3(r[4], r[8], r[10], Merge2(Token2(r[0]).span, r[10] ? r[10].ann.span : r[8].ann.span)) },
          { "name": "branch_statement$ebnf$1", "symbols": ["branch_statement"], "postprocess": id },
          { "name": "branch_statement$ebnf$1", "symbols": [], "postprocess": function(d) {
            return null;
          } },
          { "name": "branch_statement", "symbols": [{ "literal": "elif" }, "_", { "literal": "(" }, "_", "term", "_", { "literal": ")" }, "_", "statement", "_", "branch_statement$ebnf$1"], "postprocess": (r) => ElifStatement3(r[4], r[8], r[10], Merge2(Token2(r[0]).span, r[10] ? r[10].ann.span : r[8].ann.span)) },
          { "name": "branch_statement", "symbols": [{ "literal": "else" }, "_", "term"], "postprocess": (r) => ElseStatement3(r[2], Merge2(Token2(r[0]).span, r[2].ann.span)) },
          { "name": "while_statement", "symbols": [{ "literal": "while" }, "_", { "literal": "(" }, "_", "term", "_", { "literal": ")" }, "_", "statement"], "postprocess": (r) => WhileStatement3(r[4], r[8], Merge2(Token2(r[0]).span, r[8].ann.span)) },
          { "name": "do_while_statement", "symbols": [{ "literal": "do" }, "_", "statement", "_", { "literal": "while" }, "_", { "literal": "(" }, "_", "term", "_", { "literal": ")" }], "postprocess": (r) => DoWhileStatement3(r[2], r[8], Merge2(Token2(r[0]).span, Token2(r[10]).span)) },
          { "name": "for_statement", "symbols": [{ "literal": "for" }, "_", { "literal": "(" }, "_", "term", "_", { "literal": ";" }, "_", "term", "_", { "literal": ";" }, "_", "term", "_", { "literal": ")" }, "_", "statement"], "postprocess": (r) => ForStatement3(r[4], r[8], r[12], r[16], Merge2(Token2(r[0]).span, r[16].ann.span)) }
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
function ParseSuccess(term, warnings) {
  return { term, warnings };
}
function ParseFail(warnings, ...errors) {
  return { term: null, errors, warnings };
}
function parse(src) {
  const parser = new nearley.Parser(coolscriptGrammar);
  const warnings = [];
  try {
    parser.feed(src);
  } catch (error) {
    let errorMsg = "";
    if (error && error.stack && error.message) {
      errorMsg = ` Error message: ${error.message}`;
    }
    const msg = `Parser failed!${errorMsg}`;
    const parserFailedError = new Error(msg);
    return ParseFail(warnings, parserFailedError);
  }
  if (!parser.results || !Array.isArray(parser.results) || parser.results.length == 0) {
    const noParseResultsError = new Error("No parse results were recovered.");
    return ParseFail(warnings, noParseResultsError);
  }
  if (parser.results.length > 1) {
    const ambiguousGrammarWarning = new Error("Ambiguous grammar encountered! Resolving first result.");
    warnings.push(ambiguousGrammarWarning);
  }
  const term = parser.results[0];
  return ParseSuccess(term, warnings);
}

// ../cli/lib/index.js
function cli(args) {
  console.log(parse(args));
}

// src/index.ts
cli("hello world");
