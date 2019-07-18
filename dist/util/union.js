"use strict";

/*
    用于对多个数组按数组元素名求并集，也可用于对单个数组中的元素去重。

    因为最后Object.keys返回的值是一个字符串数组，所以，参数arrays也应该是一个字符串数组。
    union只能用于对字符串数组求并集。
*/
var union = function union() {
  var cache = {};

  for (var _len = arguments.length, arrays = new Array(_len), _key = 0; _key < _len; _key++) {
    arrays[_key] = arguments[_key];
  }

  [].concat.apply([], arrays).forEach(function (item) {
    if (cache[item]) {
      return;
    }

    cache[item] = true;
  });
  return Object.keys(cache);
};

module.exports = union;