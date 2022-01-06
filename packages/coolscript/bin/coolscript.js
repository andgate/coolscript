// ../cli/lib/index.js
(() => {
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined")
      return require.apply(this, arguments);
    throw new Error('Dynamic require of "' + x + '" is not supported');
  });
  var import_parser = __require("@coolscript/parser");
  function cli2(args) {
    console.log((0, import_parser.parse)(args));
  }
})();

// src/index.ts
(void 0)("hello world");
