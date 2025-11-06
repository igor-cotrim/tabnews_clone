const { somar } = require("../models/calculator");

test("should somar(2, 2) return 4", () => {
  expect(somar(2, 2)).toBe(4);
});

test("should somar(5, 100) return 105", () => {
  expect(somar(5, 100)).toBe(105);
});
