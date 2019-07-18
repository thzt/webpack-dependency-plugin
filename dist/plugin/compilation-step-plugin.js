"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Cabinet = require('../util/cabinet');

var _require = require('../util/error'),
    StepExistError = _require.StepExistError;

var _require2 = require('../util/constant'),
    ENTRY = _require2.ENTRY;

var getModuleResource = require('../util/get-module-resource');

var exceptionWrapper = require('../util/exception-wrapper');

var CompilationStepPlugin =
/*#__PURE__*/
function () {
  function CompilationStepPlugin(_ref) {
    var done = _ref.done,
        error = _ref.error;

    _classCallCheck(this, CompilationStepPlugin);

    this._done = done;
    this._error = error;
    this._cache = new Map();
  }

  _createClass(CompilationStepPlugin, [{
    key: "apply",
    value: function apply(compiler) {
      var _this = this;

      var cabinet = new Cabinet(); // start compile

      compiler.plugin('compile', exceptionWrapper.sync(function () {
        var stepName = 'start compile';

        if (_this._cache.has(stepName)) {
          throw new StepExistError(stepName);
        }

        _this._cache.set(stepName, +new Date());
      }, this._error)); // start compilation
      // note: 以下compilation hooks确保不会抛出异常，因此没有使用wrapException

      compiler.plugin('compilation', function (compilation) {
        var stepName = 'compilation';

        if (!_this._cache.has(stepName)) {
          _this._cache.set(stepName, cabinet);
        } // start make


        cabinet.put({
          drawer: compilation,
          gadget: {
            name: 'start make',
            time: +new Date()
          }
        }); // end make

        compilation.plugin('finish-modules', function (modules) {
          cabinet.put({
            drawer: compilation,
            gadget: {
              name: 'end make',
              time: +new Date()
            }
          });
        }); // start seal

        compilation.plugin('seal', function () {
          cabinet.put({
            drawer: compilation,
            gadget: {
              name: 'start seal',
              time: +new Date()
            }
          });
        }); // end chunk-asset

        compilation.plugin('chunk-asset', function (chunk, file) {
          cabinet.put({
            drawer: compilation,
            gadget: {
              name: 'end chunk-asset',
              time: +new Date(),
              file
            }
          });
        }); // start additional-assets

        compilation.plugin('additional-assets', function (callback) {
          cabinet.put({
            drawer: compilation,
            gadget: {
              name: 'start additional-assets',
              time: +new Date(),
              files: compilation.chunks.reduce(function (memo, _ref2) {
                var files = _ref2.files;
                return memo.concat(files);
              }, [])
            }
          });
          callback();
        }); // end optimize-chunk-assets

        compilation.plugin('after-optimize-chunk-assets', function (chunks) {
          cabinet.put({
            drawer: compilation,
            gadget: {
              name: 'end optimize-chunk-assets',
              time: +new Date()
            }
          });
        }); // end seal

        compilation.plugin('after-seal', function (callback) {
          cabinet.put({
            drawer: compilation,
            gadget: {
              name: 'end seal',
              time: +new Date()
            }
          });
          callback();
        });
      }); // start emit

      compiler.plugin('emit', exceptionWrapper.cps(function (compilation, callback) {
        // 捕获同步操作中的异常，用callback第一个参数返回
        try {
          var stepName = 'start emit';

          if (_this._cache.has(stepName)) {
            throw new StepExistError(stepName);
          }

          _this._cache.set(stepName, +new Date());

          callback();
        } catch (err) {
          callback(err);
        }
      }, this._error)); // done

      compiler.plugin('done', function () {
        // 为了不捕获this._done中的异常
        // wrap同步操作，返回一个json
        var fn = exceptionWrapper.sync(function () {
          var stepName = 'done';

          if (_this._cache.has(stepName)) {
            throw new StepExistError(stepName);
          }

          _this._cache.set(stepName, +new Date()); // 处理_cache中的数据，回调_done函数


          return _this._getDumpJSON();
        }, _this._error);
        var json = fn();

        _this._done(json);
      });
    }
  }, {
    key: "_getDumpJSON",
    value: function _getDumpJSON() {
      var _this2 = this;

      // note: Map的keys是按加入顺序保存的
      var stepNameList = Array.from(this._cache.keys());
      var json = stepNameList.reduce(function (memo, stepName) {
        var value = _this2._cache.get(stepName);

        if (value instanceof Cabinet) {
          var result = _this2._cabinetToJSON(value);

          memo.push({
            name: stepName,
            [ENTRY]: result
          });
          return memo;
        }

        memo.push({
          name: stepName,
          time: value
        });
        return memo;
      }, []);
      return json;
    }
  }, {
    key: "_cabinetToJSON",
    value: function _cabinetToJSON(cabinet) {
      var result = {};
      cabinet.getDrawerList().forEach(function (compilation) {
        // 一次compilation可能有多个entry
        compilation.entries.forEach(function (module) {
          var moduleResource = getModuleResource(module);
          var gadgetList = cabinet.getGadgetListFromDrawer(compilation);
          var lastTime = gadgetList[0].time;
          result[moduleResource] = gadgetList.map(function (gadget) {
            gadget.elapse = gadget.time - lastTime;
            lastTime = gadget.time;
            return gadget;
          });
        });
      });
      return result;
    }
  }]);

  return CompilationStepPlugin;
}();

module.exports = CompilationStepPlugin;