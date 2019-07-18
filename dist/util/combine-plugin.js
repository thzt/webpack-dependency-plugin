"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/*
  将多个webpack plugin合并成一个插件

  （1）假设每个单独Plugin1，Plugin2的用法如下
  new Plugin1({
    a,
    b,
  });

  new Plugin2({
    x,
    y,
  });

  （2）则可以使用combinePlugin进行合并
  const Plugin = combinePlugin({
    name1: Plugin1,
    name2: Plugin2,
  });

  （3）合并后的Plugin用法如下（未实例化Plugin2）
  new Plugin({
    name1: {
      a,
      b,
    },
  });
*/
var combinePlugin = function combinePlugin(configs) {
  return (
    /*#__PURE__*/
    function () {
      function _class(args) {
        _classCallCheck(this, _class);

        this._plugins = Object.keys(configs).reduce(function (memo, key) {
          var arg = args[key]; // 合并后的插件，如果没传入某内部插件需要的参数，就不实例化它

          if (arg == null) {
            return memo;
          }

          var Plugin = configs[key];
          memo.push(new Plugin(arg));
          return memo;
        }, []);
      }

      _createClass(_class, [{
        key: "apply",
        value: function apply() {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          this._plugins.forEach(function (plugin) {
            return plugin.apply.apply(plugin, args);
          });
        }
      }]);

      return _class;
    }()
  );
};

module.exports = combinePlugin;