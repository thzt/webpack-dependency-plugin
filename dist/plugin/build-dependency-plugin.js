"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Dependency = require('../util/dependency');

var _require = require('../util/constant'),
    ENTRY = _require.ENTRY;

var getModuleResource = require('../util/get-module-resource');

var exceptionWrapper = require('../util/exception-wrapper');

var BuildDependencyPlugin =
/*#__PURE__*/
function () {
  function BuildDependencyPlugin(_ref) {
    var done = _ref.done,
        error = _ref.error;

    _classCallCheck(this, BuildDependencyPlugin);

    this._done = done;
    this._error = error;
    this._dependency = new Dependency();
  } // 获取当前构建module的父级module路径


  _createClass(BuildDependencyPlugin, [{
    key: "_getParentResource",
    value: function _getParentResource(module) {
      var _module$reasons = _slicedToArray(module.reasons, 1),
          reasonModule = _module$reasons[0].module; // 如果是顶级module，它没有父module，则返回ENTRY


      if (reasonModule == null) {
        return ENTRY;
      }

      var parentResource = getModuleResource(reasonModule);
      return parentResource;
    }
  }, {
    key: "apply",
    value: function apply(compiler) {
      var _this = this;

      var _done = this._done,
          _dependency = this._dependency; // compiler make 阶段

      compiler.plugin('make', function (compilation, callback) {
        // compilation build-module 阶段
        // 这里会得到一个依赖关系： parentResource -> resource
        compilation.plugin('build-module', exceptionWrapper.sync(function (module) {
          var resource = module.resource,
              _module$reasons2 = _slicedToArray(module.reasons, 1),
              reason = _module$reasons2[0];

          if (!reason || resource == null) {
            return;
          } // 获取当前构建module的父级module路径


          var parentResource = _this._getParentResource(module); // 添加一个依赖关系


          _dependency.add({
            parent: {
              key: parentResource
            },
            child: {
              key: resource,
              value: {
                startTime: +new Date()
              }
            }
          });
        }, _this._error)); // compilation succeed-module 阶段

        compilation.plugin('succeed-module', exceptionWrapper.sync(function (module) {
          var resource = module.resource,
              _module$reasons3 = _slicedToArray(module.reasons, 1),
              reason = _module$reasons3[0];

          if (!reason || resource == null) {
            return;
          } // 获取当前构建module的父级module路径


          var parentResource = _this._getParentResource(module); // 获取现有的父子依赖关系


          var childValue = _dependency.getChildValue({
            parent: {
              key: parentResource
            },
            child: {
              key: resource
            }
          }); // 给子节点添加endTime和elapse字段


          childValue.endTime = +new Date();
          childValue.elapse = childValue.endTime - childValue.startTime;
        }, _this._error)); // compiler make 的callback

        callback();
      });
      compiler.plugin('done', function () {
        return _done(_dependency.toJSON());
      });
    }
  }]);

  return BuildDependencyPlugin;
}();

module.exports = BuildDependencyPlugin;