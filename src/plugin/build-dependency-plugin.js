const Dependency = require('../util/dependency');
const { ENTRY } = require('../util/constant');
const getModuleResource = require('../util/get-module-resource');
const exceptionWrapper = require('../util/exception-wrapper');

class BuildDependencyPlugin {
  constructor({ done, error }) {
    this._done = done;
    this._error = error;
    this._dependency = new Dependency;
  }

  // 获取当前构建module的父级module路径
  _getParentResource(module) {
    const {
      reasons: [{
        module: reasonModule,
      }],
    } = module;

    // 如果是顶级module，它没有父module，则返回ENTRY
    if (reasonModule == null) {
      return ENTRY;
    }

    const parentResource = getModuleResource(reasonModule);
    return parentResource;
  }

  apply(compiler) {
    const {
      _done,
      _dependency,
    } = this;

    // compiler make 阶段
    compiler.plugin('make', (compilation, callback) => {

      // compilation build-module 阶段
      // 这里会得到一个依赖关系： parentResource -> resource
      compilation.plugin('build-module', exceptionWrapper.sync(module => {
        const { resource, reasons: [reason] } = module;
        if (!reason || resource == null) {
          return;
        }

        // 获取当前构建module的父级module路径
        const parentResource = this._getParentResource(module);

        // 添加一个依赖关系
        _dependency.add({
          parent: {
            key: parentResource,
          },
          child: {
            key: resource,
            value: {
              startTime: +new Date,
            }
          }
        });
      }, this._error));

      // compilation succeed-module 阶段
      compilation.plugin('succeed-module', exceptionWrapper.sync(module => {
        const { resource, reasons: [reason] } = module;
        if (!reason || resource == null) {
          return;
        }

        // 获取当前构建module的父级module路径
        const parentResource = this._getParentResource(module);

        // 获取现有的父子依赖关系
        const childValue = _dependency.getChildValue({
          parent: {
            key: parentResource,
          },
          child: {
            key: resource,
          },
        });

        // 给子节点添加endTime和elapse字段
        childValue.endTime = +new Date;
        childValue.elapse = childValue.endTime - childValue.startTime;
      }, this._error));

      // compiler make 的callback
      callback();
    });

    compiler.plugin('done', () => _done(_dependency.toJSON()));
  }
}

module.exports = BuildDependencyPlugin;
