"use strict";

module.exports = {
  // fn的规范： 最后一个参数是callback
  // callback规范： 第一个参数为err，其余参数为返回值
  // 1. 不出错：正常返回
  // 2. 出错，提供了error：回调error，不回调callback
  // 3. 出错，未提供error：静默失败，callback(null,undefined)
  cps: function cps(fn, error) {
    return function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // 按约定args最后一个参数是callback
      var callback = args.pop();
      fn.apply(void 0, args.concat([function (err) {
        if (!err) {
          for (var _len2 = arguments.length, results = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            results[_key2 - 1] = arguments[_key2];
          }

          callback.apply(void 0, [null].concat(results));
          return;
        } // 如果未提供error回调，则静默失败


        if (!error) {
          callback(null);
          return;
        }

        error(err); // 出错之后不回调callback
      }]));
    };
  },
  // 1. 不出错：正常返回
  // 2. 出错，提供了error：回调error，返回undefined
  // 3. 出错，未提供error：静默失败，返回undefined
  sync: function sync(fn, error) {
    return function () {
      try {
        return fn.apply(void 0, arguments);
      } catch (err) {
        // 为了非侵入性，如果用户未传入error回调，则静默失败
        if (!error) {
          return;
        }

        error(err);
      }
    };
  }
};