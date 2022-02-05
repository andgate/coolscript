// This is a comment
let
  id = (x) => x;
  constant = (a, b) => a;
  createFoo = (x) => {
    name: ["F", "o", "o", "b", "a", "r"],
    value: x
  };
  bar = 999;
in do {
  baz = id(bar);
  constant(baz, bar);
  clientName = createFoo(baz).name;
  return clientName;
}
