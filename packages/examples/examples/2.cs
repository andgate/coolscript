// This is a comment
let
  id = (x) => x;
  constant = (a, b) => a;
  createFoo = (x) => {
    name: ["F", "o", "o", "b", "a", "r"],
    value: x
  };
  bar = 999;
  reverse = (s) => do {
    i = 0;
    j = s.length - 1;
    while (i < j) {
      tmp = s[i];
      s[i] = s[j];
      s[j] = tmp;
      i = i + 1;
      j = j - 1;
    };
    return s;
  };
in do {
  baz = id(bar);
  constant(baz, bar);
  clientName = createFoo(baz).name
  return reverse(clientName);
}
