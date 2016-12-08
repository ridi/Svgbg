var myGen = function*() {
  var one = yield 1;
  var two = yield 2;
  var three = yield 3;
  console.log(one, two, three);
};

var gen = myGen();

console.log(gen.next());
console.log(gen.next(4));
console.log(gen.next(5));
console.log(gen.next(6));
console.log(gen.next());
