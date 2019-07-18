"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/* 
  由于webpack加载文件时有缓存，所以某些文件是不经历build阶段的，
  build-dependency-plugin中可能不包含某些文件。

  本插件的目的是获取所有文件的依赖关系，即使某些插件因为缓存原因没有build。
*/
var Graph = require('../util/graph');

var getModuleResource = require('../util/get-module-resource');

var exceptionWrapper = require('../util/exception-wrapper');

var ResolveDependencyPlugin =
/*#__PURE__*/
function () {
  function ResolveDependencyPlugin(_ref) {
    var done = _ref.done,
        error = _ref.error;

    _classCallCheck(this, ResolveDependencyPlugin);

    this._done = done;
    this._error = error;
    this._graph = new Graph();
  }

  _createClass(ResolveDependencyPlugin, [{
    key: "apply",
    value: function apply(compiler) {
      var _this = this;

      compiler.plugin('after-compile', exceptionWrapper.cps(function (compilation, callback) {
        // compilation: {
        //   entries: [
        //     {
        //       resource,
        //       dependencies: [
        //         {
        //           module: {
        //             resource,
        //             dependencies: [],
        //           },
        //         }
        //       ],
        //     }
        //   ],
        // }
        var entries = compilation.entries; // note: entries和dependencies不等价
        // entries的元素值就是module，而dependencies的元素值的module属性才是module。

        entries.forEach(function (_ref2) {
          var resource = _ref2.resource,
              dependencies = _ref2.dependencies;
          return _this._recursive(resource, dependencies);
        });
        callback(null, compilation);
      }, this._error));
      compiler.plugin('done', function () {
        return _this._done(_this._graph.toJSON());
      });
    }
  }, {
    key: "_recursive",
    value: function _recursive(resource, dependencies) {
      var _this2 = this;

      dependencies.forEach(function (_ref3) {
        var childModule = _ref3.module;

        if (childModule == null) {
          return;
        }

        var childResource = getModuleResource(childModule);

        _this2._graph.addEdges(resource, [childResource]); // 处理对于有循环依赖的情形
        // 如果顶点已经在有向图中存在了，就不继续处理了。


        var isCyclic = _this2._graph.getAllVertexes().some(function (vertex) {
          return vertex === childResource;
        });

        if (isCyclic) {
          return;
        }

        _this2._recursive(childResource, childModule.dependencies);
      });
    }
  }]);

  return ResolveDependencyPlugin;
}();

module.exports = ResolveDependencyPlugin;